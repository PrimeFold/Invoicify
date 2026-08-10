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
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric
        label="Total Collected"
        value={metrics ? formatCurrency(metrics.collectedAmount) : "—"}
        note={
          metrics
            ? `${metrics.paidCount} paid invoices`
            : "Awaiting invoice data"
        }
        tone="paid"
      />
      <Metric
        label="Unpaid / Pending"
        value={metrics ? formatCurrency(metrics.unpaidAmount) : "—"}
        note={
          metrics
            ? `${metrics.unpaidCount} invoices awaiting payment`
            : "Connect unpaid invoice totals"
        }
        tone="pending"
      />
      <Metric
        label="Overdue Balance"
        value={metrics ? formatCurrency(metrics.overdueAmount) : "—"}
        note={
          metrics
            ? `${metrics.overdueCount} invoices require action`
            : "Connect overdue invoice totals"
        }
        tone="danger"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "paid" | "pending" | "danger";
}) {
  const color =
    tone === "danger"
      ? "text-status-overdue"
      : tone === "pending"
        ? "text-status-pending"
        : tone === "paid"
          ? "text-status-paid"
          : "text-txt-primary";
  return (
    <div className="glass-card p-4 text-left active-press">
      <span className="apple-label-caps text-[10px]">
        {label}
      </span>
      <p
        className={`mt-1.5 font-mono text-2xl font-bold tracking-tight ${color}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-txt-secondary tracking-tight">{note}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
