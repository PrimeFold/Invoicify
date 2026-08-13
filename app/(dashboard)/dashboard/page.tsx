"use client";

import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { authClient } from "@/lib/auth";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const settle = { type: "spring", bounce: 0, duration: 0.5 } as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(date: Date) {
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatLogDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getTimeGreeting(name: string) {
  const hour = new Date().getHours();
  const firstName = name.split(" ")[0] || "there";
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 18) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

const statusTone: Record<string, string> = {
  Sent: "bg-primary/10 text-primary border border-primary/20",
  Overdue: "bg-destructive/10 text-destructive border border-destructive/20",
  Paid: "bg-surface-hover text-txt-secondary border border-line",
};

export default function DashboardPage() {
  const reduced = useReducedMotion();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userName = user?.name

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
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
  const isLoading = dashboardData === null && !hasLoadError;

  // Unbilled work calculations per client
  const unbilledMinutesByClient = new Map<string, number>();
  for (const log of timeLogs) {
    if (log.status === "UNBILLED") {
      unbilledMinutesByClient.set(
        log.clientId,
        (unbilledMinutesByClient.get(log.clientId) ?? 0) + log.durationMinutes
      );
    }
  }

  const clientsWithUnbilledData = clients.map((client) => {
    const unbilledHours = (unbilledMinutesByClient.get(client.id) ?? 0) / 60;
    return {
      name: client.name,
      rate: `$${client.hourlyRate}/hr`,
      unbilledAmount: unbilledHours * client.hourlyRate,
      unbilled: formatCurrency(unbilledHours * client.hourlyRate),
      hours: `${unbilledHours.toFixed(1)} hrs`,
      unbilledHours,
    };
  });

  const clientsWithUnbilledList = clientsWithUnbilledData.filter(
    (c) => c.unbilledHours > 0
  );
  const totalUnbilledAmount = clientsWithUnbilledData.reduce(
    (sum, c) => sum + c.unbilledAmount,
    0
  );
  const totalUnbilledHours = clientsWithUnbilledData.reduce(
    (sum, c) => sum + c.unbilledHours,
    0
  );

  // Weekly hours logged calculation (Current calendar week: Mon -> Sun)
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayIndex = (now.getDay() + 6) % 7; // Mon = 0
  startOfWeek.setDate(now.getDate() - dayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyHoursMap = [0, 0, 0, 0, 0, 0, 0];

  for (const log of timeLogs) {
    const logDate = new Date(log.startTime);
    if (logDate >= startOfWeek) {
      const idx = (logDate.getDay() + 6) % 7; // Mon = 0
      if (idx >= 0 && idx < 7) {
        weeklyHoursMap[idx] += log.durationMinutes / 60;
      }
    }
  }

  const trackedThisWeekHours = weeklyHoursMap.reduce((sum, h) => sum + h, 0);
  const maxWeeklyHour = Math.max(...weeklyHoursMap, 0);

  const weekData = daysOfWeek.map((day, i) => {
    const hrs = weeklyHoursMap[i];
    let displayPct: number;
    let isHighlighted: boolean;

    if (maxWeeklyHour > 0) {
      displayPct =
        hrs > 0 ? Math.max(Math.round((hrs / maxWeeklyHour) * 85), 16) : 8;
      isHighlighted = hrs > 0;
    } else {
      displayPct = 8; // Clean subtle baseline bar (0 fake mock data)
      isHighlighted = false;
    }

    return {
      d: day,
      h: displayPct,
      actualHours: hrs,
      isHighlighted,
    };
  });

  // Invoices metrics
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const totalCollectedRevenue = paidInvoices.reduce(
    (sum, i) => sum + i.totalAmount,
    0
  );
  const openInvoices = invoices.filter((i) => i.status === "UNPAID");
  const openInvoicesTotal = openInvoices.reduce(
    (sum, i) => sum + i.totalAmount,
    0
  );

  const formattedInvoices = invoices.slice(0, 5).map((inv) => {
    const clientName =
      clients.find((c) => c.id === inv.clientId)?.name ||
      inv.client?.name ||
      "Client";
    const isPaid = inv.status === "PAID";
    const status = isPaid ? "Paid" : "Sent";
    const due = isPaid
      ? `Paid ${formatRelativeTime(new Date(inv.createdAt))}`
      : `Due in 3 days`;
    return {
      id: inv.invoiceNumber || `INV-${inv.id.substring(0, 4).toUpperCase()}`,
      client: clientName,
      amount: formatCurrency(inv.totalAmount),
      due,
      status,
    };
  });

  const formattedLogs = timeLogs.slice(0, 5).map((log) => {
    const clientName =
      clients.find((c) => c.id === log.clientId)?.name ||
      log.client?.name ||
      "Client";
    return {
      task: log.description || "Work Session",
      client: clientName,
      dur: formatLogDuration(log.durationMinutes),
      when: formatRelativeTime(new Date(log.startTime)),
    };
  });

  const stats = [
    {
      label: "Tracked this week",
      value: `${trackedThisWeekHours.toFixed(1)} hrs`,
      note: "Goal 32 hrs",
    },
    {
      label: "Unbilled work",
      value: formatCurrency(totalUnbilledAmount),
      note: `${totalUnbilledHours.toFixed(1)} hrs · ${clientsWithUnbilledList.length} clients`,
    },
    {
      label: "Awaiting payment",
      value: formatCurrency(openInvoicesTotal),
      note: `${openInvoices.length} invoices open`,
    },
    {
      label: "Paid this month",
      value: formatCurrency(totalCollectedRevenue),
      note: `${paidInvoices.length} paid invoices`,
    },
  ];

  return (
    <div className="space-y-6 text-left font-sans selection:bg-primary/20 pb-8">
      {/* 1. Header Greeting + New Invoice Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-txt-primary sm:text-2xl font-sans">
            {getTimeGreeting(userName || "user")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-normal text-txt-secondary">
            {clients.length} active clients · {openInvoices.length} invoices
            need sending
          </p>
        </div>
        <Link
          href="/invoices"
          className="active-press inline-flex items-center justify-center gap-2 rounded-xl border border-line/80 bg-surface px-3.5 py-2.5 text-xs font-semibold text-txt-primary hover:bg-surface-hover shadow-2xs cursor-pointer"
        >
          <Plus className="size-4" />
          New invoice
        </Link>
      </div>

      {/* 2. Stats Grid (4 Cards) */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...settle, delay: 0.04 * i }}
            className="rounded-2xl border border-line/70 bg-surface p-4 shadow-2xs"
          >
            <p className="text-[11px] font-medium text-txt-secondary">
              {s.label}
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-txt-primary font-sans">
              {s.value}
            </p>
            <p className="mt-1 text-[10px] font-normal text-txt-muted">
              {s.note}
            </p>
          </motion.div>
        ))}
      </section>

      {/* 3. Middle Section: Hours this week (Left) + Unbilled by client (Right) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Hours this week Bar Chart */}
        <section className="rounded-2xl border border-line/70 bg-surface p-5 sm:p-6 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-txt-primary font-sans">
            Hours this week
          </h2>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
            {weekData.map((w, i) => (
              <div
                key={w.d}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-lg border border-line/80 bg-surface/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-txt-primary opacity-0 shadow-xs backdrop-blur-md transition-opacity group-hover:opacity-100">
                  {w.actualHours > 0
                    ? `${w.actualHours.toFixed(1)} hrs`
                    : "0 hrs"}
                </div>
                <div className="flex h-full w-full items-end">
                  <motion.div
                    initial={{ height: reduced ? `${w.h}%` : "4%" }}
                    animate={{ height: `${w.h}%` }}
                    transition={{ ...settle, delay: 0.04 * i }}
                    className={`w-full rounded-t-md transition-colors duration-200 ${
                      w.isHighlighted
                        ? "bg-primary"
                        : "bg-primary/20 hover:bg-primary/35"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium text-txt-muted font-mono">
                  {w.d}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Unbilled by client List */}
        <section className="rounded-2xl border border-line/70 bg-surface p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-txt-primary font-sans">
              Unbilled by client
            </h2>
            <span className="text-xs font-medium text-txt-muted">
              {totalUnbilledHours.toFixed(1)} hrs
            </span>
          </div>

          {isLoading ? (
            <p className="mt-4 py-6 text-center text-xs text-txt-muted">
              Loading clients…
            </p>
          ) : clientsWithUnbilledList.length === 0 ? (
            <p className="mt-4 py-8 text-center text-xs text-txt-muted">
              No unbilled work logged yet
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/40">
              {clientsWithUnbilledList.slice(0, 4).map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-txt-primary">
                      {c.name}
                    </p>
                    <p className="text-[11px] font-normal text-txt-muted mt-0.5">
                      {c.hours} · {c.rate}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs sm:text-sm font-semibold tracking-tight text-txt-primary font-mono">
                    {c.unbilled}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 4. Bottom Section: Recent time logs (Left) + Invoices (Right) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent time logs */}
        <section className="rounded-2xl border border-line/70 bg-surface p-5 sm:p-6 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-txt-primary font-sans">
            Recent time logs
          </h2>
          {isLoading ? (
            <p className="mt-4 py-6 text-center text-xs text-txt-muted">
              Loading logs…
            </p>
          ) : formattedLogs.length === 0 ? (
            <p className="mt-4 py-8 text-center text-xs text-txt-muted">
              No time logs recorded yet
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/40">
              {formattedLogs.map((l, index:number) => (
                <li
                  key={`${l.task}-${index}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-txt-primary">
                      {l.task}
                    </p>
                    <p className="text-[11px] font-normal text-txt-muted mt-0.5">
                      {l.client} · {l.when}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-medium text-txt-secondary">
                    {l.dur}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Invoices */}
        <section className="rounded-2xl border border-line/70 bg-surface p-5 sm:p-6 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-txt-primary font-sans">
            Invoices
          </h2>
          {isLoading ? (
            <p className="mt-4 py-6 text-center text-xs text-txt-muted">
              Loading invoices…
            </p>
          ) : formattedInvoices.length === 0 ? (
            <p className="mt-4 py-8 text-center text-xs text-txt-muted">
              No invoices created yet
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line/40">
              {formattedInvoices.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-txt-primary">
                      {inv.id} · {inv.client}
                    </p>
                    <p className="text-[11px] font-normal text-txt-muted mt-0.5">
                      {inv.due}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-semibold tracking-tight font-mono text-txt-primary">
                      {inv.amount}
                    </span>
                    <span
                      className={`text-[10px] rounded-md px-2 py-0.5 font-medium ${
                        statusTone[inv.status] ||
                        "bg-surface-hover text-txt-secondary border border-line"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
