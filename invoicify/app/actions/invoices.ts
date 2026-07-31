"use server";

import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";

type InvoiceLine = {
  timeLogId: string;
  description: string;
  hours: number;
  rate: number;
  lineTotal: number;
};

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

const createInvoiceNumber = () =>
  `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

// `timeLogIds` is optional: may omit it to invoice every unbilled log for the client.
export const getAllUnBilledLogsById = async (clientId: string,timeLogIds?: string[]) => {
  const user = await requireUser();

  const logs = await prisma.timeLog.findMany({
    where: {
      clientId,
      userId: user.id,
      status: "UNBILLED",
      ...(timeLogIds ? { id: { in: timeLogIds } } : {}),
    },
    orderBy: { startTime: "asc" },
  });

  if (logs.length === 0) {
    throw new Error("No unbilled time logs found for this client.");
  }

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

  const items: InvoiceLine[] = logs.map((log) => {
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

export const generateInvoice = async (
  clientId: string,
  timeLogIds: string[],
) => {
  if (timeLogIds.length === 0) {
    throw new Error("Select at least one time log to create an invoice.");
  }

  const user = await requireUser();
  const { items, totalHours, totalAmount } = await calculateTotalHoursAndLines(clientId, timeLogIds);

  return prisma.$transaction(async (tx) => {
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

    // The status condition prevents a log being invoiced twice by concurrent requests.
    const updatedLogs = await tx.timeLog.updateMany({
      where: {
        id: { in: timeLogIds },
        userId: user.id,
        clientId,
        status: "UNBILLED",
      },
      data: { status: "INVOICED" },
    });

    if (updatedLogs.count !== timeLogIds.length) {
      throw new Error("One or more selected time logs were already invoiced.");
    }

    return { invoice, totalHours };
  });
};
