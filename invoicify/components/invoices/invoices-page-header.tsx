import { getClientOptions } from "@/app/actions/client";
import { ChooseClientDialog } from "./choose-client-dialog";

export async function InvoicesPageHeader({
  invoiceCount,
}: {
  invoiceCount?: number;
}) {
  const clientsList = await getClientOptions();
  const timeLogsList = await getTimeLogs
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-txt-primary">
            Invoices
          </h1>
          <span className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-xs text-txt-muted">
            [{invoiceCount ?? "—"}]
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-txt-secondary">
          Issue, track, and stream vector PDF invoices with public share links.
        </p>
      </div>
      <ChooseClientDialog clients={clientsList} />
    </div>
  );
}
