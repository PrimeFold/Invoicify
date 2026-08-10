"use server";

import PDFDocument from "pdfkit";
import { Prisma } from "@/lib/generated/prisma/client";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export type InvoiceWithClientAndItems = Prisma.InvoiceGetPayload<{
  include: { client: true; items: true };
}>;

export const buildInvoicePdfBuffer = async (
  invoice: InvoiceWithClientAndItems
) => {
  const doc = new PDFDocument({ margin: 44, size: "A4" });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primaryColor = "#000000";
    const secondaryColor = "#6b7280";
    const borderColor = "#e5e7eb";
    const tableBgColor = "#f9fafb";

    // 1. Top Decorative Bar
    doc.rect(44, 44, 507, 4).fill("#000000");

    // 2. Header Title & Invoice Meta
    doc.font("Helvetica-Bold").fontSize(24).fillColor(primaryColor).text("INVOICE", 44, 64);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(invoice.createdAt);

    doc.font("Helvetica").fontSize(10).fillColor(secondaryColor);
    doc.text(`Invoice Number: `, 360, 64, { continued: true });
    doc.font("Helvetica-Bold").fillColor(primaryColor).text(invoice.invoiceNumber);

    doc.font("Helvetica").fillColor(secondaryColor);
    doc.text(`Issue Date: `, 360, 78, { continued: true });
    doc.font("Helvetica-Bold").fillColor(primaryColor).text(formattedDate);

    doc.font("Helvetica").fillColor(secondaryColor);
    doc.text(`Status: `, 360, 92, { continued: true });
    doc.font("Helvetica-Bold").fillColor(invoice.status === "PAID" ? "#059669" : "#d97706").text(invoice.status);

    doc.moveTo(44, 115).lineTo(551, 115).strokeColor(borderColor).lineWidth(1).stroke();

    // 3. Billing Info (Billed To)
    const billToTop = 130;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(secondaryColor).text("BILLED TO", 44, billToTop);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor).text(invoice.client.name, 44, billToTop + 14);
    doc.font("Helvetica").fontSize(10).fillColor(secondaryColor).text(invoice.client.email, 44, billToTop + 30);

    const billFromTop = 130;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(secondaryColor).text("ISSUED BY", 360, billFromTop);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor).text("Invoicify Platform", 360, billFromTop + 14);
    doc.font("Helvetica").fontSize(10).fillColor(secondaryColor).text("billing@invoicify.dev", 360, billFromTop + 30);

    // 4. Line Items Table Header
    const tableHeaderTop = 200;
    doc.rect(44, tableHeaderTop, 507, 24).fill(tableBgColor);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(secondaryColor);
    doc.text("DESCRIPTION", 54, tableHeaderTop + 7);
    doc.text("HOURS", 320, tableHeaderTop + 7, { width: 50, align: "right" });
    doc.text("RATE", 390, tableHeaderTop + 7, { width: 60, align: "right" });
    doc.text("LINE TOTAL", 465, tableHeaderTop + 7, { width: 75, align: "right" });

    // 5. Line Items Rows
    let currentY = tableHeaderTop + 32;

    invoice.items.forEach((item, index) => {
      doc.font("Helvetica").fontSize(10).fillColor(primaryColor);
      doc.text(item.description, 54, currentY, { width: 250 });
      doc.text(item.hours.toFixed(1), 320, currentY, { width: 50, align: "right" });
      doc.text(formatCurrency(item.rate), 390, currentY, { width: 60, align: "right" });
      doc.font("Helvetica-Bold").text(formatCurrency(item.lineTotal), 465, currentY, { width: 75, align: "right" });

      currentY += 22;
      doc.moveTo(44, currentY - 4).lineTo(551, currentY - 4).strokeColor(borderColor).lineWidth(0.5).stroke();
    });

    // 6. Total Summary Box
    currentY += 16;
    doc.moveTo(340, currentY).lineTo(551, currentY).strokeColor(borderColor).lineWidth(1).stroke();
    currentY += 10;

    doc.font("Helvetica-Bold").fontSize(11).fillColor(secondaryColor).text("TOTAL AMOUNT", 340, currentY);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(primaryColor).text(formatCurrency(invoice.totalAmount), 440, currentY - 3, { width: 111, align: "right" });

    // 7. Footer
    const footerY = 780;
    doc.moveTo(44, footerY - 15).lineTo(551, footerY - 15).strokeColor(borderColor).lineWidth(0.5).stroke();
    doc.font("Helvetica").fontSize(9).fillColor(secondaryColor).text("Thank you for your business!", 44, footerY, { align: "center" });

    doc.end();
  });
};
