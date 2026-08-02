export const runtime = "nodejs";
import { buildInvoicePdfBuffer } from "@/app/actions/pdfkit";
import { getInvoiceById } from "@/app/actions/invoices";
import { getPdfCache, setPdfCache } from "@/lib/redis";
import { pdfResponse } from "@/utils/pdf-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    // Check Redis cache for the rendered PDF
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

    // Not cached -> generate, cache and return
    const pdfBuffer = await buildInvoicePdfBuffer(invoice);
    // cache for 60 seconds
    await setPdfCache(id, pdfBuffer);

    return pdfResponse({ pdfBuffer, invoice });
  } catch (error) {
    return new Response(
      `
    <html>
      <body style="font-family: sans-serif; padding: 24px;">
        <h1>Invoice preview</h1>
        <p>The PDF generator failed, but this page is working.</p>
        <pre>${error instanceof Error ? error.stack : String(error)}</pre>
      </body>
    </html>
    `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );
  }
}
