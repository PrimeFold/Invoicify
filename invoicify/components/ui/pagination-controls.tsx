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
    <Pagination className="pt-1">
      <PaginationContent>
        {hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious href={`${basePath}?page=${currentPage - 1}`} />
          </PaginationItem>
        )}

        <PaginationItem>
          <span className="px-3 font-mono text-xs text-txt-muted">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>

        {hasNextPage && (
          <PaginationItem>
            <PaginationNext href={`${basePath}?page=${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
