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
import { LoadingIndicator } from "../application/loading-indicator/loading-indicator";

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
        setError(
          error instanceof Error ? error.message : "Unable to create client."
        );
      }
    });
  }

  if (isPending)
    return <LoadingIndicator type="line-simple" size="md" label="Loading..." />;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 font-sans text-xs font-semibold text-primary-foreground hover:opacity-90 active-press shadow-xs"
      >
        <Plus className="size-3.5" />
        Add Client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass-panel p-6 shadow-2xl text-txt-primary">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold text-txt-primary">
              Add Client
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-txt-secondary">
              Set up a client profile and their default hourly billing rate.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="client-name" className="apple-label-caps text-[10px]">
                Name
              </Label>
              <Input
                id="client-name"
                name="name"
                minLength={4}
                maxLength={30}
                placeholder="e.g. Acme Corporation"
                required
                className="h-10 rounded-xl border-line/80 bg-canvas/60 font-sans text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-email" className="apple-label-caps text-[10px]">
                Email
              </Label>
              <Input
                id="client-email"
                name="email"
                type="email"
                placeholder="billing@acme.com"
                required
                className="h-10 rounded-xl border-line/80 bg-canvas/60 font-sans text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-hourly-rate" className="apple-label-caps text-[10px]">
                Hourly rate (USD)
              </Label>
              <Input
                id="client-hourly-rate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                required
                className="h-10 rounded-xl border-line/80 bg-canvas/60 font-sans text-xs font-mono"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-status-overdue-border bg-status-overdue-bg p-3">
                <p className="font-sans text-xs font-medium text-status-overdue">{error}</p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="active-press rounded-xl border-line/80 bg-surface/80 text-xs font-sans font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="active-press rounded-xl bg-primary text-primary-foreground font-sans text-xs font-semibold shadow-xs"
              >
                {isPending ? "Creating…" : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
