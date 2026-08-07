import { getInvoiceById } from "@/app/actions/invoices";
import {
  InvoicePreviewCard,
  type InvoicePreviewData,
} from "@/components/invoices/invoice-preview";
import { getRedis } from "@/lib/redis";

export default async function InvoicePreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const redis = getRedis();
  const key = `invoice-preview:${params.id}`;

  const cachedPreview = await redis.get(key);
  let preview: InvoicePreviewData | null = null;

  if (cachedPreview) {
    preview = JSON.parse(cachedPreview) as InvoicePreviewData;
  } else {
    const invoice = await getInvoiceById(params.id);
    preview = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      totalAmount: invoice.totalAmount,
      createdAt: invoice.createdAt.toISOString(),
      items: invoice.items.map(
        (item: { description: string; hours: number; lineTotal: number }) => ({
          description: item.description,
          hours: item.hours,
          lineTotal: item.lineTotal,
        })
      ),
    };

    await redis.set(key, JSON.stringify(preview), "EX", 60);
  }

  if (!preview) {
    return <div className="p-6">Invoice preview not found.</div>;
  }

  return <InvoicePreviewCard preview={preview} />;
}
