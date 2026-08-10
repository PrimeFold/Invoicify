"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";
import type { PaginatedResult } from "@/types/pagination";
import type { TimeLog } from "@/types/timeLog";
import { invalidateDashboardCache } from "./dashboard";

type InvoiceLine = {
  timeLogId: string;
  description: string;
  hours: number;
  rate: number;
  lineTotal: number;
};

type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  client: {
    name: string;
    email: string;
  };
};

export type InvoiceSummary = {
  totalInvoices: number;
  collectedAmount: number;
  paidCount: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;
};

const INVOICE_PAGE_SIZE = 10;

export const getInvoices = async (
  page = 1
): Promise<PaginatedResult<InvoiceListItem>> => {
  const user = await requireUser();
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * INVOICE_PAGE_SIZE;
  const where = { userId: user.id };

  const [items, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: INVOICE_PAGE_SIZE,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    items,
    page: currentPage,
    pageSize: INVOICE_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / INVOICE_PAGE_SIZE),
    hasNextPage: skip + items.length < total,
    hasPreviousPage: currentPage > 1,
  };
};

export const getInvoiceSummary = async (): Promise<InvoiceSummary> => {
  const user = await requireUser();

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    select: {
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });

  const summary = invoices.reduce(
    (acc, inv) => {
      acc.totalInvoices += 1;
      if (inv.status === "PAID") {
        acc.collectedAmount += inv.totalAmount;
        acc.paidCount += 1;
      } else {
        acc.unpaidAmount += inv.totalAmount;
        acc.unpaidCount += 1;
      }
      return acc;
    },
    {
      totalInvoices: 0,
      collectedAmount: 0,
      paidCount: 0,
      unpaidAmount: 0,
      unpaidCount: 0,
      overdueAmount: 0,
      overdueCount: 0,
    }
  );

  return summary;
};

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function createInvoiceNumber(): string {
  const stamp = Date.now().toString().slice(-6);
  return `INV-${stamp}`;
}

export const getAllUnBilledLogsById = async (clientId: string) => {
  const user = await requireUser();
  const redis = getRedis();

  const key = `unbilled-logs:${user.id}:${clientId}`;
  const cache = await redis.get(key);

  if (cache) {
    return JSON.parse(cache);
  }

  const logs = await prisma.timeLog.findMany({
    where: {
      clientId,
      userId: user.id,
      status: "UNBILLED",
    },
    orderBy: {
      startTime: "asc",
    },
  });

  await redis.set(key, JSON.stringify(logs), "EX", 60);
  return logs;
};

export const calculateTotalHoursAndLines = async (clientId: string) => {
  const user = await requireUser();

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: user.id },
    select: { hourlyRate: true },
  });

  if (!client) {
    throw new Error("Client not found.");
  }

  const logs = await getAllUnBilledLogsById(clientId);
  const rate = client.hourlyRate;

  const items: InvoiceLine[] = logs.map((log: TimeLog) => {
    const hours = log.durationMinutes / 60;
    const lineTotal = roundCurrency(hours * rate);

    return {
      timeLogId: log.id,
      description: log.description,
      hours,
      rate,
      lineTotal,
    };
  });

  return {
    items,
    totalHours: items.reduce((total, item) => total + item.hours, 0),
    totalAmount: roundCurrency(
      items.reduce((total, item) => total + item.lineTotal, 0)
    ),
  };
};

export const getInvoiceById = async (invoiceId: string) => {
  const user = await requireUser();
  const redis = getRedis();
  const key = `invoice:${invoiceId}`;
  const cachedInvoice = await redis.get(key);

  if (cachedInvoice) {
    const invoice = JSON.parse(cachedInvoice);
    if (invoice.createdAt) invoice.createdAt = new Date(invoice.createdAt);
    return invoice;
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId: user.id,
    },
    include: {
      client: true,
      items: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const cache = JSON.stringify(invoice);
  await redis.set(key, cache, "EX", 120);

  return invoice;
};

export const generateInvoice = async (
  clientId: string,
  timeLogIds: string[]
) => {
  const redis = getRedis();

  if (timeLogIds.length === 0) {
    throw new Error("Select at least one time log to create an invoice.");
  }

  const user = await requireUser();

  const genKey = `invoice-gen:${user.id}:${clientId}:${[...timeLogIds].sort().join(",")}`;
  try {
    const cached = await redis.get(genKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.invoice) {
        if (parsed.invoice.createdAt)
          parsed.invoice.createdAt = new Date(parsed.invoice.createdAt);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Redis read failed for generation key:", err);
  }

  const { items, totalHours, totalAmount } =
    await calculateTotalHoursAndLines(clientId);

  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        userId: user.id,
        clientId,
        invoiceNumber: createInvoiceNumber(),
        totalAmount,
        items: {
          create: items.map(({ description, hours, rate, lineTotal }) => ({
            description,
            hours,
            rate,
            lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    const updatedLogs = await tx.timeLog.updateMany({
      where: {
        id: { in: timeLogIds },
        clientId,
        userId: user.id,
      },
      data: {
        status: "INVOICED",
      },
    });

    if (updatedLogs.count !== timeLogIds.length) {
      throw new Error("One or more selected time logs were already invoiced.");
    }

    return { invoice, totalHours };
  });

  // Clear Redis caches for this user & client
  try {
    await redis.del(`unbilled-timelogs:${user.id}:${clientId}`);
    await redis.del(`timelog-count:${user.id}:${clientId}`);
    await redis.del(`unbilled-logs:${user.id}:${clientId}`);
  } catch (err) {
    console.warn("Failed to clear Redis timelog cache:", err);
  }

  await invalidateDashboardCache(user.id);
  revalidatePath("/invoices");
  revalidatePath("/timelogs");
  revalidatePath("/clients");

  try {
    const key = `invoice:${result.invoice.id}`;
    await redis.set(key, JSON.stringify(result.invoice), "EX", 120);
    try {
      await redis.set(genKey, JSON.stringify(result), "EX", 120);
    } catch (err) {
      // ignore
    }
  } catch (err) {
    console.warn("Failed to cache invoice:", err);
  }

  return result;
};

export const deleteInvoice = async (clientId: string, timeLogIds: string[]) => {
  const user = await requireUser();

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.timeLog.updateMany({
        where: {
          clientId,
          userId: user.id,
          ...(timeLogIds ? { id: { in: timeLogIds } } : {}),
          status: "INVOICED",
        },
        data: {
          status: "UNBILLED",
        },
      });
    });

    await invalidateDashboardCache(user.id);
    revalidatePath("/invoices");
    revalidatePath("/timelogs");
    revalidatePath("/clients");

    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const markInvoiceAsPaid = async (invoiceId: string) => {
  const user = await requireUser();
  const redis = getRedis();

  try {
    const updated = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id,
      },
      data: {
        status: "PAID",
      },
    });

    try {
      await redis.del(`invoice:${invoiceId}`);
      await redis.del(`invoice-pdf:${invoiceId}`);
    } catch (err) {
      console.warn("Failed to clear Redis invoice cache:", err);
    }

    await invalidateDashboardCache(user.id);
    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return updated;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

