"use client";

import { useOptimistic, useTransition } from "react";
import { Building2, CheckCircle2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteTimeLog } from "@/app/actions/timelog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type TimeLogTableRow = {
  id: string;
  description: string;
  clientName: string;
  duration: string;
  hours: number;
  hourlyRate: number;
  total: number;
  date: string;
  status: "BILLED" | "UNBILLED";
};

export function TimeLogsTable({ logs }: { logs: TimeLogTableRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLogs, setOptimisticLogs] = useOptimistic(
    logs,
    (state, idToDelete: string) => state.filter((item) => item.id !== idToDelete)
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      // 1. Instantly remove row from UI (0ms latency)
      setOptimisticLogs(id);

      try {
        // 2. Perform DB deletion in background
        await deleteTimeLog(id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete time log:", error);
      }
    });
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-line/70 bg-surface py-0 text-left">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-line/60 bg-canvas/40 apple-label-caps text-[9px] text-txt-muted">
              <th className="px-4 py-3">Task / Description</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40">
            {optimisticLogs.length ? (
              optimisticLogs.map((log) => (
                <TimeLogRow
                  key={log.id}
                  log={log}
                  onDelete={() => handleDelete(log.id)}
                  isPending={isPending}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-sans">
                  <p className="text-sm font-medium text-txt-primary">
                    No time logs to display
                  </p>
                  <p className="mt-1 text-xs text-txt-muted">
                    Track your work hours using the timer above to generate billable logs.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TimeLogRow({
  log,
  onDelete,
  isPending,
}: {
  log: TimeLogTableRow;
  onDelete: () => void;
  isPending: boolean;
}) {
  const billed = log.status === "BILLED";

  return (
    <tr className="transition-colors duration-150 ease-out hover:bg-surface-hover/60">
      <td className="px-4 py-3.5 font-sans font-medium text-txt-primary">
        {log.description}
        <p className="mt-0.5 font-mono text-[10px] text-txt-muted">
          {log.date} • ID: {log.id}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1.5 font-sans text-txt-secondary text-xs">
          <Building2 className="size-3.5 text-primary" />
          {log.clientName}
        </span>
      </td>
      <td className="px-4 py-3.5 font-mono font-semibold text-txt-primary">
        {log.duration}
      </td>
      <td className="px-4 py-3.5 font-mono text-txt-muted text-[11px]">
        {formatCurrency(log.hourlyRate)}/hr
      </td>
      <td className="px-4 py-3.5 font-mono font-semibold text-txt-primary">
        {formatCurrency(log.total)}
      </td>
      <td className="px-4 py-3.5">
        {billed ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-status-paid-border bg-status-paid-bg px-2 py-0.5 text-[10px] font-medium text-status-paid">
            <CheckCircle2 className="size-3" />
            BILLED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-status-pending-border bg-status-pending-bg px-2 py-0.5 text-[10px] font-medium text-status-pending">
            <span className="size-1.5 rounded-full bg-status-pending" />
            UNBILLED
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={onDelete}
            aria-label={`Delete ${log.description}`}
            className="size-8 p-0 text-txt-muted hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
