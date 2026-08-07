"use client";

import React from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  AlertCircle,
  Building2,
  ArrowUpRight,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Chart Config
const chartConfig = {
  collected: { label: "Collected", color: "var(--status-paid)" },
  unbilled: { label: "Unbilled", color: "var(--status-pending)" },
} satisfies ChartConfig;

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatRelativeTime(date: Date) {
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function createMonthlyData(data: DashboardData | null) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });

  const totals = new Map(
    months.map((date) => [
      `${date.getFullYear()}-${date.getMonth()}`,
      {
        month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
          date
        ),
        collected: 0,
        unbilled: 0,
      },
    ])
  );

  for (const timeLog of data?.timeLogs ?? []) {
    if (timeLog.status !== "UNBILLED") continue;

    const date = new Date(timeLog.startTime);
    const total = totals.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (total)
      total.unbilled +=
        (timeLog.durationMinutes / 60) * timeLog.client.hourlyRate;
  }

  for (const invoice of data?.invoices ?? []) {
    if (invoice.status !== "PAID") continue;

    const date = new Date(invoice.createdAt);
    const total = totals.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (total) total.collected += invoice.totalAmount;
  }

  return [...totals.values()];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    React.useState<DashboardData | null>(null);
  const [hasLoadError, setHasLoadError] = React.useState(false);

  React.useEffect(() => {
    let isCurrent = true;

    getDashboardData()
      .then((data) => {
        if (isCurrent) {
          setDashboardData(data);
          setHasLoadError(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load dashboard data:", error);
        if (isCurrent) setHasLoadError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const clients = dashboardData?.clients ?? [];
  const timeLogs = dashboardData?.timeLogs ?? [];
  const invoices = dashboardData?.invoices ?? [];
  const monthlyData = createMonthlyData(dashboardData);
  const isLoading = dashboardData === null && !hasLoadError;

  const unbilledMinutesByClient = new Map<string, number>();
  const lastActivityByClient = new Map<string, Date>();
  for (const timeLog of timeLogs) {
    if (timeLog.status === "UNBILLED") {
      unbilledMinutesByClient.set(
        timeLog.clientId,
        (unbilledMinutesByClient.get(timeLog.clientId) ?? 0) +
          timeLog.durationMinutes
      );
    }

    const startedAt = new Date(timeLog.startTime);
    const previousActivity = lastActivityByClient.get(timeLog.clientId);
    if (!previousActivity || startedAt > previousActivity) {
      lastActivityByClient.set(timeLog.clientId, startedAt);
    }
  }

  const activeClients = clients.map((client) => {
    const unbilledHours = (unbilledMinutesByClient.get(client.id) ?? 0) / 60;
    return {
      ...client,
      unbilledHours,
      unbilledAmount: unbilledHours * client.hourlyRate,
      lastActive: lastActivityByClient.get(client.id),
    };
  });

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "UNPAID"
  );
  const now = new Date();
  const paidInvoicesThisMonth = invoices.filter((invoice) => {
    const issuedAt = new Date(invoice.createdAt);
    return (
      invoice.status === "PAID" &&
      issuedAt.getFullYear() === now.getFullYear() &&
      issuedAt.getMonth() === now.getMonth()
    );
  });
  const collectedThisMonth = paidInvoicesThisMonth.reduce(
    (total, invoice) => total + invoice.totalAmount,
    0
  );
  const totalUnbilledHours = activeClients.reduce(
    (total, client) => total + client.unbilledHours,
    0
  );
  const totalUnbilledAmount = activeClients.reduce(
    (total, client) => total + client.unbilledAmount,
    0
  );
  const averageHourlyRate =
    clients.length === 0
      ? 0
      : clients.reduce((total, client) => total + client.hourlyRate, 0) /
        clients.length;
  const hasChartData = monthlyData.some(
    (month) => month.collected > 0 || month.unbilled > 0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-txt-primary">
            Dashboard
          </h1>
          <p className="text-xs font-mono text-txt-secondary mt-1">
            Active client statuses, unbilled time logs, and financial telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/timelogs">
            <Button
              variant="outline"
              className="bg-surface border-line text-txt-primary hover:bg-surface-hover font-mono text-xs h-9 px-3 rounded-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Clock className="size-3.5 text-txt-muted" />
              Log Hours
            </Button>
          </Link>
          <Link href="/invoices">
            <Button className="bg-txt-primary text-canvas hover:opacity-90 font-mono text-xs h-9 px-3 rounded-md cursor-pointer inline-flex items-center gap-1.5">
              <Plus className="size-3.5" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Unbilled Revenue"
          value={formatCurrency(totalUnbilledAmount)}
          subtext={`${totalUnbilledHours.toFixed(2)} hrs pending invoice`}
          status="pending"
          icon={Clock}
        />
        <MetricCard
          label="Collected This Month"
          value={formatCurrency(collectedThisMonth)}
          subtext={`${paidInvoicesThisMonth.length} paid invoices`}
          status="paid"
          icon={TrendingUp}
        />
        <MetricCard
          label="Unpaid Invoices"
          value={formatCurrency(
            unpaidInvoices.reduce(
              (total, invoice) => total + invoice.totalAmount,
              0
            )
          )}
          subtext={`${unpaidInvoices.length} invoices action required`}
          status="pending"
          icon={AlertCircle}
        />
        <MetricCard
          label="Active Clients"
          value={`${clients.length} Accounts`}
          subtext={`Avg rate ${formatCurrency(averageHourlyRate)}/hr`}
          status="normal"
          icon={Building2}
        />
      </div>

      {/* 3. Middle Section: Active Clients Telemetry + Action Needed Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Client Status Table (2 Cols) */}
        <Card className="lg:col-span-2 gap-0 rounded-lg border-line bg-surface py-0 shadow-none text-left">
          <CardHeader className="p-5 border-b border-line flex-row items-center justify-between">
            <div>
              <CardTitle className="font-mono text-xs text-txt-muted uppercase tracking-wider">
                CLIENT_TELEMETRY // ACTIVE ACCOUNTS
              </CardTitle>
              <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
                Current Client Work & Unbilled Accruals
              </CardDescription>
            </div>
            <Link
              href="/clients"
              className="font-mono text-xs text-txt-muted hover:text-txt-primary inline-flex items-center gap-1"
            >
              View All <ChevronRight className="size-3" />
            </Link>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-line bg-canvas/40 text-[10px] text-txt-muted uppercase tracking-wider">
                  <th className="pt-1.5 pb-2.5 px-5">Client</th>
                  <th className="pt-1.5 pb-2.5 px-4">Rate</th>
                  <th className="pt-1.5 pb-2.5 px-4">Unbilled Time</th>
                  <th className="pt-1.5 pb-2.5 px-4">Unbilled Total</th>
                  <th className="pt-1.5 pb-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-txt-muted"
                    >
                      Loading client telemetry…
                    </td>
                  </tr>
                ) : activeClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <p className="font-sans text-sm font-medium text-txt-primary">
                        {hasLoadError
                          ? "No client data available"
                          : "No clients yet"}
                      </p>
                      <p className="mt-1 text-[10px] text-txt-muted">
                        {hasLoadError
                          ? "Try refreshing the dashboard."
                          : "Add a client to start tracking billable work."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  activeClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <p className="font-sans font-medium text-txt-primary text-xs">
                          {client.name}
                        </p>
                        <p className="text-[10px] text-txt-muted">
                          {client.lastActive
                            ? `Active ${formatRelativeTime(client.lastActive)}`
                            : "No logged work yet"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-txt-secondary">
                        ${client.hourlyRate.toFixed(2)}/hr
                      </td>
                      <td className="py-3 px-4 text-txt-secondary">
                        {client.unbilledHours > 0 ? (
                          `${client.unbilledHours} hrs`
                        ) : (
                          <span className="text-txt-muted">0 hrs</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {client.unbilledAmount > 0 ? (
                          <span className="text-status-pending">
                            {formatCurrency(client.unbilledAmount)}
                          </span>
                        ) : (
                          <span className="text-txt-muted">$0.00</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Link href={`/invoices/new?clientId=${client.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={client.unbilledHours === 0}
                            className="h-7 text-[10px] px-2 text-txt-secondary hover:text-txt-primary border border-line bg-canvas hover:bg-surface-hover disabled:opacity-30"
                          >
                            Bill Hours
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Needed: Pending/Overdue Invoices (1 Col) */}
        <Card className="rounded-lg border-line bg-surface py-0 shadow-none text-left flex flex-col justify-between">
          <div>
            <CardHeader className="p-5 border-b border-line flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono text-xs text-txt-muted uppercase tracking-wider">
                  ACTION_REQUIRED
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
                  Unpaid Invoices
                </CardDescription>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-status-pending-border bg-status-pending-bg text-status-pending font-semibold">
                {unpaidInvoices.length} PENDING
              </span>
            </CardHeader>

            <div className="p-5 space-y-3 font-mono text-xs">
              {isLoading ? (
                <p className="text-txt-muted">Loading invoices…</p>
              ) : unpaidInvoices.length > 0 ? (
                unpaidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded border border-line bg-canvas flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-txt-primary">
                          {inv.id}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-status-pending-bg text-status-pending border border-status-pending-border">
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-txt-muted mt-1">
                        {inv.client.name} • Issued{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(inv.createdAt))}
                      </p>
                    </div>
                    <span className="font-semibold text-txt-primary">
                      {formatCurrency(inv.totalAmount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <p className="font-sans text-sm font-medium text-txt-primary">
                    {hasLoadError
                      ? "No invoice data available"
                      : "No unpaid invoices"}
                  </p>
                  <p className="mt-1 text-[10px] text-txt-muted">
                    {hasLoadError
                      ? "Try refreshing the dashboard."
                      : "You&apos;re all caught up."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-line bg-canvas/30">
            <Link href="/invoices">
              <Button
                variant="outline"
                className="w-full bg-surface border-line text-txt-primary hover:bg-surface-hover font-mono text-xs h-9 justify-between cursor-pointer"
              >
                <span>Manage Invoices</span>
                <ArrowUpRight className="size-3.5 text-txt-muted" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. Bottom Section: Revenue Chart */}
      <Card className="rounded-lg border-line bg-surface py-0 shadow-none text-left">
        <CardHeader className="p-5 border-b border-line flex-row items-center justify-between">
          <div>
            <CardTitle className="font-mono text-xs text-txt-muted uppercase tracking-wider">
              CASHFLOW_LEDGER // 6-MONTH HISTORY
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
              Collected vs. Unbilled Revenue Trajectory
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 rounded border border-line bg-canvas px-2 py-1 text-txt-secondary">
              <span className="size-1.5 rounded-full bg-status-paid shadow-[0_0_8px_var(--status-paid)]" />{" "}
              Paid
            </span>
            <span className="flex items-center gap-1.5 rounded border border-line bg-canvas px-2 py-1 text-txt-secondary">
              <span className="size-1.5 rounded-full bg-status-pending shadow-[0_0_8px_var(--status-pending)]" />{" "}
              Unbilled
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-6">
          {isLoading ? (
            <div className="grid h-[240px] place-items-center font-mono text-xs text-txt-muted">
              Loading cashflow data…
            </div>
          ) : hasChartData ? (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                  barGap={6}
                >
                  <defs>
                    <linearGradient
                      id="collected-bar-gradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--status-paid)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--status-paid)"
                        stopOpacity={0.72}
                      />
                    </linearGradient>
                    <linearGradient
                      id="unbilled-bar-gradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--status-pending)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--status-pending)"
                        stopOpacity={0.72}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--line)"
                    strokeDasharray="2 6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="var(--text-muted)"
                    fontSize={11}
                    fontFamily="monospace"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    stroke="var(--text-muted)"
                    fontSize={11}
                    fontFamily="monospace"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                    cursor={{ fill: "var(--surface-hover)", fillOpacity: 0.45 }}
                  />
                  <Bar
                    dataKey="collected"
                    fill="url(#collected-bar-gradient)"
                    radius={[5, 5, 1, 1]}
                    maxBarSize={34}
                  />
                  <Bar
                    dataKey="unbilled"
                    fill="url(#unbilled-bar-gradient)"
                    radius={[5, 5, 1, 1]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="grid h-[240px] place-items-center text-center">
              <div>
                <p className="font-sans text-sm font-medium text-txt-primary">
                  {hasLoadError
                    ? "No cashflow data available"
                    : "No cashflow data yet"}
                </p>
                <p className="mt-1 font-mono text-xs text-txt-muted">
                  {hasLoadError
                    ? "Try refreshing the dashboard."
                    : "Log time or create an invoice to populate this chart."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext: string;
  status: "paid" | "pending" | "normal";
  icon: React.ElementType;
}) {
  const statusStyles = {
    paid: "text-status-paid",
    pending: "text-status-pending",
    normal: "text-txt-primary",
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-4 text-left">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-txt-muted uppercase tracking-wider">
          {label}
        </span>
        <span className="grid size-7 place-items-center rounded bg-canvas border border-line text-txt-muted">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p
        className={`mt-2 text-2xl font-semibold font-mono tracking-tight ${statusStyles[status]}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-mono text-txt-secondary">{subtext}</p>
    </div>
  );
}
