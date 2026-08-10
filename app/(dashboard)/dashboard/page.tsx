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
    <div className="space-y-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-6">
        <div>
          <h1 className="apple-heading text-txt-primary">
            Dashboard
          </h1>
          <p className="text-xs text-txt-secondary mt-1 tracking-tight">
            Overview of active clients, unbilled time, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/timelogs">
            <Button
              variant="outline"
              className="bg-surface/80 border-line/80 text-txt-primary hover:bg-surface-hover font-sans text-xs h-9 px-3.5 rounded-xl cursor-pointer inline-flex items-center gap-2 active-press shadow-xs"
            >
              <Clock className="size-3.5 text-txt-muted" />
              Log Hours
            </Button>
          </Link>
          <Link href="/invoices">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 font-sans text-xs h-9 px-3.5 rounded-xl cursor-pointer inline-flex items-center gap-2 active-press shadow-sm">
              <Plus className="size-3.5" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          subtext={`${unpaidInvoices.length} invoices require action`}
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

      {/* 3. Middle Section: Active Clients + Action Needed Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Client Table (2 Cols) */}
        <Card className="lg:col-span-2 gap-0 rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md py-0 shadow-sm text-left overflow-hidden">
          <CardHeader className="p-5 border-b border-line/60 flex-row items-center justify-between">
            <div>
              <CardTitle className="apple-label-caps text-[10px]">
                Active Client Accounts
              </CardTitle>
              <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
                Current Client Work & Accrued Hours
              </CardDescription>
            </div>
            <Link
              href="/clients"
              className="text-xs text-txt-muted hover:text-primary transition-colors inline-flex items-center gap-1 active-press"
            >
              View All <ChevronRight className="size-3.5" />
            </Link>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-line/60 bg-canvas/40 apple-label-caps text-[9px] text-txt-muted">
                  <th className="pt-2.5 pb-2.5 px-5">Client</th>
                  <th className="pt-2.5 pb-2.5 px-4">Rate</th>
                  <th className="pt-2.5 pb-2.5 px-4">Unbilled Time</th>
                  <th className="pt-2.5 pb-2.5 px-4">Unbilled Total</th>
                  <th className="pt-2.5 pb-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-txt-muted font-sans"
                    >
                      Loading client details…
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
                      <p className="mt-1 text-xs text-txt-muted">
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
                      className="hover:bg-surface-hover/60 active-press transition-colors"
                    >
                      <td className="py-3 px-5">
                        <p className="font-sans font-semibold text-txt-primary text-xs tracking-tight">
                          {client.name}
                        </p>
                        <p className="text-[10px] text-txt-muted">
                          {client.lastActive
                            ? `Active ${formatRelativeTime(client.lastActive)}`
                            : "No logged work yet"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-txt-secondary font-sans text-xs">
                        ${client.hourlyRate.toFixed(2)}/hr
                      </td>
                      <td className="py-3 px-4 text-txt-secondary font-sans text-xs">
                        {client.unbilledHours > 0 ? (
                          `${client.unbilledHours} hrs`
                        ) : (
                          <span className="text-txt-muted">0 hrs</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs font-semibold">
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
                            className="h-7 text-[11px] px-2.5 text-txt-secondary hover:text-txt-primary border border-line/60 bg-canvas/60 hover:bg-surface-hover active-press disabled:opacity-30 rounded-lg"
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

        {/* Pending Invoices (1 Col) */}
        <Card className="rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md py-0 shadow-sm text-left flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader className="p-5 border-b border-line/60 flex-row items-center justify-between">
              <div>
                <CardTitle className="apple-label-caps text-[10px]">
                  Action Required
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
                  Unpaid Invoices
                </CardDescription>
              </div>
              <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full border border-status-pending-border bg-status-pending-bg text-status-pending font-medium shadow-2xs">
                {unpaidInvoices.length} Pending
              </span>
            </CardHeader>

            <div className="p-5 space-y-3 text-xs">
              {isLoading ? (
                <p className="text-txt-muted font-sans">Loading invoices…</p>
              ) : unpaidInvoices.length > 0 ? (
                unpaidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-line/60 bg-canvas/60 flex items-center justify-between active-press hover:border-line"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs font-semibold text-txt-primary">
                          {inv.id}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-status-pending-bg text-status-pending border border-status-pending-border">
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
                    <span className="font-sans text-xs font-semibold text-txt-primary">
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
                  <p className="mt-1 text-xs text-txt-muted">
                    {hasLoadError
                      ? "Try refreshing the dashboard."
                      : "You're all caught up."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-line/60 bg-canvas/30">
            <Link href="/invoices">
              <Button
                variant="outline"
                className="w-full bg-surface/80 border-line/80 text-txt-primary hover:bg-surface-hover font-sans text-xs h-9 justify-between cursor-pointer active-press rounded-xl"
              >
                <span>Manage Invoices</span>
                <ArrowUpRight className="size-3.5 text-txt-muted" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. Bottom Section: Revenue Chart */}
      <Card className="rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md py-0 shadow-sm text-left overflow-hidden">
        <CardHeader className="p-5 border-b border-line/60 flex-row items-center justify-between">
          <div>
            <CardTitle className="apple-label-caps text-[10px]">
              Revenue History
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-txt-primary mt-1">
              Collected vs. Unbilled Trajectory (6 Months)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-full border border-line/60 bg-canvas/60 px-2.5 py-1 text-txt-secondary text-[11px]">
              <span className="size-1.5 rounded-full bg-status-paid shadow-[0_0_8px_var(--status-paid)]" />{" "}
              Paid
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-line/60 bg-canvas/60 px-2.5 py-1 text-txt-secondary text-[11px]">
              <span className="size-1.5 rounded-full bg-status-pending shadow-[0_0_8px_var(--status-pending)]" />{" "}
              Unbilled
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-6">
          {isLoading ? (
            <div className="grid h-[240px] place-items-center font-sans text-xs text-txt-muted">
              Loading revenue data…
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
                        stopOpacity={0.75}
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
                        stopOpacity={0.75}
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
                    fontFamily="sans-serif"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    stroke="var(--text-muted)"
                    fontSize={11}
                    fontFamily="sans-serif"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                    cursor={{ fill: "var(--surface-hover)", fillOpacity: 0.45 }}
                  />
                  <Bar
                    dataKey="collected"
                    fill="url(#collected-bar-gradient)"
                    radius={[6, 6, 2, 2]}
                    maxBarSize={34}
                  />
                  <Bar
                    dataKey="unbilled"
                    fill="url(#unbilled-bar-gradient)"
                    radius={[6, 6, 2, 2]}
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
                    : "No revenue data yet"}
                </p>
                <p className="mt-1 text-xs text-txt-muted">
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
    <div className="glass-card p-4.5 text-left active-press">
      <div className="flex items-center justify-between">
        <span className="apple-label-caps text-[10px]">
          {label}
        </span>
        <span className="grid size-7 place-items-center rounded-lg bg-canvas/60 border border-line/60 text-txt-muted shadow-2xs">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p
        className={`mt-2 text-2xl font-bold font-sans tracking-tight ${statusStyles[status]}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-txt-secondary tracking-tight">{subtext}</p>
    </div>
  );
}
