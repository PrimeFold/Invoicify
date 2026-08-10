export const runtime = "nodejs";

import {
  buildInvoicePdfBuffer,
  type InvoiceWithClientAndItems,
} from "@/app/actions/pdfkit";
import { prisma } from "@/auth";
import { getPdfCache, setPdfCache } from "@/lib/redis";
import { verifyInvoiceShareToken } from "@/lib/signed-urls";
import { pdfResponse } from "@/utils/pdf-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const token = searchParams.get("token");
    const expires = searchParams.get("expires");

    // ⚡ Verify 24-hour signed token if query params are present
    if (token && expires) {
      const verification = await verifyInvoiceShareToken(id, token, expires);

      if (!verification.valid) {
        return new Response(
          `
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 48px; background: #0b0c10; color: #f0f0f5;">
              <h2 style="font-size: 20px; font-weight: 600;">Link Expired or Invalid</h2>
              <p style="font-size: 14px; color: #8a8d9b; margin-top: 8px;">${verification.error || "This preview link is no longer valid."}</p>
            </body>
          </html>
          `,
          { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    }

    // ⚡ Strongly-typed query returning exact InvoiceWithClientAndItems
    const invoice: InvoiceWithClientAndItems | null =
      await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          items: true,
        },
      });

    if (!invoice) {
      return new Response("Invoice not found.", { status: 404 });
    }

    // Check Redis cache for rendered PDF
    const cached = await getPdfCache(id);
    if (cached) {
      return new Response(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename=invoice-${invoice.invoiceNumber}.pdf`,
        },
      });
    }

    // Generate PDF, cache for 60s, and stream response
    const pdfBuffer = await buildInvoicePdfBuffer(invoice);
    await setPdfCache(id, pdfBuffer);

    return pdfResponse({ pdfBuffer, invoice });
  } catch (error) {
    return new Response(
      `
      <html>
        <body style="font-family: sans-serif; padding: 24px; background: #0b0c10; color: #f0f0f5;">
          <h1 style="font-size: 20px; font-weight: 600;">Invoice preview failed</h1>
          <pre style="font-size: 12px; color: #ff5555; background: #1a1b20; padding: 16px; rounded: 8px;">${error instanceof Error ? error.stack : String(error)}</pre>
        </body>
      </html>
      `,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
