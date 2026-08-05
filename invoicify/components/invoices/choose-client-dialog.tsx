"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button";
import CreateInvoiceDialog from "./create-invoice.dialog";
import { Plus } from "lucide-react";


type ClientOptions={
  id:string;
  name:string;
}
interface CreateInvoiceDialogProps {
  clients: ClientOptions[];
}


export function ChooseClientDialog({clients}:CreateInvoiceDialogProps){
    const [open,setOpen] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);

    const [step, setStep] = useState<"select-client" | "create-invoice">("select-client");

    const handleClick = (e)=>{
      e.preventDefault();
      if(!clientId) return;
      setClientId(clientId);
      setStep("create-invoice");
    }
    
    if(step=="create-invoice") return <CreateInvoiceDialog clientId={clientId}/>
    if(clients.length ===0){
      return (
        <>
          <Button onClick={()=>setOpen(true)} type="button" className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90">
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
    
    return(
        <>
        <Button onClick={()=>setOpen(true)} type="button" className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 font-mono text-xs font-medium text-canvas hover:opacity-90">
          <Plus className="size-3.5" />
          Create Invoice
        </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="border-line bg-surface text-txt-primary">
              {step==="select-client" ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Choose</DialogTitle>
                    <DialogDescription>Choose the client you want to prepare invoice for :- </DialogDescription>
                  </DialogHeader>
                  <Select name="clientId" onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client"/>
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={()=>handleClick}
                  >
                    Proceed
                  </Button>
                </>
              ):(
                <CreateInvoiceDialog clientId={clientId}/>
              )}
            </DialogContent>
          </Dialog>
        </>
    )
}