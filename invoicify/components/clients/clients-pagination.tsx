import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ClientsPaginationProps = {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function ClientsPagination({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
}: ClientsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="pt-1">
      <PaginationContent>
        {hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious href={`/clients?page=${currentPage - 1}`} />
          </PaginationItem>
        )}

        <PaginationItem>
          <span className="px-3 font-mono text-xs text-txt-muted">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>

        {hasNextPage && (
          <PaginationItem>
            <PaginationNext href={`/clients?page=${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
