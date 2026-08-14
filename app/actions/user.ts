"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";
import { invalidateDashboardCache } from "./dashboard";

const SIXTY_DAYS_SECONDS = 60 * 24 * 60 * 60; // 5,184,000 seconds (2 months)

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  nameChangeCooldown: {
    canChange: boolean;
    remainingDays: number;
  };
  emailChangeCooldown: {
    canChange: boolean;
    remainingDays: number;
  };
}

export async function getUserProfile(): Promise<UserProfileData> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    throw new Error("User account not found");
  }

  let nameRemainingDays = 0;
  let emailRemainingDays = 0;
  let canChangeName = true;
  let canChangeEmail = true;

  try {
    const redis = getRedis();
    const nameTtl = await redis.ttl(`user:name-limit:${user.id}`);
    const emailTtl = await redis.ttl(`user:email-limit:${user.id}`);

    if (nameTtl > 0) {
      canChangeName = false;
      nameRemainingDays = Math.ceil(nameTtl / (24 * 60 * 60));
    }

    if (emailTtl > 0) {
      canChangeEmail = false;
      emailRemainingDays = Math.ceil(emailTtl / (24 * 60 * 60));
    }
  } catch (error) {
    console.warn("Failed to check rate limit keys in Redis:", error);
  }

  return {
    ...dbUser,
    nameChangeCooldown: {
      canChange: canChangeName,
      remainingDays: nameRemainingDays,
    },
    emailChangeCooldown: {
      canChange: canChangeEmail,
      remainingDays: emailRemainingDays,
    },
  };
}

export async function updateProfileName(newName: string): Promise<{ success: boolean; name: string }> {
  const user = await requireUser();
  const trimmed = newName.trim();

  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) {
    throw new Error("Name must be between 2 and 50 characters long.");
  }

  // 1. Rate Limit Check (2 Months Cooldown)
  try {
    const redis = getRedis();
    const nameTtl = await redis.ttl(`user:name-limit:${user.id}`);
    if (nameTtl > 0) {
      const remainingDays = Math.ceil(nameTtl / (24 * 60 * 60));
      throw new Error(`Username can only be changed once every 2 months. Please wait ${remainingDays} more day(s).`);
    }
  } catch (error) {
    if ((error as Error).message.includes("once every 2 months")) {
      throw error;
    }
    console.warn("Redis check failed during name update:", error);
  }

  // 2. Database Update
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: trimmed },
  });

  // 3. Set Cooldown Key in Redis (60 Days)
  try {
    const redis = getRedis();
    await redis.set(`user:name-limit:${user.id}`, Date.now().toString(), "EX", SIXTY_DAYS_SECONDS);
  } catch (error) {
    console.warn("Failed to set Redis name rate limit key:", error);
  }

  // 4. Cache Revalidation
  await invalidateDashboardCache(user.id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/invoices");
  revalidatePath("/timelogs");

  return { success: true, name: updatedUser.name };
}

export async function updateProfileEmail(newEmail: string): Promise<{ success: boolean; email: string }> {
  const user = await requireUser();
  const trimmed = newEmail.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    throw new Error("Please enter a valid email address.");
  }

  // 1. Rate Limit Check (2 Months Cooldown)
  try {
    const redis = getRedis();
    const emailTtl = await redis.ttl(`user:email-limit:${user.id}`);
    if (emailTtl > 0) {
      const remainingDays = Math.ceil(emailTtl / (24 * 60 * 60));
      throw new Error(`Email address can only be changed once every 2 months. Please wait ${remainingDays} more day(s).`);
    }
  } catch (error) {
    if ((error as Error).message.includes("once every 2 months")) {
      throw error;
    }
    console.warn("Redis check failed during email update:", error);
  }

  // 2. Uniqueness Check
  const existing = await prisma.user.findFirst({
    where: {
      email: trimmed,
      NOT: { id: user.id },
    },
  });

  if (existing) {
    throw new Error("This email address is already in use by another account.");
  }

  // 3. Database Update
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { email: trimmed },
  });

  // 4. Set Cooldown Key in Redis (60 Days)
  try {
    const redis = getRedis();
    await redis.set(`user:email-limit:${user.id}`, Date.now().toString(), "EX", SIXTY_DAYS_SECONDS);
  } catch (error) {
    console.warn("Failed to set Redis email rate limit key:", error);
  }

  // 5. Cache Revalidation
  await invalidateDashboardCache(user.id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/invoices");
  revalidatePath("/timelogs");

  return { success: true, email: updatedUser.email };
}

export async function updateProfileAvatar(imageUrl: string | null): Promise<{ success: boolean; image: string | null }> {
  const user = await requireUser();

  // Rate limit: Max 5 avatar changes per minute
  try {
    const redis = getRedis();
    const key = `user:avatar-limit:${user.id}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60);
    }
    if (count > 5) {
      throw new Error("Too many avatar update requests. Please wait a minute.");
    }
  } catch (error) {
    if ((error as Error).message.includes("Too many avatar")) {
      throw error;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  await invalidateDashboardCache(user.id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true, image: updatedUser.image };
}

export async function deleteAccount(): Promise<{ success: boolean }> {
  const user = await requireUser();

  try {
    // Delete user from database (Prisma handles cascading sessions, accounts, clients, timelogs, invoices)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Invalidate Redis caches
    try {
      const redis = getRedis();
      const keys = await redis.keys(`*:${user.id}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      console.warn("Failed to clear Redis keys during account deletion:", err);
    }

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    throw new Error((error as Error).message || "Failed to delete user account.");
  }
}
