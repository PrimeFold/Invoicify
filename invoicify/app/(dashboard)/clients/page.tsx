import { getClients } from "@/app/actions/client";
import {
  type ClientMetrics,
  ClientsMetrics,
} from "@/components/clients/clients-metrics";
import { ClientsPageHeader } from "@/components/clients/clients-page-header";
import {
  ClientsTable,
  type ClientTableRow,
} from "@/components/clients/clients-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TooltipProvider } from "@/components/ui/tooltip";

type ClientsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const requestedPage =
    Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1;
  let clientResult = await getClients(requestedPage);

  if (
    clientResult.totalPages > 0 &&
    clientResult.page > clientResult.totalPages
  ) {
    clientResult = await getClients(clientResult.totalPages);
  }

  const clients: ClientTableRow[] = clientResult.items.map((client) => ({
    id: client.id as string,
    name: client.name,
    email: client.email,
    hourlyRate: Number(client.hourlyRate),
  }));

  const metrics: ClientMetrics = {
    activeClients: clientResult.total,
    averageHourlyRate:
      clients.length === 0
        ? 0
        : clients.reduce((total, client) => total + client.hourlyRate, 0) /
          clients.length,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <ClientsPageHeader clientCount={clientResult.total} />
        <ClientsMetrics metrics={metrics} />
        <ClientsTable clients={clients} />
        <PaginationControls
          basePath="/clients"
          currentPage={clientResult.page}
          totalPages={clientResult.totalPages}
          hasPreviousPage={clientResult.hasPreviousPage}
          hasNextPage={clientResult.hasNextPage}
        />
      </div>
    </TooltipProvider>
  );
}
