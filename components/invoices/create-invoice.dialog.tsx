"use client";

import { useState, useTransition } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateInvoice } from "@/app/actions/invoices";
import { generateInvoiceShareToken } from "@/lib/signed-urls";
import { Button } from "../ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "../ui/toast";

type TimeLogOptions = {
  id: string;
  description: string;
  endTime: Date | null;
  durationMinutes: number;
};

interface TimeLogOptionsProps {
  timeLogs: TimeLogOptions[];
  clientName: string;
  clientId: string;
  onClose?: () => void;
}

const CreateInvoiceDialog = ({
  timeLogs,
  clientName,
  clientId,
  onClose,
}: TimeLogOptionsProps) => {
  const router = useRouter();
  const [isGenerating, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    timeLogs.map((log) => log.id)
  );

  const [createdResult, setCreatedResult] = useState<{
    invoiceNumber: string;
    shareUrl: string;
  } | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === timeLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(timeLogs.map((log) => log.id));
    }
  };

  const selectedCount = selectedIds.length;
  const totalMinutes = timeLogs
    .filter((log) => selectedIds.includes(log.id))
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleGenerate = () => {
    if (selectedIds.length === 0 || !clientId) return;

    startTransition(async () => {
      try {
        const result = await generateInvoice(clientId, selectedIds);
        const shareData = await generateInvoiceShareToken(result.invoice.id);

        setCreatedResult({
          invoiceNumber: result.invoice.invoiceNumber,
          shareUrl: shareData.shareUrl,
        });

        toast.success({
          title: "Invoice Generated",
          description: `Invoice #${result.invoice.invoiceNumber} created. Secure 24h link ready.`,
        });

        router.refresh();
      } catch (error) {
        console.error("Failed to generate invoice:", error);
        toast.error({
          title: "Generation Failed",
          description:
            error instanceof Error ? error.message : "Unable to create invoice.",
        });
      }
    });
  };

  const handleCopy = async () => {
    if (!createdResult?.shareUrl) return;
    await navigator.clipboard.writeText(createdResult.shareUrl);
    setCopied(true);
    toast.success({
      title: "Link Copied!",
      description: "24-hour secure preview link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDone = () => {
    if (onClose) onClose();
    router.push("/invoices");
    router.refresh();
  };

  if (createdResult) {
    return (
      <div className="space-y-5 text-left font-sans py-2">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-status-paid-border bg-status-paid-bg text-status-paid shadow-sm">
              <CheckCircle2 className="size-6" />
            </div>

            <DialogTitle className="font-sans text-lg font-bold text-txt-primary tracking-tight">
              Invoice #{createdResult.invoiceNumber} Created
            </DialogTitle>

            <DialogDescription className="font-sans text-xs text-txt-secondary max-w-xs">
              Itemized invoice generated for{" "}
              <span className="font-semibold text-txt-primary">{clientName}</span>.
              Use the 24-hour secure link below to share or preview:
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="apple-label-caps text-[10px] text-txt-muted flex items-center gap-1">
              <ShieldCheck className="size-3 text-status-paid" />
              Secure 24-Hour Preview Link
            </span>
            <span className="font-mono text-[10px] text-txt-muted">
              Expires in 24 hrs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={createdResult.shareUrl}
              className="h-10 w-full rounded-xl border border-line/80 bg-canvas/60 px-3 font-mono text-xs text-txt-primary select-all focus:outline-none"
            />

            <Button
              type="button"
              onClick={handleCopy}
              className="h-10 shrink-0 gap-1.5 rounded-xl bg-primary px-3.5 font-sans text-xs font-semibold text-primary-foreground hover:opacity-90 active-press shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 stroke-[3]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
          <a
            href={createdResult.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-line/80 bg-surface/80 text-xs font-sans font-semibold text-txt-primary hover:bg-surface-hover active-press transition-colors shadow-2xs"
          >
            <ExternalLink className="size-3.5" />
            Preview Invoice PDF
          </a>

          <Button
            type="button"
            onClick={handleDone}
            className="w-full sm:w-auto min-w-24 h-9 rounded-xl bg-surface border border-line text-txt-primary hover:bg-surface-hover font-sans text-xs font-semibold active-press"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left font-sans">
      <DialogHeader>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle className="font-sans text-base font-bold text-txt-primary tracking-tight">
            Unbilled Time Logs — {clientName}
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="h-7 px-2.5 font-sans text-[11px] font-medium text-txt-secondary hover:text-txt-primary active-press rounded-lg"
          >
            {selectedCount === timeLogs.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <DialogDescription className="font-sans text-xs text-txt-secondary mt-0.5">
          Select work entries to assemble into an itemized invoice for{" "}
          {clientName}.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {timeLogs.map((log) => {
          const isSelected = selectedIds.includes(log.id);
          const hours = (log.durationMinutes / 60).toFixed(1);

          return (
            <div
              key={log.id}
              onClick={() => toggleSelect(log.id)}
              className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all active-press ${
                isSelected
                  ? "border-primary/40 bg-primary/5 shadow-xs"
                  : "border-line/60 bg-canvas/40 hover:bg-surface-hover/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`grid size-5 shrink-0 place-items-center rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-line/80 bg-surface/80 text-transparent group-hover:border-primary/40"
                  }`}
                >
                  <Check className="size-3 stroke-[3]" />
                </div>

                <div className="min-w-0">
                  <p className="font-sans text-xs font-semibold text-txt-primary truncate">
                    {log.description}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-txt-muted flex items-center gap-1">
                    <Clock className="size-3" />
                    {log.endTime
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(log.endTime))
                      : "Completed"}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full border border-line/60 bg-surface/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-txt-primary shadow-2xs">
                {hours} hrs
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line/60 bg-canvas/60 px-3.5 py-2.5 font-sans text-xs">
        <span className="text-txt-secondary font-medium">
          Selected:{" "}
          <strong className="text-txt-primary">{selectedCount}</strong> of{" "}
          {timeLogs.length} entries
        </span>
        <span className="font-mono font-semibold text-txt-primary">
          Total: {totalHours} hrs
        </span>
      </div>

      <Button
        disabled={selectedCount === 0 || isGenerating}
        onClick={handleGenerate}
        className="w-full bg-primary text-primary-foreground font-sans text-xs font-semibold h-10 rounded-xl active-press shadow-xs"
      >
        <FileCheck2 className="size-4 mr-1.5" />
        {isGenerating
          ? "Generating Invoice..."
          : `Prepare Invoice (${selectedCount} ${
              selectedCount === 1 ? "entry" : "entries"
            })`}
      </Button>
    </div>
  );
};

export default CreateInvoiceDialog;
