import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type InvoicePreviewItem = {
  description: string;
  hours: number;
  lineTotal: number;
};

export type InvoicePreviewData = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  createdAt: string;
  items: InvoicePreviewItem[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function InvoicePreviewHeader({ clientName }: { clientName: string }) {
  return (
    <CardHeader className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">Invoice Preview</CardTitle>
          <CardDescription>Shared invoice view for {clientName}</CardDescription>
        </div>
        <Badge variant="secondary">Preview</Badge>
      </div>
    </CardHeader>
  );
}

function InvoicePreviewDetails({
  invoiceNumber,
  clientName,
  clientEmail,
  createdAt,
}: {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  createdAt: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <p className="text-sm text-muted-foreground">Invoice #</p>
        <p className="font-medium">{invoiceNumber}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="font-medium">{new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Client</p>
        <p className="font-medium">{clientName}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="font-medium">{clientEmail}</p>
      </div>
    </div>
  );
}

function InvoicePreviewItems({ items }: { items: InvoicePreviewItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.description}-${index}`} className="flex justify-between gap-4">
          <div>
            <p className="font-medium">{item.description}</p>
            <p className="text-sm text-muted-foreground">{item.hours}h</p>
          </div>
          <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
        </div>
      ))}
    </div>
  );
}

function InvoicePreviewSummary({ totalAmount }: { totalAmount: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">Total due</p>
      <p className="text-xl font-semibold">{formatCurrency(totalAmount)}</p>
    </div>
  );
}

export function InvoicePreviewCard({ preview }: { preview: InvoicePreviewData }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="mx-auto max-w-3xl">
        <InvoicePreviewHeader clientName={preview.clientName} />

        <CardContent className="space-y-6">
          <InvoicePreviewDetails
            invoiceNumber={preview.invoiceNumber}
            clientName={preview.clientName}
            clientEmail={preview.clientEmail}
            createdAt={preview.createdAt}
          />

          <Separator />
          <InvoicePreviewItems items={preview.items} />
          <Separator />
          <InvoicePreviewSummary totalAmount={preview.totalAmount} />
        </CardContent>
      </Card>
    </div>
  );
}
