"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        setError(null);
        await createClient({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          hourlyRate: String(formData.get("hourlyRate") ?? ""),
        });
        form.reset();
        setOpen(false);
        router.refresh();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to create client.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-txt-primary px-3 text-xs font-medium text-canvas hover:opacity-90"
      >
        <Plus className="size-4" />
        Add Client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-line bg-surface text-txt-primary">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>Set up a client and their default hourly rate.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="client-name">Name</Label>
              <Input id="client-name" name="name" minLength={4} maxLength={30} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input id="client-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-hourly-rate">Hourly rate (USD)</Label>
              <Input id="client-hourly-rate" name="hourlyRate" type="number" min="0" step="0.01" required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create Client"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
