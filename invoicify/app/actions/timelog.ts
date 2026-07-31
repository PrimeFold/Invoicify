"use server"
import { prisma } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import type { PaginatedResult } from "@/types/pagination";
import type { TimeLog } from "@/types/timeLog";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const createTimeLog = async(data:TimeLog)=>{
    try {
        const newTimeLog = await prisma.timeLog.create({
            data:{
                userId:data.userId,
                clientId:data.clientId,
                description:data.description,
                startTime:data.startTime,
                endTime:data.endTime,
                durationMinutes:data.durationMinutes,
                status:data.status
            },
            select:{
                userId:true,
                clientId:true,
                description:true,
                startTime:true,
                endTime:true,
                durationMinutes:true,
                status:true
            }
        })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export const getTimeLogs = async (page : number,pageSize = DEFAULT_PAGE_SIZE,): Promise<PaginatedResult<TimeLog>> => {
    const user = await requireUser();

    const currentPage = Math.max(1 , Number(page) || 1);
    const take = DEFAULT_PAGE_SIZE;
    const skip = (currentPage - 1)*take;
    const where = {userId:user.id};
    const [items,total] = await prisma.$transaction([
        prisma.timeLog.findMany({
            where,
            include:{client:true},
            orderBy:{startTime:"desc"},
            skip,
            take
        }),
        prisma.timeLog.count({where})
    ]);

    return {
        items,
        page:currentPage,
        pageSize:DEFAULT_PAGE_SIZE,
        total,
        totalPages:Math.ceil(total/DEFAULT_PAGE_SIZE),
        hasNextPage:currentPage < items.length,
        hasPreviousPage:currentPage > 1
    }

};


export const deleteTimeLog = async(id:string)=>{
    const user = await requireUser();
    try {
        await prisma.timeLog.delete({
            where: {
                id,
                userId: user.id
            }
        })
    } catch (error) {
        throw new Error((error as Error).message);
    }
}

