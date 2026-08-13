"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  History,
  Lock,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markInvoiceAsPaid } from "@/app/actions/invoices";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type InvoiceTableRow = {
  id: string;
  dbId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
  isRecent?: boolean;
};

export function InvoicesTable({ invoices }: { invoices: InvoiceTableRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticInvoices, setOptimisticInvoices] = useOptimistic(
    invoices,
    (state, dbIdToMarkPaid: string) =>
      state.map((inv) =>
        inv.dbId === dbIdToMarkPaid ? { ...inv, status: "PAID" as const } : inv
      )
  );

  const handleMarkAsPaid = (dbId: string, invoiceNumber: string) => {
    startTransition(async () => {
      // 0ms instant UI update
      setOptimisticInvoices(dbId);

      try {
        await markInvoiceAsPaid(dbId);
        toast.success({
          title: "Invoice Marked as Paid",
          description: `Invoice #${invoiceNumber} status updated to PAID.`,
        });
        router.refresh();
      } catch (error) {
        console.error("Failed to mark invoice as paid:", error);
        toast.error({
          title: "Update Failed",
          description:
            error instanceof Error ? error.message : "Could not update status.",
        });
      }
    });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-line/70 bg-surface py-0 text-left">
      {/* Invoice History Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 bg-canvas/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg border border-line/60 bg-surface/80 text-primary shadow-2xs">
            <History className="size-4" />
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold text-txt-primary tracking-tight">
              Invoice History
            </h2>
            <p className="font-sans text-[11px] text-txt-muted">
              Chronological log of invoices generated over time. Active PDF preview is restricted to recent client invoices.
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto rounded-full border border-line/80 bg-surface/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-txt-muted shadow-2xs">
          {optimisticInvoices.length} {optimisticInvoices.length === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-line/60 bg-canvas/40 apple-label-caps text-[9px] text-txt-muted">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40 font-mono text-xs">
            {optimisticInvoices.length ? (
              optimisticInvoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.dbId}
                  invoice={invoice}
                  onMarkPaid={() => handleMarkAsPaid(invoice.dbId, invoice.id)}
                  isPending={isPending}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-sans">
                  <p className="text-sm font-medium text-txt-primary">
                    No invoice history
                  </p>
                  <p className="mt-1 text-xs text-txt-muted">
                    Generate an invoice for a client to start populating your billing history.
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

function InvoiceRow({
  invoice,
  onMarkPaid,
  isPending,
}: {
  invoice: InvoiceTableRow;
  onMarkPaid: () => void;
  isPending: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPreviewable = invoice.isRecent;
  const pdfUrl = `/api/invoices/${invoice.dbId}/pdf`;
  const isPaid = invoice.status === "PAID";

  return (
    <>
      <tr className="transition-colors duration-150 ease-out hover:bg-surface-hover/60">
        <td className="px-4 py-3.5 font-mono font-semibold text-txt-primary">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-primary" />
            {invoice.id}
          </div>
        </td>
        <td className="px-4 py-3.5 font-sans font-medium text-txt-primary">
          {invoice.clientName}
          <p className="mt-0.5 font-mono text-[10px] font-normal text-txt-muted">
            {invoice.clientEmail}
          </p>
        </td>
        <td className="px-4 py-3.5 font-mono font-semibold text-txt-primary">
          {formatCurrency(invoice.amount)}
        </td>
        <td className="px-4 py-3.5 text-txt-secondary font-mono text-[11px]">
          {invoice.createdDate}
        </td>
        <td className="px-4 py-3.5">
          <InvoiceStatusBadge status={invoice.status} />
        </td>
        <td className="px-4 py-3.5 text-right font-sans">
          <div className="flex items-center justify-end gap-2">
            {/* Mark as Paid Action Button (if not paid) */}
            {!isPaid ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setConfirmOpen(true)}
                className="h-8 px-2.5 font-sans text-xs font-semibold text-status-paid border-status-paid-border bg-status-paid-bg hover:bg-status-paid-bg/80 rounded-xl active-press transition-all shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="size-3.5 mr-1" />
                Mark Paid
              </Button>
            ) : null}

            {/* Preview PDF or Archived Lock */}
            {isPreviewable ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={pdfUrl} target="_blank" rel="noopener noreferrer" />}
                      className="h-8 px-2.5 font-sans text-xs font-semibold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all shadow-2xs"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Preview PDF
                    </Button>
                  }
                />
                <TooltipContent className="border-line/60 bg-canvas/90 backdrop-blur-md font-sans text-[11px] text-txt-primary rounded-lg shadow-md">
                  View current client invoice PDF
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-line/60 bg-canvas/40 px-2.5 py-1 text-[11px] font-medium text-txt-muted cursor-not-allowed">
                      <Lock className="size-3" />
                      Archived
                    </span>
                  }
                />
                <TooltipContent className="border-line/60 bg-canvas/90 backdrop-blur-md font-sans text-[11px] text-txt-muted rounded-lg shadow-md">
                  Historical record — preview locked
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>

      {/* Mark Paid Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="glass-panel p-6 shadow-2xl font-sans max-w-md rounded-2xl border border-line/80 bg-surface/95">
          <AlertDialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-status-paid-bg border border-status-paid-border text-status-paid shadow-2xs">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <AlertDialogTitle className="font-sans text-base font-bold text-txt-primary tracking-tight">
                  Mark Invoice #{invoice.id} as Paid?
                </AlertDialogTitle>
                <p className="font-mono text-[11px] text-txt-muted mt-0.5">
                  Amount: {formatCurrency(invoice.amount)} • {invoice.clientName}
                </p>
              </div>
            </div>

            <AlertDialogDescription className="font-sans text-xs text-txt-secondary leading-relaxed pt-1">
              Are you sure you want to mark this invoice as <strong className="text-status-paid">PAID</strong>?
              This will update your account financial metrics and record revenue collection.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-3 gap-2">
            <AlertDialogCancel
              variant="ghost"
              className="active-press rounded-xl font-sans text-xs font-medium text-txt-secondary hover:text-txt-primary"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onMarkPaid();
              }}
              className="active-press rounded-xl bg-status-paid hover:opacity-90 text-white font-sans text-xs font-semibold shadow-xs border border-status-paid-border"
            >
              Confirm & Mark Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceTableRow["status"] }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-paid-border bg-status-paid-bg px-2.5 py-0.5 text-[10px] font-medium text-status-paid shadow-2xs">
        <CheckCircle2 className="size-3" />
        PAID
      </span>
    );
  if (status === "OVERDUE")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-overdue-border bg-status-overdue-bg px-2.5 py-0.5 text-[10px] font-medium text-status-overdue shadow-2xs">
        <AlertCircle className="size-3" />
        OVERDUE
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-status-pending-border bg-status-pending-bg px-2.5 py-0.5 text-[10px] font-medium text-status-pending shadow-2xs">
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
