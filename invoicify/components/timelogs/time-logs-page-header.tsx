import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimeLogsPageHeaderProps = {
  logCount?: number;
};

export function TimeLogsPageHeader({ logCount }: TimeLogsPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-txt-primary">
            Time Logs
          </h1>
          <span className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-xs text-txt-muted">
            [{logCount ?? "—"}]
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-txt-secondary">
          Track active work sessions and manage unbilled time accruals.
        </p>
      </div>
      <Button
        type="button"
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90"
      >
        <Plus className="size-3.5" />
        Manual Entry
      </Button>
    </div>
  );
}
