//functions for all client related stuff..
"use server"

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import type { Client } from "@/types/client";
import type { PaginatedResult } from "@/types/pagination";
import { clientSchema } from "../validations/zod";
import { revalidatePath } from "next/cache";
import { getRedis } from "@/lib/redis";
import { toast } from "@/components/ui/toast";
import { invalidateDashboardCache } from "./dashboard";

const DEFAULT_PAGE_SIZE = 10;

export const getClients = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Client>> => {
  const user = await requireUser();
  const key = `clients:${user.id}:${page}:${pageSize}`
  let redis: ReturnType<typeof getRedis> | undefined;

  try {
    redis = getRedis();
    const cachedClients = await redis.get(key);

    if(cachedClients){
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
    await invalidateDashboardCache(user.id);
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
    await prisma.client.update({
      where:{
        id:clientId,
        userId:user.id
      },
      data:{
        name
      }
    })

    await invalidateDashboardCache(user.id);
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

    await invalidateDashboardCache(user.id);
    revalidatePath("/clients")
    revalidatePath("/clients/[id]")

    
  } catch (error) {
    toast.error({
      title:"Error",
      description:(error as Error).message
    })
  }
}
export async function getClientOptions() {
  const user = await requireUser();
  const key = `options-clients:${user.id}`
  const redis = getRedis();
  const cache = await redis.get(key);

  if(cache){
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
    await redis.set(key,JSON.stringify(clientOptions),"EX",120);
  } catch (error) {
    //Caching errors shouldn't interrupt regular operations..
    console.warn((error as Error).message)
  }

  return clientOptions;
}

