"use server";

import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";
import { TimeLog } from "@/types/timeLog";
import type { PaginatedResult } from "@/types/pagination";
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

export const getInvoices = async (page = 1): Promise<PaginatedResult<InvoiceListItem>> => {
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
  const summaries = await prisma.invoice.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  const paid = summaries.find((summary) => summary.status === "PAID");
  const unpaid = summaries.find((summary) => summary.status === "UNPAID");

  return {
    totalInvoices: summaries.reduce((total, summary) => total + summary._count._all, 0),
    collectedAmount: paid?._sum.totalAmount ?? 0,
    paidCount: paid?._count._all ?? 0,
    unpaidAmount: unpaid?._sum.totalAmount ?? 0,
    unpaidCount: unpaid?._count._all ?? 0,
    // The schema has no due date or OVERDUE invoice status yet.
    overdueAmount: 0,
    overdueCount: 0,
  };
};


//Rounding off
const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

//Creation of Invoice number
const createInvoiceNumber = () => `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

//Getting all unbilled logs by client 
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

  if (logs.length === 0) {
    throw new Error("No unbilled time logs found for this client.");
  }

  // Cache for 2 minutes
  await redis.set(key, JSON.stringify(logs), "EX", 120);

  return logs;
};

export const calculateTotalHoursAndLines = async (
  clientId: string
) => {
  const user = await requireUser();

  // Fetch the rate from the database. Never trust a rate or line total sent by the client.
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: user.id },
    select: { hourlyRate: true },
  });

  if (!client) {
    throw new Error("Client not found.");
  }


  const logs = await getAllUnBilledLogsById(clientId);
  const rate = client.hourlyRate;

  const items: InvoiceLine[] = logs.map((log:TimeLog) => {
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
      items.reduce((total, item) => total + item.lineTotal, 0),
    ),
  };
};



export const getInvoiceById = async (invoiceId: string) => {
  const user = await requireUser();
  const redis= getRedis();
  const key = `invoice:${invoiceId}`
  const cachedInvoice = await redis.get(key);

  if(cachedInvoice){
    const invoice = JSON.parse(cachedInvoice);
    // normalize date fields (Redis stores strings)
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
  // set with expiry (120s)
  await redis.set(key, cache, "EX", 120);

  return invoice;
};

export const generateInvoice = async (
  clientId: string,
  timeLogIds: string[],
) => {
  const redis = getRedis();

  //Making sure timelog isn't empty..
  if (timeLogIds.length === 0) {
    throw new Error("Select at least one time log to create an invoice.");
  }

  const user = await requireUser();

  // Use a deterministic generation cache key so repeated "Generate" clicks
  // with the same timeLogIds won't create duplicate invoices or hit the DB.
  const genKey = `invoice-gen:${user.id}:${clientId}:${[...timeLogIds].sort().join(",")}`;
  try {
    const cached = await redis.get(genKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.invoice) {
        // restore createdAt
        if (parsed.invoice.createdAt) parsed.invoice.createdAt = new Date(parsed.invoice.createdAt);
        return parsed;
      }
    }
  } catch (err) {
    // non-fatal: continue to generate if Redis read fails
    // eslint-disable-next-line no-console
    console.warn("Redis read failed for generation key:", err);
  }

  const { items, totalHours, totalAmount } = await calculateTotalHoursAndLines(clientId, timeLogIds);

  //Making sure transaction happens per invoice mapping the items data to each record..
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

    //Updating timelog statuses as well..
    // The status condition prevents a log being invoiced twice by concurrent requests.
    const updatedLogs = await tx.timeLog.updateMany({
      where:{
        id:{in:timeLogIds},
        clientId,
        userId:user.id
      },
      data:{
        status:"INVOICED"
      }
    })

    if (updatedLogs.count !== timeLogIds.length) {
      throw new Error("One or more selected time logs were already invoiced.");
    }

    return { invoice, totalHours };
  });

  await invalidateDashboardCache(user.id);

  // cache the created invoice for quick subsequent reads
  try {
    const key = `invoice:${result.invoice.id}`;
    await redis.set(key, JSON.stringify(result.invoice), "EX", 120);
    // also cache the generation result so repeated generate requests return quickly
    try {
      await redis.set(genKey, JSON.stringify(result), "EX", 120);
    } catch (err) {
      // ignore generation cache failures
    }
  } catch (err) {
    // non-fatal: cache failure should not block invoice creation
    // eslint-disable-next-line no-console
    console.warn("Failed to cache invoice:", err);
  }

  return result;
};

export const deleteInvoice = async(
  clientId:string,
  timeLogIds:string[],
)=>{
  const user = await requireUser();

  try {
    const result = await prisma.$transaction(async(tx)=>{
      await tx.timeLog.updateMany({
        where:{
          clientId,
          userId:user.id,
           ...(timeLogIds ? { id: { in: timeLogIds } } : {}),
           status:"INVOICED"
        },
        data:{
          status:"UNBILLED"
        }
      })
    })

    await invalidateDashboardCache(user.id);
    return result;
  } catch (error) {
    throw new Error((error as Error).message)
  }

}
