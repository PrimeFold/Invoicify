import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function PaginationControls({
  basePath,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="pt-2">
      <PaginationContent className="gap-2">
        {hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious href={`${basePath}?page=${currentPage - 1}`} className="active-press font-sans text-xs" />
          </PaginationItem>
        )}

        <PaginationItem>
          <span className="px-3.5 py-1.5 rounded-full border border-line/60 bg-surface/80 font-sans text-xs font-medium text-txt-secondary shadow-2xs">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>

        {hasNextPage && (
          <PaginationItem>
            <PaginationNext href={`${basePath}?page=${currentPage + 1}`} className="active-press font-sans text-xs" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
