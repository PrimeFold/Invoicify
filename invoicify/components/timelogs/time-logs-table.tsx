import { Building2, CheckCircle2, MoreVertical, Trash2 } from "lucide-react";
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
  return <Card className="overflow-hidden rounded-lg border-line bg-surface py-0 text-left shadow-none"><div className="overflow-x-auto"><table className="w-full border-collapse text-left font-mono text-xs"><thead><tr className="border-b border-line bg-canvas/40 text-[10px] uppercase tracking-wider text-txt-muted"><th className="px-4 py-3">Task / Description</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-line/60">{logs.length ? logs.map((log) => <TimeLogRow key={log.id} log={log} />) : <tr><td colSpan={7} className="px-4 py-12 text-center"><p className="font-sans text-sm font-medium text-txt-primary">No time logs to display</p><p className="mt-1 text-xs text-txt-muted">Connect the authenticated time-log query to show tracked work here.</p></td></tr>}</tbody></table></div></Card>;
}

function TimeLogRow({ log }: { log: TimeLogTableRow }) {
  const billed = log.status === "BILLED";
  return <tr className="transition-colors hover:bg-surface-hover/50"><td className="px-4 py-3.5 font-sans font-medium text-txt-primary">{log.description}<p className="mt-0.5 font-mono text-[10px] text-txt-muted">{log.date} • ID: {log.id}</p></td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 font-sans text-txt-secondary"><Building2 className="size-3 text-txt-muted" />{log.clientName}</span></td><td className="px-4 py-3.5 font-semibold text-txt-primary">{log.duration}<span className="block text-[10px] font-normal text-txt-muted">({log.hours} hrs)</span></td><td className="px-4 py-3.5 text-txt-muted">{formatCurrency(log.hourlyRate)}/hr</td><td className="px-4 py-3.5 font-semibold text-txt-primary">{formatCurrency(log.total)}</td><td className="px-4 py-3.5">{billed ? <span className="inline-flex items-center gap-1.5 rounded-full border border-status-paid-border bg-status-paid-bg px-2 py-0.5 text-[10px] text-status-paid"><CheckCircle2 className="size-3" />BILLED</span> : <span className="inline-flex items-center gap-1.5 rounded-full border border-status-pending-border bg-status-pending-bg px-2 py-0.5 text-[10px] text-status-pending"><span className="size-1.5 rounded-full bg-status-pending" />UNBILLED</span>}</td><td className="px-4 py-3.5 text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="sm" aria-label={`Delete ${log.description}`} className="size-8 p-0 text-txt-muted hover:bg-surface-hover hover:text-red-400"><Trash2 className="size-3.5" /></Button><Button variant="ghost" size="sm" aria-label={`More options for ${log.description}`} className="size-8 p-0 text-txt-muted hover:bg-surface-hover hover:text-txt-primary"><MoreVertical className="size-3.5" /></Button></div></td></tr>;
}

function formatCurrency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
