import { RefreshCw, RotateCcw, Search } from "lucide-react";
import type { ContactListQuery } from "../../../../shared/src";
import ContactFilterSelect from "./ContactFilterSelect";

interface ContactFiltersProps {
  search: string;
  tag: string;
  company: string;
  sortBy: ContactListQuery["sortBy"];
  sortOrder: ContactListQuery["sortOrder"];
  tags: string[];
  loading: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onSortChange: (
    sortBy: ContactListQuery["sortBy"],
    sortOrder: ContactListQuery["sortOrder"],
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export default function ContactFilters({
  search,
  tag,
  company,
  sortBy,
  sortOrder,
  tags,
  loading,
  hasActiveFilters,
  onSearchChange,
  onTagChange,
  onCompanyChange,
  onSortChange,
  onClearFilters,
  onRefresh,
}: ContactFiltersProps) {
  return (
    <section
      aria-label="Contact filters"
      className="contact-workspace-panel flex shrink-0 flex-wrap gap-3 rounded-2xl border p-3 shadow-sm sm:p-4"
    >
      <div className="relative min-w-0 flex-1 basis-full sm:min-w-56 sm:basis-auto">
        <Search className="contact-filter-icon absolute left-3 top-2.5 h-5 w-5" />
        <input
          className="contact-filter-control w-full rounded-xl border p-2.5 pl-10"
          placeholder="Search name, email, phone..."
          aria-label="Search contacts"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <ContactFilterSelect
        aria-label="Filter by tag"
        className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        value={tag}
        onChange={onTagChange}
        options={[
          { value: "", label: "All Tags" },
          ...tags.map((option) => ({ value: option, label: option })),
        ]}
      />
      <input
        className="contact-filter-control min-w-0 flex-1 rounded-xl border px-3 py-2.5 sm:min-w-48"
        placeholder="Filter by company..."
        aria-label="Filter by company"
        value={company}
        onChange={(event) => onCompanyChange(event.target.value)}
      />
      <ContactFilterSelect
        aria-label="Sort contacts"
        className="min-w-0 flex-1 sm:w-48 sm:flex-none"
        value={`${sortBy}:${sortOrder}`}
        onChange={(value) => {
          const [nextSortBy, nextSortOrder] = value.split(":");
          if (
            (nextSortBy === "name" || nextSortBy === "createdDate") &&
            (nextSortOrder === "asc" || nextSortOrder === "desc")
          ) {
            onSortChange(nextSortBy, nextSortOrder);
          }
        }}
        options={[
          { value: "createdDate:desc", label: "Newest First" },
          { value: "createdDate:asc", label: "Oldest First" },
          { value: "name:asc", label: "Name A–Z" },
          { value: "name:desc", label: "Name Z–A" },
        ]}
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          aria-label="Clear filters and restore default sorting"
          className="contact-details-secondary-button flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
        >
          <RotateCcw size={16} />
          Clear filters
        </button>
      )}
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh contacts"
        aria-busy={loading}
        className="contact-workspace-icon-button rounded-xl border p-2.5"
      >
        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
      </button>
    </section>
  );
}
