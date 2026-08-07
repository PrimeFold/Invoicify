"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import CreateInvoiceDialog from "./create-invoice.dialog";

type ClientOptions = {
  id: string;
  name: string;
};
interface CreateInvoiceDialogProps {
  clients: ClientOptions[];
}

export function ChooseClientDialog({ clients }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const[clientName,setClientName] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const [step, setStep] = useState<"select-client" | "create-invoice">(
    "select-client"
  );

  const handleClick = (e) => {
    e.preventDefault();
    if (!clientId && !clientName) return;
    setClientId(clientId);
    setClientName(clientName);
    setStep("create-invoice");
  };

  if (step === "create-invoice")
    return <CreateInvoiceDialog timeLogs={}/>;
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>No clients found</DialogTitle>
              <DialogDescription>
                Create a client before generating an invoice.
              </DialogDescription>
            </DialogHeader>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-line bg-surface text-txt-primary">
          {step === "select-client" ? (
            <>
              <DialogHeader>
                <DialogTitle>Select</DialogTitle>
                <DialogDescription>
                  Select the client you want to prepare invoice for :-{" "}
                </DialogDescription>
              </DialogHeader>
              <Select name="clientId" onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => handleClick}>Proceed</Button>
            </>
          ) : (
            <CreateInvoiceDialog clients={clientId} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
