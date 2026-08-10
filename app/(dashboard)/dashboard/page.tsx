"use client";

import React, { useState } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  ReceiptText,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

// 12 Months Freelancer Cashflow & Billable Hours Calculator
function createFreelancerMonthlyData(data: DashboardData | null) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));
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
        hours: 0,
      },
    ])
  );

  for (const timeLog of data?.timeLogs ?? []) {
    const date = new Date(timeLog.startTime);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const total = totals.get(key);
    const logHours = timeLog.durationMinutes / 60;

    if (total) {
      total.hours += logHours;
      if (timeLog.status === "UNBILLED") {
        total.unbilled += logHours * (timeLog.client?.hourlyRate || 0);
      }
    }
  }

  for (const invoice of data?.invoices ?? []) {
    if (invoice.status !== "PAID") continue;

    const date = new Date(invoice.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const total = totals.get(key);
    if (total) {
      total.collected += invoice.totalAmount;
    }
  }

  const result = [...totals.values()];

  return result.map((item) => {
    return {
      ...item,
      collected: item.collected,
      hours: Number(item.hours.toFixed(1)),
    };
  });
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userName = user?.name || "Freelancer";
  const userEmail = user?.email || "user@invoicify.dev";

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"12m" | "30d" | "7d" | "24h">("12m");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

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
  const chartData = createFreelancerMonthlyData(dashboardData);
  const isLoading = dashboardData === null && !hasLoadError;

  // Calculate Client Metrics
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

  const totalUnbilledAmount = activeClients.reduce(
    (sum, c) => sum + c.unbilledAmount,
    0
  );
  const totalUnbilledHours = activeClients.reduce(
    (sum, c) => sum + c.unbilledHours,
    0
  );

  const filteredClients = activeClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectClient = (id: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClientIds.length === filteredClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(filteredClients.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-6 text-left font-sans selection:bg-primary/20">
      {/* 1. Top Breadcrumb & Authenticated User Profile Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-txt-secondary font-medium">
          <span className="flex items-center gap-1.5 text-txt-primary font-semibold">
            <span className="size-6 rounded-full bg-primary/20 text-primary grid place-items-center text-[10px] font-bold">
              {userName.substring(0, 2).toUpperCase()}
            </span>
            {userName}
          </span>
          <span className="text-txt-muted">›</span>
          <span className="text-txt-primary font-semibold">Dashboard</span>
        </div>

      </div>

      {/* 2. Welcome Header Greeting ME (The Logged-In Freelancer) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-txt-primary tracking-tight font-sans">
            Welcome back, {userName.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1 tracking-tight">
            Here's an overview of your active clients, unbilled hours, and collected revenue trajectory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/timelogs">
            <Button
              variant="outline"
              className="bg-surface/80 border-line/80 text-txt-primary hover:bg-surface-hover font-sans text-xs h-9 px-3.5 rounded-xl cursor-pointer inline-flex items-center gap-2 active-press shadow-2xs"
            >
              <Clock className="size-3.5 text-txt-muted" />
              Log Hours
            </Button>
          </Link>
          <Link href="/invoices">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 font-sans text-xs h-9 px-3.5 rounded-xl cursor-pointer inline-flex items-center gap-2 active-press shadow-xs">
              <Plus className="size-3.5" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Main Freelancer Financial Chart: Revenue Collected & Logged Hours */}
      <Card className="rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md p-6 shadow-sm text-left overflow-hidden">
        {/* Chart Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-txt-primary tracking-tight font-sans">
                Revenue & Logged Hours Trajectory
              </h2>
            </div>
            <p className="font-sans text-xs text-txt-secondary mt-0.5">
              Unbilled Accrual: <strong className="text-status-pending">{formatCurrency(totalUnbilledAmount)}</strong> ({totalUnbilledHours.toFixed(1)} hrs)
            </p>
          </div>

          {/* Time Segmented Control Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-xl border border-line/80 bg-canvas/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTimeFilter("12m")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "12m"
                    ? "bg-surface text-txt-primary shadow-xs font-semibold"
                    : "text-txt-muted hover:text-txt-primary"
                }`}
              >
                12 months
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("30d")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "30d"
                    ? "bg-surface text-txt-primary shadow-xs font-semibold"
                    : "text-txt-muted hover:text-txt-primary"
                }`}
              >
                30 days
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("7d")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "7d"
                    ? "bg-surface text-txt-primary shadow-xs font-semibold"
                    : "text-txt-muted hover:text-txt-primary"
                }`}
              >
                7 days
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("24h")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "24h"
                    ? "bg-surface text-txt-primary shadow-xs font-semibold"
                    : "text-txt-muted hover:text-txt-primary"
                }`}
              >
                24 hours
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-line/80 bg-surface/80 text-xs font-medium text-txt-primary hover:bg-surface-hover active-press"
            >
              <Filter className="size-3.5 mr-1.5 text-txt-muted" />
              Filters
            </Button>
          </div>
        </div>

        {/* Purple Bar Chart (Revenue $) + Dashed Line Overlay (Logged Hours) */}
        <div className="h-[260px] w-full pt-2">
          {isLoading ? (
            <div className="grid h-full place-items-center text-xs text-txt-muted font-sans">
              Loading cashflow data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
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
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="var(--text-muted)"
                  fontSize={11}
                  fontFamily="sans-serif"
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="#7f56d9"
                  fontSize={11}
                  fontFamily="sans-serif"
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-hover)", opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-line/80 bg-surface/95 p-3 shadow-xl backdrop-blur-md text-xs font-sans space-y-1">
                          <p className="font-bold text-txt-primary">{data.month}</p>
                          <p className="text-status-paid font-mono font-semibold">
                            Collected: {formatCurrency(data.collected)}
                          </p>
                          <p className="text-primary font-mono font-semibold">
                            Billable Work: {data.hours} hrs logged
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Revenue Collected ($) Bar Chart */}
                <Bar
                  yAxisId="left"
                  dataKey="collected"
                  fill="#7f56d9"
                  radius={[6, 6, 0, 0]}
                  barSize={14}
                />
                {/* Billable Logged Hours (hrs) Dashed Line Overlay */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hours"
                  stroke="#7f56d9"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4, fill: "#7f56d9" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 4. Recently Active Client Accounts & Work Entries */}
      <div className="space-y-4 pt-2">
        {/* Header Title + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-txt-primary tracking-tight font-sans">
              Active Client Accounts
            </h2>
            <p className="text-xs text-txt-secondary">
              Track client hourly rates, unbilled accrued time, and billable work status.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 size-3.5 text-txt-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="h-9 w-full rounded-xl border border-line/80 bg-surface/80 pl-9 pr-9 font-sans text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-2xs"
            />
            <kbd className="absolute right-3 top-2.5 pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-line/80 bg-canvas px-1 font-mono text-[9px] font-medium text-txt-muted">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Filter Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/80 bg-surface/60 p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-line/80 bg-surface px-3 py-1.5 text-xs text-txt-primary font-medium shadow-2xs">
              <Filter className="size-3.5 text-txt-muted" />
              <span>Filter</span>
              <ChevronDown className="size-3 text-txt-muted ml-1" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-line/80 bg-surface px-3 py-1.5 text-xs text-txt-primary font-medium shadow-2xs">
              <span>Equals</span>
              <ChevronDown className="size-3 text-txt-muted ml-1" />
            </div>

            <input
              type="text"
              placeholder="Enter a value"
              className="h-8 rounded-xl border border-line/80 bg-surface px-3 font-sans text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-2xs"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedClientIds([]);
            }}
            className="h-8 px-3 font-sans text-xs font-semibold text-txt-secondary hover:text-txt-primary active-press rounded-xl"
          >
            Clear all
          </Button>
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-2xs active-press"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span>{selectedClientIds.length} selected</span>
            <ChevronDown className="size-3" />
          </button>
        </div>

        {/* Client Accounts Table */}
        <Card className="overflow-hidden rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md py-0 shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-line/60 bg-canvas/40 apple-label-caps text-[9px] text-txt-muted">
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredClients.length > 0 &&
                        selectedClientIds.length === filteredClients.length
                      }
                      onChange={toggleSelectAll}
                      className="size-4 rounded border-line text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Client Account</th>
                  <th className="px-4 py-3">Hourly Rate</th>
                  <th className="px-4 py-3">Unbilled Time</th>
                  <th className="px-4 py-3">Unbilled Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-txt-muted font-sans">
                      Loading client accounts…
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center font-sans">
                      <p className="text-sm font-medium text-txt-primary">
                        No client accounts found
                      </p>
                      <p className="mt-1 text-xs text-txt-muted">
                        Add a client or adjust your search query.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClientIds.includes(client.id);

                    return (
                      <tr
                        key={client.id}
                        onClick={() => toggleSelectClient(client.id)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "bg-primary/5"
                            : "hover:bg-surface-hover/60"
                        }`}
                      >
                        <td className="w-10 px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectClient(client.id)}
                            className="size-4 rounded border-line text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="grid size-8 place-items-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs shrink-0">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-sans text-xs font-semibold text-txt-primary truncate">
                                {client.name}
                              </p>
                              <p className="font-mono text-[10px] text-txt-muted truncate mt-0.5">
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-txt-primary">
                          ${client.hourlyRate.toFixed(2)}/hr
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-txt-secondary">
                          {client.unbilledHours > 0 ? (
                            <span className="font-semibold text-txt-primary">{client.unbilledHours.toFixed(1)} hrs</span>
                          ) : (
                            <span className="text-txt-muted">0 hrs</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px]">
                          {client.unbilledAmount > 0 ? (
                            <span className="font-bold text-status-pending">
                              {formatCurrency(client.unbilledAmount)}
                            </span>
                          ) : (
                            <span className="text-txt-muted">$0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
