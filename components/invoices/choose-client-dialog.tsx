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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!clientId) return;

    setLoading(true);

    try {
      const selectedClient = clients.find((client) => client.id === clientId);

      const logs = await getUnbilledTimeLogs(clientId);

      if (!logs || logs.length === 0) {
        setClientName(selectedClient?.name ?? "");
        setAvailable(false);
        return;
      }

      setClientName(selectedClient?.name ?? "");
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

  /*
   * EMPTY STATE:
   * No clients exist at all.
   */
  if (clients.length === 0) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          type="button"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90"
        >
          <Plus className="size-3.5" />
          Create Invoice
        </Button>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>No clients found</DialogTitle>

              <DialogDescription>
                You need to create a client before you can generate an invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>

              <p className="font-mono text-sm font-medium">No clients yet</p>

              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
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
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90"
      >
        <Plus className="size-3.5" />
        Create Invoice
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {/*
           * EMPTY STATE:
           * Client exists, but selected client has no
           * unbilled time logs.
           */}
          {!available ? (
            <>
              <DialogHeader>
                <DialogTitle>No unbilled time logs</DialogTitle>

                <DialogDescription>
                  There are no unbilled time logs for{" "}
                  <span className="font-medium text-foreground">
                    {clientName}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                  <Users className="size-5 text-muted-foreground" />
                </div>

                <p className="font-mono text-sm font-medium">
                  Nothing to invoice
                </p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  This client doesn't have any unbilled time logs yet.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={resetEmptyState}
                >
                  Choose another client
                </Button>
              </div>
            </>
          ) : step === "select-client" ? (
            <>
              <DialogHeader>
                <DialogTitle>Select a client</DialogTitle>

                <DialogDescription>
                  Choose a client to find their unbilled work and prepare an
                  invoice.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="invoice-client"
                    className="font-mono text-xs font-medium text-muted-foreground"
                  >
                    Client
                  </Label>

                  <Select
                    value={clientId ?? ""}
                    onValueChange={(value) => setClientId(value)}
                  >
                    <SelectTrigger id="invoice-client" className="h-10 w-full">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>

                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border bg-muted/30 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    We'll only show time logs that haven't already been billed
                    to this client.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    disabled={!clientId || loading}
                    onClick={handleClick}
                    className="min-w-24"
                  >
                    {loading ? "Loading..." : "Proceed"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /*
             * STEP 2:
             * Create invoice from selected time logs.
             */
            <CreateInvoiceDialog
              timeLogs={timeLogs}
              clientName={clientName ?? ""}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
