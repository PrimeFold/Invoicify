//functions for all client related stuff..
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getRedis } from "@/lib/redis";
import type { Client } from "@/types/client";
import type { PaginatedResult } from "@/types/pagination";
import { clientSchema } from "../validations/zod";
import { invalidateDashboardCache } from "./dashboard";

const DEFAULT_PAGE_SIZE = 10;

export const getClients = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Client>> => {
  const user = await requireUser();
  const key = `clients:${user.id}:${page}:${pageSize}`;
  let redis: ReturnType<typeof getRedis> | undefined;

  try {
    redis = getRedis();
    const cachedClients = await redis.get(key);

    if (cachedClients) {
      return JSON.parse(cachedClients);
    }
  } catch (err) {
    console.warn("Failed to read cached clients:", err);
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const take = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const skip = (currentPage - 1) * take;
  const where = { userId: user.id };

  const [items, total] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.client.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  const returnValue = {
    items,
    page: currentPage,
    pageSize: take,
    total,
    totalPages,
    hasNextPage: skip + items.length < total,
    hasPreviousPage: currentPage > 1,
  } as PaginatedResult<Client>;

  try {
    await redis?.set(key, JSON.stringify(returnValue), "EX", 60);
  } catch (err) {
    // non-fatal
    console.warn("Failed to cache clients:", err);
  }

  return {
    items,
    page: currentPage,
    pageSize: take,
    total,
    totalPages,
    hasNextPage: skip + items.length < total,
    hasPreviousPage: currentPage > 1,
  };
};

export const getClientInformation = async (clientId: string) => {
  const user = await requireUser();

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    return client;
  } catch (error) {
    return (error as Error).message;
  }
};

export async function invalidateClientCache(userId: string) {
  try {
    const redis = getRedis();
    const keys = await redis.keys(`clients:${userId}:*`);
    const optionsKey = `options-clients:${userId}`;
    const allKeys = [...keys, optionsKey];

    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }
    await invalidateDashboardCache(userId);
  } catch (error) {
    console.warn("Failed to invalidate client cache:", (error as Error).message);
  }
}

export const createClient = async (client: Client) => {
  const user = await requireUser();
  const result = clientSchema.safeParse(client);

  if (!result.success) {
    throw new Error("Invalid client information");
  }

  try {
    const newClient = await prisma.client.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        name: result.data.name,
        email: result.data.email,
        hourlyRate: result.data.hourlyRate,
      } satisfies Prisma.ClientCreateInput,
    });
    await invalidateClientCache(user.id);
    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return newClient;
  } catch (error) {
    throw error;
  }
};

export const getClientById = async (clientId: string) => {
  const user = await requireUser();
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!client) {
      throw new Error("Client doesn't exist");
    }

    return client;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateClientName = async (clientId: string, name: string) => {
  const user = await requireUser();
  try {
    await prisma.client.update({
      where: {
        id: clientId,
        userId: user.id,
      },
      data: {
        name,
      },
    });

    await invalidateClientCache(user.id);
    revalidatePath("/clients");
    revalidatePath("/clients/[id]");
    revalidatePath("/dashboard");
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const deleteClient = async (clientId: string) => {
  const user = await requireUser();
  try {
    const client = await prisma.$transaction(async (tx) => {
      // 1. Find all invoice IDs belonging to this client
      const invoices = await tx.invoice.findMany({
        where: { clientId, userId: user.id },
        select: { id: true },
      });
      const invoiceIds = invoices.map((inv) => inv.id);

      // 2. Delete invoice items for those invoices
      if (invoiceIds.length > 0) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: { in: invoiceIds } },
        });
      }

      // 3. Delete invoices belonging to this client
      await tx.invoice.deleteMany({
        where: { clientId, userId: user.id },
      });

      // 4. Delete time logs belonging to this client
      await tx.timeLog.deleteMany({
        where: { clientId, userId: user.id },
      });

      // 5. Delete the client record
      return await tx.client.delete({
        where: {
          id: clientId,
          userId: user.id,
        },
      });
    });

    await invalidateClientCache(user.id);
    revalidatePath("/clients");
    revalidatePath("/clients/[id]");
    revalidatePath("/dashboard");
    return client;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
export async function getClientOptions() {
  const user = await requireUser();
  const key = `options-clients:${user.id}`;
  const redis = getRedis();
  const cache = await redis.get(key);

  if (cache) {
    return JSON.parse(cache);
  }
  const clientOptions = await prisma.client.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  try {
    await redis.set(key, JSON.stringify(clientOptions), "EX", 120);
  } catch (error) {
    //Caching errors shouldn't interrupt regular operations..
    console.warn((error as Error).message);
  }

  return clientOptions;
}
