//functions for all client related stuff..
"use server"

import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import type { Client } from "@/types/client";
import { clientSchema } from "../validations/zod";

export const getClients = async () => {
  const user = await requireUser();

  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
      },
    });

    return clients;
  } catch (error) {
    return (error as Error).message;
  }
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

    return newClient;

  } catch (error) {
    throw error;
  }
};