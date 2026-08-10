import { getClientOptions } from "@/app/actions/client";
import { ChooseClientDialog } from "./choose-client-dialog";

export async function InvoicesPageHeader({
  invoiceCount,
}: {
  invoiceCount?: number;
}) {
  const clientsList = await getClientOptions();
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line/60 pb-6 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="apple-heading text-txt-primary">
            Invoices
          </h1>
          <span className="rounded-full border border-line/80 bg-surface/80 px-2.5 py-0.5 font-mono text-xs font-medium text-txt-muted shadow-2xs">
            {invoiceCount ?? "—"}
          </span>
        </div>
        <p className="mt-1 text-xs text-txt-secondary tracking-tight">
          Issue, track, and stream vector PDF invoices with public share links.
        </p>
      </div>
      <ChooseClientDialog clients={clientsList} />
    </div>
  );
}
