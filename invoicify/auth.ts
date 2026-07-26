import { PrismaClient } from '@/lib/generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg'
import {betterAuth} from 'better-auth/minimal'
import { prismaAdapter } from "better-auth/adapters/prisma"
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword:{
      enabled:true,
      requireEmailVerification:false,
      minPasswordLength:8,
      revokeSessionsOnPasswordReset:true,
    },
    session:{
      expiresIn:60*60*24*5
    },
    
    
});