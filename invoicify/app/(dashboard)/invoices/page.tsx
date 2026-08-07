import { getInvoiceSummary, getInvoices } from "@/app/actions/invoices";
import {
  InvoiceMetrics,
  type InvoiceMetrics as InvoiceMetricsData,
} from "@/components/invoices/invoice-metrics";
import { InvoicesPageHeader } from "@/components/invoices/invoices-page-header";
import {
  InvoicesTable,
  type InvoiceTableRow,
} from "@/components/invoices/invoices-table";
import { PaginationControls } from "@/components/ui/pagination-controls";

type InvoicesPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const params = await searchParams;
  const requestedPage =
    Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1;
  const [initialInvoiceResult, metrics] = await Promise.all([
    getInvoices(requestedPage),
    getInvoiceSummary(),
  ]);

  let invoiceResult = initialInvoiceResult;

  if (
    invoiceResult.totalPages > 0 &&
    invoiceResult.page > invoiceResult.totalPages
  ) {
    invoiceResult = await getInvoices(invoiceResult.totalPages);
  }

  const invoices: InvoiceTableRow[] = invoiceResult.items.map((invoice) => ({
    id: invoice.invoiceNumber,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    amount: invoice.totalAmount,
    dueDate: "Not set",
    createdDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(invoice.createdAt),
    status: invoice.status === "PAID" ? "PAID" : "UNPAID",
  }));

  return (
    <div className="space-y-6">
      <InvoicesPageHeader invoiceCount={invoiceResult.total} />
      <InvoiceMetrics metrics={metrics satisfies InvoiceMetricsData} />
      <InvoicesTable invoices={invoices} />
      <PaginationControls
        basePath="/invoices"
        currentPage={invoiceResult.page}
        totalPages={invoiceResult.totalPages}
        hasPreviousPage={invoiceResult.hasPreviousPage}
        hasNextPage={invoiceResult.hasNextPage}
      />
    </div>
  );
}
