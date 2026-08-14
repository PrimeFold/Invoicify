import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3003",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 5,
  },
});
