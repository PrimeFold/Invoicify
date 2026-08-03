import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoicesPageHeader({ invoiceCount }: { invoiceCount?: number }) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2"><h1 className="text-xl font-semibold tracking-tight text-txt-primary">Invoices</h1><span className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-xs text-txt-muted">[{invoiceCount ?? "—"}]</span></div>
        <p className="mt-1 font-mono text-xs text-txt-secondary">Issue, track, and stream vector PDF invoices with public share links.</p>
      </div>
      <Button type="button" className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90"><Plus className="size-3.5" />Create Invoice</Button>
    </div>
  );
}
