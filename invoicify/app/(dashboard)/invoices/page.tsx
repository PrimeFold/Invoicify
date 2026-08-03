import { InvoiceMetrics, type InvoiceMetrics as InvoiceMetricsData } from "@/components/invoices/invoice-metrics";
import { InvoicesPageHeader } from "@/components/invoices/invoices-page-header";
import { InvoicesTable, type InvoiceTableRow } from "@/components/invoices/invoices-table";

// TODO: Load authenticated invoices and derive totals by payment status here.
const invoices: InvoiceTableRow[] = [];
const metrics: InvoiceMetricsData | undefined = undefined;

export default function InvoicesPage() {
  return <div className="space-y-6"><InvoicesPageHeader invoiceCount={metrics?.totalInvoices} /><InvoiceMetrics metrics={metrics} /><InvoicesTable invoices={invoices} /></div>;
}
