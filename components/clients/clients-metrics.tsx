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
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="Active Clients"
        value={
          metrics?.activeClients !== undefined
            ? metrics.activeClients.toString()
            : "—"
        }
        note={
          metrics
            ? "Accounts with active billing profiles"
            : "Awaiting client data"
        }
      />
      <MetricCard
        label="Avg Hourly Rate"
        value={
          metrics?.averageHourlyRate !== undefined
            ? formatRate(metrics.averageHourlyRate)
            : "—"
        }
        note={metrics ? "Across your client list" : "Awaiting client data"}
      />
      <MetricCard
        label="Total Unbilled"
        value={
          metrics?.totalUnbilledAmount !== undefined
            ? formatCurrency(metrics.totalUnbilledAmount)
            : "—"
        }
        note={
          metrics?.totalUnbilledHours !== undefined
            ? `${metrics.totalUnbilledHours} hours ready to invoice`
            : "Available when time-log totals are loaded"
        }
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
    <div className="glass-card p-4 text-left active-press">
      <span className="apple-label-caps text-[10px]">
        {label}
      </span>
      <p
        className={`mt-1.5 font-mono text-2xl font-bold tracking-tight ${highlight ? "text-status-pending" : "text-txt-primary"}`}
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

function formatRate(value: number) {
  return `${formatCurrency(value)}/hr`;
}

export type { ClientMetrics };
