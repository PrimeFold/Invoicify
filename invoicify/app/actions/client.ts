//functions for all client related stuff..
"use server"

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import type { Client } from "@/types/client";
import type { PaginatedResult } from "@/types/pagination";
import { clientSchema } from "../validations/zod";
import { revalidatePath } from "next/cache";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const getClients = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Client>> => {
  const user = await requireUser();

  const currentPage = Math.max(1, Number(page) || 1);
  const take = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE));
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
    revalidatePath('/clients')

    return newClient;

  } catch (error) {
    throw error;
  }
};

export const getClientById = async(clientId:string)=>{
  const user = await requireUser();
  try {
    const client = await prisma.client.findFirst({
      where:{
        id:clientId,
        userId:user.id
      }
    })

    if(!client){
      throw new Error("Client doesn't exist")
    }
    
    return client;

  } catch (error) {
    throw new Error((error as Error).message)
  }
}


export const updateClientName = async(clientId:string,name:string)=>{
  const user = await requireUser();
  try {
    const client = await prisma.client.update({
      where:{
        id:clientId,
        userId:user.id
      },
      data:{
        name
      }
    })
    revalidatePath("/clients")
    revalidatePath("/clients/[id]")

  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export const deleteClient = async(clientId:string)=>{
  const user = await requireUser();
  try {
    const client = await prisma.client.delete({
      where:{
        id:clientId,
        userId:user.id
      }
    })

    revalidatePath("/clients")
    revalidatePath("/clients/[id]")

  } catch (error) {
    
  }
}
