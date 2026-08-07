import { InvoiceWithClientAndItems } from "@/app/actions/pdfkit";

export const pdfResponse = ({
  pdfBuffer,
  invoice,
}: {
  pdfBuffer: Buffer;
  invoice: InvoiceWithClientAndItems;
}) => {
  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.invoiceNumber}.pdf`,
    },
  });
};
