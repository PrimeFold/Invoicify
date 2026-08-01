export const runtime = "nodejs";
import { buildInvoicePdfBuffer } from "@/app/actions/pdfkit";
import { getInvoiceById } from "@/app/actions/invoices";


export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  
  try {
    const invoice = await getInvoiceById(params.id);
    const pdfBuffer = await buildInvoicePdfBuffer(invoice);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${invoice.invoiceNumber}.pdf`,
      },
    });
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
