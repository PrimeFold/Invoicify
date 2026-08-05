"use server";

import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60;
const cacheKey = (userId: string) => `dashboard-data:${userId}`;

async function loadDashboardData(userId: string) {
  const [clients, timeLogs, invoices] = await Promise.all([
    prisma.client.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, hourlyRate: true },
    }),
    prisma.timeLog.findMany({
      where: { userId },
      include: { client: { select: { hourlyRate: true } } },
    }),
    prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        invoiceNumber: true,
        clientId: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        client: { select: { name: true } },
      },
    }),
  ]);

  return { clients, timeLogs, invoices };
}

type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

export async function invalidateDashboardCache(userId: string) {
  try {
    await getRedis().del(cacheKey(userId));
  } catch(error) {
    // Cache failures must not undo a successful database mutation.
    console.log((error as Error).message)
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireUser();
  const key = cacheKey(user.id);
  let redis: ReturnType<typeof getRedis> | undefined;

  try {
    redis = getRedis();
    const cachedData = await redis.get(key);

    if (cachedData) {
      return JSON.parse(cachedData) as DashboardData;
    }
  } catch {
    // Redis is optional for reads: use the database when its connection is unavailable.
  }

  const dashboardData = await loadDashboardData(user.id);

  try {
    await redis?.set(key, JSON.stringify(dashboardData), "EX", CACHE_TTL_SECONDS);
  } catch {
    // The dashboard data is still valid even if it cannot be cached.
  }

  return dashboardData;
}
