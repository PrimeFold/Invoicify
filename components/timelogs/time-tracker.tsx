"use client";

import { Clock, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createTimeLog } from "@/app/actions/timelog";
import { Button } from "@/components/ui/button";

type TimeTrackerProps = {
  clients: Array<{
    id: string;
    name: string;
  }>;
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
    if (!isTracking || !startedAt) return;

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);

      setElapsedSeconds(elapsed);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTracking, startedAt]);

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
        setError(null);

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

  const canStart =
    clients.length > 0 &&
    description.trim().length > 0 &&
    clientId.length > 0 &&
    !isSaving;

  return (
    <div className="rounded-2xl border border-line/70 bg-surface overflow-hidden text-left">
      {/* Top status bar */}
      <div className="flex items-center justify-between border-b border-line/60 bg-canvas/40 px-5 py-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`grid size-9 place-items-center rounded-xl border transition-all ${
              isTracking
                ? "border-status-pending-border bg-status-pending-bg text-status-pending"
                : "border-line/60 bg-surface/80 text-primary"
            }`}
          >
            <Clock className="size-4.5" />
          </div>

          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-txt-primary tracking-tight">
              {isTracking ? "Timer Running" : "Time Tracker"}
            </h2>

            <p className="mt-0.5 font-sans text-xs text-txt-muted">
              {isTracking
                ? "Currently tracking your active work session"
                : "Track billable time against a client"}
            </p>
          </div>
        </div>

        {/* Timer readout */}
        <div
          className={`font-mono text-2xl font-bold tracking-tight ${
            isTracking ? "text-status-pending" : "text-txt-primary"
          }`}
        >
          {formatElapsedTime(elapsedSeconds)}
        </div>
      </div>

      {/* Main controls */}
      <div className="p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center">
          {/* Description Input */}
          <div className="flex h-10.5 min-w-0 flex-1 items-center rounded-xl border border-line/60 bg-canvas/60 px-3.5 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isTracking || isSaving}
              placeholder="What are you working on?"
              className="w-full border-none bg-transparent font-sans text-xs text-txt-primary outline-none placeholder:text-txt-muted disabled:opacity-60"
            />
          </div>

          {/* Client Select */}
          <div className="flex h-10.5 w-full items-center rounded-xl border border-line/60 bg-canvas/60 px-3.5 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 lg:w-60">
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isTracking || isSaving || clients.length === 0}
              className="w-full cursor-pointer bg-transparent font-sans text-xs font-medium text-txt-primary outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" disabled className="bg-surface text-txt-primary">
                {clients.length === 0
                  ? "No clients available"
                  : "Select client"}
              </option>

              {clients.map((client) => (
                <option key={client.id} value={client.id} className="bg-surface text-txt-primary font-sans">
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <Button
            type="button"
            disabled={isSaving || (isTracking ? false : !canStart)}
            onClick={isTracking ? stopTimer : startTimer}
            className={`h-10.5 shrink-0 cursor-pointer gap-2 rounded-xl px-5 font-sans text-xs font-bold active-press transition-all ${
              isTracking
                ? "border border-status-overdue-border bg-status-overdue-bg text-status-overdue hover:bg-status-overdue-bg/80"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-none"
            }`}
          >
            {isSaving ? (
              "Saving..."
            ) : isTracking ? (
              <>
                <Square className="size-3.5 fill-current" />
                Stop Timer
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                Start Timer
              </>
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3.5 rounded-xl border border-status-overdue-border bg-status-overdue-bg p-3">
            <p className="font-sans text-xs font-medium text-status-overdue">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
