"use client";

import { Plus, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { getUnbilledTimeLogs } from "@/app/actions/timelog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientOption } from "@/types/client";
import type { TimeLogProps } from "@/types/timeLog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "../ui/toast";
import CreateInvoiceDialog from "./create-invoice.dialog";

export interface ChooseClientDialogProps {
  clients: ClientOption[];
}

export function ChooseClientDialog({ clients }: ChooseClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [available, setAvailable] = useState(true);

  const [timeLogs, setTimeLogs] = useState<TimeLogProps[]>([]);
  const [clientName, setClientName] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const [step, setStep] = useState<"select-client" | "create-invoice">(
    "select-client"
  );

  const selectedClient = clients.find((client) => client.id === clientId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!clientId) return;

    setLoading(true);

    try {
      const selected = clients.find((client) => client.id === clientId);

      const logs = await getUnbilledTimeLogs(clientId);

      if (!logs || logs.length === 0) {
        setClientName(selected?.name ?? "");
        setAvailable(false);
        return;
      }

      setClientName(selected?.name ?? "");
      setTimeLogs(logs);
      setAvailable(true);
      setStep("create-invoice");
    } catch (error) {
      console.error("Failed to fetch logs:", error);

      toast.error({
        title: "Something went wrong",
        description: "Could not load this client's time logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      setStep("select-client");
      setClientId(null);
      setClientName(null);
      setTimeLogs([]);
      setAvailable(true);
      setLoading(false);
    }
  };

  const resetEmptyState = () => {
    setAvailable(true);
    setClientId(null);
    setClientName(null);
  };

  if (clients.length === 0) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          type="button"
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 font-sans text-xs font-semibold text-primary-foreground hover:opacity-90 active-press shadow-xs"
        >
          <Plus className="size-3.5" />
          Create Invoice
        </Button>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md glass-panel p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-sans text-base font-semibold text-txt-primary">
                No clients found
              </DialogTitle>

              <DialogDescription className="font-sans text-xs text-txt-secondary">
                You need to create a client before you can generate an invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line/80 bg-canvas/40 p-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>

              <p className="font-sans text-sm font-semibold text-txt-primary">No clients yet</p>

              <p className="mt-1 max-w-xs font-sans text-xs text-txt-muted">
                Add a client first, then you'll be able to create invoices for
                their work.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        type="button"
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 font-sans text-xs font-semibold text-primary-foreground hover:opacity-90 active-press shadow-xs"
      >
        <Plus className="size-3.5" />
        Create Invoice
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md glass-panel p-6 shadow-2xl">
          {!available ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-sans text-base font-semibold text-txt-primary">
                  No unbilled time logs
                </DialogTitle>

                <DialogDescription className="font-sans text-xs text-txt-secondary">
                  There are no unbilled time logs for{" "}
                  <span className="font-semibold text-txt-primary">
                    {clientName}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line/80 bg-canvas/40 p-8 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-status-pending-bg text-status-pending border border-status-pending-border">
                  <Users className="size-5" />
                </div>

                <p className="font-sans text-sm font-semibold text-txt-primary">
                  Nothing to invoice
                </p>

                <p className="mt-1 max-w-xs font-sans text-xs text-txt-muted">
                  This client doesn't have any unbilled time logs yet.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 active-press rounded-xl border-line/80 bg-surface/80 text-xs font-sans font-medium"
                  onClick={resetEmptyState}
                >
                  Choose another client
                </Button>
              </div>
            </>
          ) : step === "select-client" ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-sans text-base font-semibold text-txt-primary">
                  Select a client
                </DialogTitle>

                <DialogDescription className="font-sans text-xs text-txt-secondary">
                  Choose a client to find their unbilled work and prepare an
                  invoice.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="invoice-client"
                    className="apple-label-caps text-[10px]"
                  >
                    Client
                  </Label>

                  <Select
                    value={clientId ?? ""}
                    onValueChange={(value) => setClientId(value)}
                  >
                    <SelectTrigger id="invoice-client" className="h-10 w-full rounded-xl border-line/80 bg-canvas/60 font-sans text-xs">
                      <SelectValue placeholder="Select a client...">
                        {selectedClient?.name}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="glass-panel">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id} label={client.name} className="font-sans text-xs">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-line/60 bg-canvas/40 px-3.5 py-3">
                  <p className="font-sans text-xs text-txt-muted">
                    We'll only show time logs that haven't already been billed
                    to this client.
                  </p>
                </div>

                <div className="flex justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="active-press rounded-xl font-sans text-xs font-medium text-txt-secondary hover:text-txt-primary"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    disabled={!clientId || loading}
                    onClick={handleClick}
                    className="min-w-24 active-press rounded-xl bg-primary text-primary-foreground font-sans text-xs font-semibold shadow-xs"
                  >
                    {loading ? "Loading..." : "Proceed"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CreateInvoiceDialog
              timeLogs={timeLogs}
              clientName={clientName ?? ""}
              clientId={clientId ?? ""}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
