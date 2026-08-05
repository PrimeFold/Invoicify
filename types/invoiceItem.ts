import { Invoice } from "./invoice";

export interface InvoiceItem{
    id:string;
    invoiceId:string;
    invoice:Invoice;
    description:string
    hours:GLfloat;
    rate:GLfloat;
    lineTotal:GLfloat
}