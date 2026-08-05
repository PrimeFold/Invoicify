import { Client } from "./client";
import { Invoice } from "./invoice";
import { TimeLog } from "./timeLog";

export interface User{
    id:string;
    name:string;
    email:string;
    image?:string;
    invoices:Invoice[]
    clients:Client[],
    timeLog:TimeLog[]
}