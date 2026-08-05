import { CreateClientDialog } from "@/components/clients/create-client-dialog";

type ClientsPageHeaderProps = {
  clientCount?: number;
};

export function ClientsPageHeader({ clientCount }: ClientsPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-txt-primary">Clients</h1>
          <span className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-xs text-txt-muted">
            [{clientCount ?? "—"}]
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-txt-secondary">
          Manage client billing profiles, hourly rates, and active time logs.
        </p>
      </div>
      <CreateClientDialog />
    </div>
  );
}
