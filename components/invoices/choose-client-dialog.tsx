"use client"
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import {
  Select,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "../ui/button";
import CreateInvoiceDialog from "./create-invoice.dialog";

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
    
    return(
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="border-line bg-surface text-txt-primary">
              {step==="select-client" ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Choose</DialogTitle>
                    <DialogDescription>Choose the client you want to prepare invoice for</DialogDescription>
                  </DialogHeader>
                  <Select name="clientId" onValueChange={setClientId}>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
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