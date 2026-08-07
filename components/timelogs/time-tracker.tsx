"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTimeLog } from "@/app/actions/timelog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TimeTrackerProps = {
  clients: Array<{ id: string; name: string }>;
};

function formatElapsedTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function TimeTracker({ clients }: TimeTrackerProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    if (!isTracking) return;

    const timer = window.setInterval(
      () => setElapsedSeconds((seconds) => seconds + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [isTracking]);

  function startTimer() {
    if (!description.trim() || !clientId) {
      setError("Enter a description and select a client before starting.");
      return;
    }

    setError(null);
    setElapsedSeconds(0);
    setStartedAt(new Date());
    setIsTracking(true);
  }

  function stopTimer() {
    if (!startedAt) return;

    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    setIsTracking(false);

    startTransition(async () => {
      try {
        await createTimeLog({
          clientId,
          description: description.trim(),
          startTime: startedAt,
          endTime,
          durationMinutes,
          status: "UNBILLED",
        });
        setDescription("");
        setClientId("");
        setStartedAt(null);
        setElapsedSeconds(0);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save the time log."
        );
      }
    });
  }

  const canStart = clients.length > 0 && !isSaving;

  return (
    <Card className="rounded-lg border-line bg-surface p-4 shadow-none">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <span
            className={`grid size-9 place-items-center rounded border font-mono text-xs ${isTracking ? "animate-pulse border-status-pending-border bg-status-pending-bg text-status-pending" : "border-line bg-canvas text-txt-muted"}`}
          >
            <Clock className="size-4" />
          </span>
          <div className="flex-1 space-y-2">
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isTracking || isSaving}
              placeholder="What are you working on right now?"
              className="w-full border-none bg-transparent font-sans text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none disabled:opacity-60"
            />
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isTracking || isSaving || clients.length === 0}
              className="w-full bg-transparent font-mono text-[10px] text-txt-muted outline-none disabled:opacity-60"
            >
              <option value="">
                {clients.length === 0
                  ? "Add a client before tracking time"
                  : "Select a client"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {error && (
              <p className="font-mono text-[10px] text-red-400">{error}</p>
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-4 border-t border-line pt-3 md:w-auto md:justify-end md:border-t-0 md:pt-0">
          <span className="font-mono text-2xl font-bold tracking-wider text-txt-primary">
            {formatElapsedTime(elapsedSeconds)}
          </span>
          <Button
            type="button"
            disabled={isSaving || (!isTracking && !canStart)}
            onClick={isTracking ? stopTimer : startTimer}
            className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-4 font-mono text-xs ${isTracking ? "border border-red-800/60 bg-red-950/80 text-red-400 hover:bg-red-900/80" : "border border-status-paid-border bg-status-paid-bg text-status-paid hover:bg-status-paid-bg/80"}`}
          >
            {isSaving ? (
              "Saving…"
            ) : isTracking ? (
              <>
                <Square className="size-3.5 fill-red-400" /> Stop Timer
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-status-paid" /> Start Timer
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
