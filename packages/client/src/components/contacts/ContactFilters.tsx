import { RefreshCw, RotateCcw, Search } from "lucide-react";
import type { ContactListQuery } from "../../../../shared/src";

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
      <select
        aria-label="Filter by tag"
        className="contact-filter-control min-w-0 flex-1 rounded-xl border px-3 py-2.5 sm:w-40 sm:flex-none"
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
      >
        <option value="">All Tags</option>
        {tags.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        className="contact-filter-control min-w-0 flex-1 rounded-xl border px-3 py-2.5 sm:min-w-48"
        placeholder="Filter by company..."
        aria-label="Filter by company"
        value={company}
        onChange={(event) => onCompanyChange(event.target.value)}
      />
      <select
        aria-label="Sort contacts"
        className="contact-filter-control min-w-0 flex-1 rounded-xl border px-3 py-2.5 sm:w-48 sm:flex-none"
        value={`${sortBy}:${sortOrder}`}
        onChange={(event) => {
          const [nextSortBy, nextSortOrder] = event.target.value.split(":");
          if (
            (nextSortBy === "name" || nextSortBy === "createdDate") &&
            (nextSortOrder === "asc" || nextSortOrder === "desc")
          ) {
            onSortChange(nextSortBy, nextSortOrder);
          }
        }}
      >
        <option value="createdDate:desc">Newest First</option>
        <option value="createdDate:asc">Oldest First</option>
        <option value="name:asc">Name A–Z</option>
        <option value="name:desc">Name Z–A</option>
      </select>
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
