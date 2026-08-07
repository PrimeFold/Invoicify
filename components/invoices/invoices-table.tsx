import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type InvoiceTableRow = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
};

export function InvoicesTable({ invoices }: { invoices: InvoiceTableRow[] }) {
  return (
    <Card className="overflow-hidden rounded-lg border-line bg-surface py-0 text-left shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas/40 text-[10px] uppercase tracking-wider text-txt-muted">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {invoices.length ? (
              invoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="font-sans text-sm font-medium text-txt-primary">
                    No invoices to display
                  </p>
                  <p className="mt-1 text-xs text-txt-muted">
                    Connect the authenticated invoice query to show billing
                    activity here.
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

function InvoiceRow({ invoice }: { invoice: InvoiceTableRow }) {
  return (
    <tr className="transition-colors hover:bg-surface-hover/50">
      <td className="px-4 py-3.5 font-semibold text-txt-primary">
        <div className="flex items-center gap-2">
          <ReceiptText className="size-4 text-txt-muted" />
          {invoice.id}
        </div>
      </td>
      <td className="px-4 py-3.5 font-sans font-medium text-txt-primary">
        {invoice.clientName}
        <p className="mt-0.5 font-mono text-[10px] font-normal text-txt-muted">
          {invoice.clientEmail}
        </p>
      </td>
      <td className="px-4 py-3.5 font-semibold text-txt-primary">
        {formatCurrency(invoice.amount)}
      </td>
      <td className="px-4 py-3.5 text-txt-secondary">
        {invoice.dueDate}
        <span className="block text-[10px] text-txt-muted">
          Created {invoice.createdDate}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`More options for ${invoice.id}`}
          className="size-8 p-0 text-txt-muted hover:bg-surface-hover hover:text-txt-primary"
        >
          <MoreVertical className="size-3.5" />
        </Button>
      </td>
    </tr>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceTableRow["status"] }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-paid-border bg-status-paid-bg px-2.5 py-0.5 text-[10px] text-status-paid">
        <CheckCircle2 className="size-3" />
        PAID
      </span>
    );
  if (status === "OVERDUE")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-800/50 bg-red-950/60 px-2.5 py-0.5 text-[10px] text-red-400">
        <AlertCircle className="size-3" />
        OVERDUE
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-status-pending-border bg-status-pending-bg px-2.5 py-0.5 text-[10px] text-status-pending">
      <Clock className="size-3" />
      UNPAID
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
