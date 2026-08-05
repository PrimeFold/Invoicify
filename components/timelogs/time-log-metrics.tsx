export type TimeLogMetrics = {
  totalHours: number;
  entryCount: number;
  unbilledAmount: number;
  unbilledHours: number;
  billedAmount: number;
  billedHours: number;
};

export function TimeLogMetrics({ metrics }: { metrics?: TimeLogMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label="Total Hours Logged" value={metrics ? `${metrics.totalHours.toFixed(2)} hrs` : "—"} note={metrics ? `Across ${metrics.entryCount} entries` : "Awaiting time-log data"} />
      <Metric label="Unbilled Accrual" value={metrics ? formatCurrency(metrics.unbilledAmount) : "—"} note={metrics ? `${metrics.unbilledHours} hours ready to invoice` : "Connect unbilled time-log totals"} highlight />
      <Metric label="Billed / Invoiced" value={metrics ? formatCurrency(metrics.billedAmount) : "—"} note={metrics ? `${metrics.billedHours} hours locked` : "Connect invoiced time-log totals"} />
    </div>
  );
}

function Metric({ label, value, note, highlight = false }: { label: string; value: string; note: string; highlight?: boolean }) {
  return <div className="rounded-md border border-line bg-canvas p-4 text-left"><span className="font-mono text-xs uppercase tracking-wider text-txt-muted">{label}</span><p className={`mt-1 font-mono text-xl font-semibold tracking-tight ${highlight ? "text-status-pending" : "text-txt-primary"}`}>{value}</p><p className="mt-1 font-mono text-xs text-txt-secondary">{note}</p></div>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
