import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronLeft, ChevronRight, CornerDownRight } from "lucide-react";

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
    <footer className="contact-list-footer flex shrink-0 flex-col gap-3 border-t p-4 text-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span className="contact-list-page-label font-semibold">
          Page {page} of {totalPages || 1}
        </span>{" "}
        ({totalContacts} total contacts)
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
        <PageJump
          key={page}
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={onPageChange}
        />
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
      </div>
    </footer>
  );
}

function PageJump({
  page,
  totalPages,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const [pageInput, setPageInput] = useState("");
  const [pageError, setPageError] = useState("");

  const getPageError = (value: string): string => {
    const trimmedPage = value.trim();
    const requestedPage = Number(trimmedPage);
    if (!/^\d+$/.test(trimmedPage) || !Number.isSafeInteger(requestedPage)) {
      return "Enter a whole page number.";
    }
    if (requestedPage < 1 || requestedPage > totalPages) {
      return `Enter a page from 1 to ${totalPages}.`;
    }
    return "";
  };
  const isPageInputInvalid =
    pageInput.trim().length === 0 || Boolean(getPageError(pageInput));

  const jumpToPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = getPageError(pageInput);
    if (error) {
      setPageError(error);
      return;
    }

    setPageError("");
    const requestedPage = Number(pageInput.trim());
    if (requestedPage !== page) onPageChange(requestedPage);
  };

  return (
    <form
      onSubmit={jumpToPage}
      className="flex flex-wrap items-center gap-2"
      noValidate
    >
      <label htmlFor="contact-page-number" className="contact-page-jump-label">
        Go to page
      </label>
      <input
        id="contact-page-number"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        placeholder={`1 - ${totalPages}`}
        aria-invalid={Boolean(pageError)}
        aria-describedby="contact-page-help contact-page-error"
        className={`contact-page-jump-input ${pageError ? "has-error" : ""}`}
        value={pageInput}
        disabled={loading || totalPages < 1}
        onChange={(event) => {
          const value = event.target.value;
          setPageInput(value);
          setPageError(value ? getPageError(value) : "");
        }}
      />
      <span id="contact-page-help" className="sr-only">
        Enter a whole page number between 1 and {totalPages}.
      </span>
      <button
        type="submit"
        disabled={loading || totalPages < 1 || isPageInputInvalid}
        className="contact-details-secondary-button flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CornerDownRight size={15} />
        Go
      </button>
      <span id="contact-page-error" role="status" className="sr-only">
        {pageError}
      </span>
    </form>
  );
}
