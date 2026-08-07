import { getClients } from "@/app/actions/client";
import { getTimeLogs } from "@/app/actions/timelog";
import {
  TimeLogMetrics,
  type TimeLogMetrics as TimeLogMetricsData,
} from "@/components/timelogs/time-log-metrics";
import { TimeLogsPageHeader } from "@/components/timelogs/time-logs-page-header";
import {
  TimeLogsTable,
  type TimeLogTableRow,
} from "@/components/timelogs/time-logs-table";
import { TimeTracker } from "@/components/timelogs/time-tracker";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

export default async function TimeLogsPage() {
  const [timeLogResult, clientResult] = await Promise.all([
    getTimeLogs(1),
    getClients(1, 100),
  ]);

  const logs: TimeLogTableRow[] = timeLogResult.items.map((log) => {
    const hours = log.durationMinutes / 60;
    const hourlyRate = Number(log.client.hourlyRate);

    return {
      id: log.id,
      description: log.description,
      clientName: log.client.name,
      duration: formatDuration(log.durationMinutes),
      hours,
      hourlyRate,
      total: hours * hourlyRate,
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(log.startTime),
      status: log.status === "INVOICED" ? "BILLED" : "UNBILLED",
    };
  });

  const metrics = timeLogResult.items.reduce<TimeLogMetricsData>(
    (summary, log) => {
      const hours = log.durationMinutes / 60;
      const amount = hours * Number(log.client.hourlyRate);

      summary.totalHours += hours;
      summary.entryCount += 1;

      if (log.status === "UNBILLED") {
        summary.unbilledHours += hours;
        summary.unbilledAmount += amount;
      } else {
        summary.billedHours += hours;
        summary.billedAmount += amount;
      }

      return summary;
    },
    {
      totalHours: 0,
      entryCount: 0,
      unbilledAmount: 0,
      unbilledHours: 0,
      billedAmount: 0,
      billedHours: 0,
    }
  );

  return (
    <div className="space-y-6">
      <TimeLogsPageHeader logCount={timeLogResult.total} />
      <TimeTracker
        clients={clientResult.items.map((client) => ({
          id: client.id!,
          name: client.name,
        }))}
      />
      <TimeLogMetrics metrics={metrics} />
      <TimeLogsTable logs={logs} />
    </div>
  );
}
