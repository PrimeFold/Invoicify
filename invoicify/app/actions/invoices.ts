"use server";

import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { getRedis } from "@/lib/redis";
import { TimeLog } from "@/types/timeLog";

type InvoiceLine = {
  timeLogId: string;
  description: string;
  hours: number;
  rate: number;
  lineTotal: number;
};


//Rounding off
const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

//Creation of Invoice number
const createInvoiceNumber = () => `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

//Getting all unbilled logs by client and timelog ids-(array)..
// `timeLogIds` is optional: may omit it to invoice every unbilled log for the client.
export const getAllUnBilledLogsById = async (clientId: string,timeLogIds?: string[]) => {
  const user = await requireUser();
  const redis = getRedis();
  if(!timeLogIds){
    throw new Error("Time logs not detected!")
  }
  const key = `unbilled-logs:${user.id}:${clientId}:${[...timeLogIds].sort().join(",")}`
  const cache = await redis.get(key);

  if(cache){
    return JSON.parse(cache);
  }

  const logs = await prisma.timeLog.findMany({
    where: {
      clientId,
      userId: user.id,
      status: "UNBILLED",
      ...(timeLogIds ? { id: { in: timeLogIds } } : {}), //finds and adds each matching record to the array , if not found then empty item..
    },
    orderBy: { startTime: "asc" },
  });


  //Checks to see if there are logs available or not..
  if (logs.length === 0) {
    throw new Error("No unbilled time logs found for this client.");
  }

  //Checks to ensure the timeLog Ids array's length is the same as logs array length..
  if (timeLogIds && logs.length !== timeLogIds.length) {
    throw new Error("One or more selected time logs cannot be invoiced.");
  }

  return logs;
};


export const calculateTotalHoursAndLines = async (
  clientId: string,
  timeLogIds?: string[],
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


  const logs = await getAllUnBilledLogsById(clientId, timeLogIds);
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
