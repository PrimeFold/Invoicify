export type InvoiceMetrics = {
  totalInvoices: number;
  collectedAmount: number;
  paidCount: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;
};

export function InvoiceMetrics({ metrics }: { metrics?: InvoiceMetrics }) {
  return <div className="grid gap-3 sm:grid-cols-3"><Metric label="Total Collected" value={metrics ? formatCurrency(metrics.collectedAmount) : "—"} note={metrics ? `${metrics.paidCount} paid invoices` : "Awaiting invoice data"} /><Metric label="Unpaid / Pending" value={metrics ? formatCurrency(metrics.unpaidAmount) : "—"} note={metrics ? `${metrics.unpaidCount} invoices awaiting payment` : "Connect unpaid invoice totals"} tone="pending" /><Metric label="Overdue Balance" value={metrics ? formatCurrency(metrics.overdueAmount) : "—"} note={metrics ? `${metrics.overdueCount} invoices require action` : "Connect overdue invoice totals"} tone="danger" /></div>;
}

function Metric({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: "default" | "pending" | "danger" }) {
  const color = tone === "danger" ? "text-red-400" : tone === "pending" ? "text-status-pending" : "text-txt-primary";
  return <div className="rounded-md border border-line bg-canvas p-4 text-left"><span className="font-mono text-xs uppercase tracking-wider text-txt-muted">{label}</span><p className={`mt-1 font-mono text-xl font-semibold tracking-tight ${color}`}>{value}</p><p className="mt-1 font-mono text-xs text-txt-secondary">{note}</p></div>;
}

function formatCurrency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
