import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContactPaginationProps {
  loading: boolean;
  page: number;
  totalPages: number;
  totalContacts: number;
  onPageChange: (page: number) => void;
}

export default function ContactPagination({
  loading,
  page,
  totalPages,
  totalContacts,
  onPageChange,
}: ContactPaginationProps) {
  return (
    <footer className="contact-list-footer flex shrink-0 flex-col gap-3 border-t p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="contact-list-page-label font-semibold">
          Page {page} of {totalPages || 1}
        </span>{" "}
        ({totalContacts} total contacts)
      </div>
      <nav aria-label="Contacts pages" className="flex gap-2">
        <button
          type="button"
          disabled={loading || page === 1}
          onClick={() => onPageChange(page - 1)}
          className="contact-details-secondary-button flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 font-semibold disabled:opacity-50 sm:flex-none"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="contact-details-secondary-button flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 font-semibold disabled:opacity-50 sm:flex-none"
        >
          Next <ChevronRight size={16} />
        </button>
      </nav>
    </footer>
  );
}
