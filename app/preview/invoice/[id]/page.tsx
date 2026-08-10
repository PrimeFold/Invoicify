import {
  Download,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; expires?: string }>;
};

export default async function PublicInvoicePreviewPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { token, expires } = await searchParams;

  const pdfApiUrl =
    token && expires
      ? `/api/invoices/${id}/pdf?token=${encodeURIComponent(token)}&expires=${expires}`
      : `/api/invoices/${id}/pdf`;

  return (
    <div className="min-h-screen bg-canvas text-txt-primary flex flex-col font-sans selection:bg-primary/20">
      {/* Top Glass Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-sans font-bold text-sm tracking-tight text-txt-primary hover:opacity-90 transition-opacity"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold shadow-xs">
                ⚡
              </span>
              Invoicify
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-status-paid-border bg-status-paid-bg px-2.5 py-0.5 font-mono text-[10px] font-medium text-status-paid shadow-2xs">
              <ShieldCheck className="size-3" />
              Secure Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-line/80 bg-surface/80 text-xs font-medium text-txt-secondary hover:text-txt-primary hover:bg-surface-hover active-press transition-colors shadow-2xs"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Open Full Screen</span>
            </a>
            <a
              href={pdfApiUrl}
              download={`invoice-${id}.pdf`}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active-press transition-all shadow-xs"
            >
              <Download className="size-3.5" />
              Download PDF
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 flex flex-col items-center">
        <div className="w-full mb-4 flex items-center justify-between rounded-xl border border-line/60 bg-surface/60 px-4 py-2.5 text-xs text-txt-secondary backdrop-blur-md">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-primary shrink-0" />
            <span>This is a live vector preview generated with PDFKit.</span>
          </div>
          {expires ? (
            <span className="font-mono text-[10px] text-txt-muted hidden sm:inline">
              Link expires 24 hours after creation
            </span>
          ) : null}
        </div>

        {/* PDF Frame Viewer */}
        <div className="w-full h-[78vh] rounded-2xl border border-line/80 bg-surface/90 shadow-2xl overflow-hidden backdrop-blur-md">
          <iframe
            src={pdfApiUrl}
            className="w-full h-full border-none rounded-2xl"
            title={`Invoice PDF ${id}`}
          />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-line/60 bg-canvas/60 py-3 text-center text-[11px] font-mono text-txt-muted">
        Powered by Invoicify Vector PDF Engine
      </footer>
    </div>
  );
}
