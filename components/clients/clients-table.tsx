import {
  Building2,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MoreVertical,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
            {clients.length > 0 ? (
              clients.map((client) => (
                <ClientRow key={client.id} client={client} />
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

function ClientRow({ client }: { client: ClientTableRow }) {
  const hasUnbilledTime = (client.unbilledHours ?? 0) > 0;

  return (
    <tr className="transition-colors hover:bg-surface-hover/60 active-press">
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
          <ClientAction label="Log Time for Client" icon={Clock} />
          <ClientAction label="Generate Invoice" icon={FileText} />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`More options for ${client.name}`}
                  className="size-8 p-0 text-txt-muted hover:bg-surface-hover hover:text-txt-primary active-press rounded-lg"
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent className="glass-panel p-1.5 min-w-32 shadow-xl">
              <DropdownMenuGroup>
                <DropdownMenuItem className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive active-press">
                  <span>Delete</span>
                  <Trash className="size-3.5" />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}

function ClientAction({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Clock;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={label}
            className="size-8 p-0 text-txt-secondary hover:bg-surface-hover hover:text-txt-primary active-press rounded-lg"
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
