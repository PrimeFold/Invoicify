import { Client } from "./client";
import { User } from "./user";

export interface TimeLog{
    id:string;
    userId:string;
    user:User;
    clientId:string;
    client:Client;
    description:string;
    startTime:Date;
    endTime:Date
    durationMinutes:Number;
    status:"UNBILLED" | "INVOICED"
}