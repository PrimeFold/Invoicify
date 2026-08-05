type ClientMetrics = {
  activeClients?: number;
  averageHourlyRate?: number;
  totalUnbilledAmount?: number;
  totalUnbilledHours?: number;
};

type ClientsMetricsProps = {
  metrics?: ClientMetrics;
};

export function ClientsMetrics({ metrics }: ClientsMetricsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricCard
        label="Active Clients"
        value={metrics?.activeClients !== undefined ? metrics.activeClients.toString() : "—"}
        note={metrics ? "Accounts with active billing profiles" : "Awaiting client data"}
      />
      <MetricCard
        label="Avg Hourly Rate"
        value={metrics?.averageHourlyRate !== undefined ? formatRate(metrics.averageHourlyRate) : "—"}
        note={metrics ? "Across your client list" : "Awaiting client data"}
      />
      <MetricCard
        label="Total Unbilled"
        value={metrics?.totalUnbilledAmount !== undefined ? formatCurrency(metrics.totalUnbilledAmount) : "—"}
        note={metrics?.totalUnbilledHours !== undefined ? `${metrics.totalUnbilledHours} hours ready to invoice` : "Available when time-log totals are loaded"}
        highlight
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-line bg-canvas p-4 text-left">
      <span className="font-mono text-xs uppercase tracking-wider text-txt-muted">{label}</span>
      <p className={`mt-1 font-mono text-xl font-semibold tracking-tight ${highlight ? "text-status-pending" : "text-txt-primary"}`}>
        {value}
      </p>
      <p className="mt-1 font-mono text-xs text-txt-secondary">{note}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatRate(value: number) {
  return `${formatCurrency(value)}/hr`;
}

export type { ClientMetrics };
