import { Client } from "./client";
import { InvoiceItem } from "./invoiceItem";
import { User } from "./user";

export interface Invoice{
    id:string;
    userId:string;
    user:User,
    invoiceNumber:string;
    clientId:string,
    client:Client;
    totalAmount:GLfloat;
    status:"UNPAID" | "PAID";
    createdAt:Date;
    items:InvoiceItem[]
}