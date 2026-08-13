"use client";

import { useState } from "react";
import type { ClientOption } from "@/types/client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { toast } from "../ui/toast";
import { TimeTracker } from "./time-tracker";

interface TimeLogsPageHeaderProps {
  logCount?: number;
  clientList: ClientOption[];
}

export function TimeLogsPageHeader({
  logCount,
  clientList,
}: TimeLogsPageHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!clientId) return;

    setLoading(true);

    try {
      const selectedClient = clientList.find(
        (client) => client.id === clientId
      );

      setClientName(selectedClient?.name ?? "");
      setAvailable(true);
    } catch (err) {
      console.error("Failed to select client:", err);

      toast.error({
        title: "Something went wrong",
        description: "Could not select this client.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEmptyState = () => {
    setClientId(null);
    setClientName(null);
    setAvailable(true);
  };

  if (clientList.length === 0) {
    return (
      <div>
        <Select disabled>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Choose your client" />
          </SelectTrigger>

          <SelectContent className="glass-panel">
            <SelectGroup>
              <SelectLabel className="text-txt-secondary">
                Clients
              </SelectLabel>

              <SelectItem
                value="no-clients"
                className="text-txt-primary"
              >
                No clients found, add clients to log..
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <>
      <TimeTracker
        clients={clientList.map((client) => ({
          id: client.id as string,
          name: client.name,
        }))}
      />

      <div className="flex flex-col justify-between gap-4 border-b border-line/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="apple-heading text-txt-primary">
              Time Logs
            </h1>

            <span className="rounded-full border border-line/80 bg-surface/80 px-2.5 py-0.5 font-mono text-xs font-medium text-txt-muted">
              {logCount ?? "—"}
            </span>
          </div>

          <p className="mt-1 text-xs text-txt-secondary tracking-tight">
            Track active work sessions and manage unbilled time accruals.
          </p>
        </div>
      </div>
    </>
  );
}