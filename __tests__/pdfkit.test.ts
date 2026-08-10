import { describe, expect, it } from "vitest";
import { buildInvoicePdfBuffer } from "@/app/actions/pdfkit";

describe("PDFKit Vector PDF Generator Engine", () => {
  it("should generate a valid PDF Buffer for an invoice with client and items", async () => {
    const mockInvoice = {
      id: "inv_db_123",
      invoiceNumber: "INV-1001",
      totalAmount: 450.0,
      status: "UNPAID",
      createdAt: new Date("2026-08-10"),
      userId: "usr_123",
      clientId: "cld_123",
      client: {
        id: "cld_123",
        userId: "usr_123",
        name: "Acme Corporation",
        email: "billing@acme.com",
        hourlyRate: 150.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      items: [
        {
          id: "item_1",
          invoiceId: "inv_db_123",
          description: "Frontend Architecture & Vitest Setup",
          hours: 3.0,
          rate: 150.0,
          lineTotal: 450.0,
        },
      ],
    };

    const pdfBuffer = await buildInvoicePdfBuffer(mockInvoice);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500); // Valid PDF header bytes
    expect(pdfBuffer.toString("utf-8", 0, 5)).toBe("%PDF-"); // Standard PDF magic bytes header
  });
});
