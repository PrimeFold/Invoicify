"use server";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";
import type { PaginatedResult } from "@/types/pagination";
import type { TimeLog } from "@/types/timeLog";
import { invalidateDashboardCache } from "./dashboard";

const DEFAULT_PAGE_SIZE = 10;

type CreateTimeLogInput = {
  clientId: string;
  description: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  status: "UNBILLED" | "INVOICED";
};

export const getUnbilledTimeLogs = async (clientId: string) => {
  const user = await requireUser();
  const redis = getRedis();
  const key = `unbilled-timelogs:${clientId}`;
  const cache = await redis.get(key);
  if (cache) {
    return;
  }
  try {
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: user.id,
        clientId,
        status: "UNBILLED",
      },
      select: {
        id: true,
        description: true,
        durationMinutes: true,
        startTime: true,
        endTime: true,
      },
    });

    await redis.set(key, JSON.stringify(timeLogs), "EX", 120);
    return timeLogs;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getUnbilledLogTimeLogCount = async (clientId:string) => {
  const user = await requireUser();
  const redis = getRedis();
  const key = `timelog-count:${clientId}`
  const cache = await redis.get(key);
  if (cache) {
    return;
  }
  try {
    const count = await prisma.timeLog.count({
      where: {
        userId: user.id,
        clientId,
        status:"UNBILLED"
      },
    })
    return count;
  } catch (error) {
    throw new Error((error as Error).message) || "Couldn't fetch count of the logs.."
  }
}


export const createTimeLog = async (data: CreateTimeLogInput) => {
  try {
    const user = await requireUser();
    const newTimeLog = await prisma.timeLog.create({
      data: {
        userId: user.id,
        clientId: data.clientId,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        status: data.status,
      },
      select: {
        userId: true,
        clientId: true,
        description: true,
        startTime: true,
        endTime: true,
        durationMinutes: true,
        status: true,
      },
    });
    await invalidateDashboardCache(user.id);
    return newTimeLog;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getTimeLogs = async (
  page: number
): Promise<PaginatedResult<TimeLog>> => {
  const user = await requireUser();

  const currentPage = Math.max(1, Number(page) || 1);
  const take = DEFAULT_PAGE_SIZE;
  const skip = (currentPage - 1) * take;
  const where = { userId: user.id };
  const [items, total] = await prisma.$transaction([
    prisma.timeLog.findMany({
      where,
      include: { client: true },
      orderBy: { startTime: "desc" },
      skip,
      take,
    }),
    prisma.timeLog.count({ where }),
  ]);

  return {
    items,
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
    hasNextPage: skip + items.length < total,
    hasPreviousPage: currentPage > 1,
  };
};

export const deleteTimeLog = async (id: string) => {
  const user = await requireUser();
  try {
    await prisma.timeLog.delete({
      where: {
        id,
        userId: user.id,
      },
    });
    await invalidateDashboardCache(user.id);
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
