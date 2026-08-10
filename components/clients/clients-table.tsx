"use client";

import { useOptimistic, useTransition } from "react";
import {
  Building2,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ClientTableRow = {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  unbilledHours?: number;
  unbilledAmount?: number;
  totalBilled?: number;
};

type ClientsTableProps = {
  clients: ClientTableRow[];
};

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticClients, setOptimisticClients] = useOptimistic(
    clients,
    (state, idToDelete: string) => state.filter((item) => item.id !== idToDelete)
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      // 1. Instantly remove row from UI (0ms latency)
      setOptimisticClients(id);

      try {
        // 2. Perform DB deletion in background
        await deleteClient(id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete client:", error);
      }
    });
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-line/80 bg-surface/90 backdrop-blur-md py-0 shadow-sm text-left">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-line/60 bg-canvas/40 apple-label-caps text-[9px] text-txt-muted">
              <th className="px-4 py-3">Client Name</th>
              <th className="px-4 py-3">Hourly Rate</th>
              <th className="px-4 py-3">Unbilled Time</th>
              <th className="px-4 py-3">Total Billed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40 font-mono text-xs">
            {optimisticClients.length > 0 ? (
              optimisticClients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onDelete={() => handleDelete(client.id)}
                  isPending={isPending}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center font-sans">
                  <p className="text-sm font-medium text-txt-primary">
                    No clients to display
                  </p>
                  <p className="mt-1 text-xs text-txt-muted">
                    Add a client to start tracking billable work and managing invoicing profiles.
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

function ClientRow({
  client,
  onDelete,
  isPending,
}: {
  client: ClientTableRow;
  onDelete: () => void;
  isPending: boolean;
}) {
  const hasUnbilledTime = (client.unbilledHours ?? 0) > 0;

  return (
    <tr className="transition-colors duration-150 ease-out hover:bg-surface-hover/60">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg border border-line/60 bg-canvas/60 text-primary shadow-2xs">
            <Building2 className="size-4" />
          </span>
          <div>
            <p className="font-sans text-sm font-semibold text-txt-primary tracking-tight">
              {client.name}
            </p>
            <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-txt-muted">
              <Mail className="size-3" /> {client.email}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-line/60 bg-canvas/60 px-2.5 py-0.5 text-txt-primary font-mono text-[11px]">
          <DollarSign className="size-3 text-txt-muted" />
          {client.hourlyRate.toFixed(2)}/hr
        </span>
      </td>
      <td className="px-4 py-3.5">
        {hasUnbilledTime && client.unbilledAmount !== undefined ? (
          <div>
            <p className="font-mono font-semibold text-status-pending text-xs">
              {formatCurrency(client.unbilledAmount)}
            </p>
            <p className="font-sans text-[10px] text-txt-muted">
              {client.unbilledHours} hrs pending
            </p>
          </div>
        ) : (
          <span className="text-txt-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 font-mono font-semibold text-txt-primary">
        {client.totalBilled === undefined
          ? "—"
          : formatCurrency(client.totalBilled)}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <ClientAction label="Log Time for Client" icon={Clock} href="/timelogs" />
          <ClientAction label="Generate Invoice" icon={FileText} href="/invoices" />
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={onDelete}
            aria-label={`Delete ${client.name}`}
            className="size-8 p-0 text-txt-muted hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ClientAction({
  label,
  icon: Icon,
  href,
}: {
  label: string;
  icon: typeof Clock;
  href: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={label}
            nativeButton={false}
            className="size-8 p-0 text-txt-secondary hover:bg-surface-hover hover:text-txt-primary rounded-lg transition-colors"
            render={<Link href={href} />}
          >
            <Icon className="size-3.5" />
          </Button>
        }
      />
      <TooltipContent className="border-line/60 bg-canvas/90 backdrop-blur-md font-sans text-[11px] text-txt-primary rounded-lg shadow-md">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
