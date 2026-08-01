"use server";
import PDFDocument from "pdfkit";
import type { Invoice } from "@/types/invoice";
import { Prisma } from "@/lib/generated/prisma/client";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);


type InvoiceWithClientAndItems = Prisma.InvoiceGetPayload<{
  include: { client: true; items: true };
}>;

  
export const buildInvoicePdfBuffer = async (invoice: InvoiceWithClientAndItems) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica");
    doc.fontSize(20).text("Invoice", { align: "left" });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt.toISOString().slice(0, 10)}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    doc.fontSize(12).text("Bill To:");
    doc.text(invoice.client.name);
    doc.text(invoice.client.email);
    doc.moveDown();

    doc.font("Helvetica-Bold");
    const tableTop = doc.y;
    doc.text("Description", 40, tableTop);
    doc.text("Hours", 300, tableTop);
    doc.text("Rate", 380, tableTop);
    doc.text("Line Total", 460, tableTop);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica");
    invoice.items.forEach((item) => {
      const y = doc.y;
      doc.text(item.description, 40, y, { width: 240 });
      doc.text(item.hours.toFixed(2), 300, y);
      doc.text(formatCurrency(item.rate), 380, y);
      doc.text(formatCurrency(item.lineTotal), 460, y);
      doc.moveDown();
    });

    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(12).text("Total", 380, doc.y);
    doc.text(formatCurrency(invoice.totalAmount), 460, doc.y);

    doc.end();
  });
};