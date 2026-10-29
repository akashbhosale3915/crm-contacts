import { ChevronLeft, ChevronRight, Edit2, History } from "lucide-react";
import type { Contact } from "../../../../shared/src";

interface ContactListProps {
  contacts: Contact[];
  selectedIds: string[];
  loading: boolean;
  error: string;
  online: boolean;
  page: number;
  totalPages: number;
  totalContacts: number;
  onSelectionChange: (ids: string[]) => void;
  onOpenDetails: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
  onHistory: (contact: Contact) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

const getTagStyles = (tag: string): string => {
  const normalizedTag = tag.toLowerCase();
  if (normalizedTag === "lead") return "bg-cyan-100 text-cyan-800";
  if (normalizedTag === "vip" || normalizedTag === "customer") {
    return "bg-orange-100 text-orange-800";
  }
  if (normalizedTag === "enterprise") return "bg-pink-100 text-pink-800";
  if (normalizedTag === "prospect") return "bg-emerald-100 text-emerald-800";
  return "bg-gray-100 text-gray-800";
};

function ContactActions({
  contact,
  onEdit,
  onHistory,
}: {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onHistory: (contact: Contact) => void;
}) {
  const name = `${contact.firstName} ${contact.lastName}`;
  return (
    <div className="flex justify-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(contact)}
        aria-label={`Edit ${name}`}
        className="contact-list-icon-button rounded-lg border p-2"
      >
        <Edit2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => onHistory(contact)}
        aria-label={`View history for ${name}`}
        className="contact-list-icon-button rounded-lg border p-2"
      >
        <History size={16} />
      </button>
    </div>
  );
}

export default function ContactList({
  contacts,
  selectedIds,
  loading,
  error,
  online,
  page,
  totalPages,
  totalContacts,
  onSelectionChange,
  onOpenDetails,
  onEdit,
  onHistory,
  onRetry,
  onPageChange,
}: ContactListProps) {
  const toggleSelection = (contactId: string, selected: boolean) => {
    onSelectionChange(
      selected
        ? [...selectedIds, contactId]
        : selectedIds.filter((id) => id !== contactId),
    );
  };
  const allSelected =
    contacts.length > 0 &&
    contacts.every(({ _id }) => selectedIds.includes(_id));

  const renderLoadingRows = () =>
    Array.from({ length: 10 }, (_, row) => (
      <tr key={`skeleton-${row}`} aria-hidden="true">
        <td className="bg-white p-4">
          <div className="skeleton-shimmer h-4 w-4 rounded" />
        </td>
        <td className="p-4">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
        </td>
        <td className="p-4">
          <div className="skeleton-shimmer h-4 w-40 rounded" />
        </td>
        <td className="p-4">
          <div className="skeleton-shimmer h-4 w-24 rounded" />
        </td>
        <td className="p-4">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-6 w-14 rounded-full" />
            <div className="skeleton-shimmer h-6 w-16 rounded-full" />
          </div>
        </td>
        <td className="p-4">
          <div className="flex justify-center gap-2">
            <div className="skeleton-shimmer h-8 w-8 rounded" />
            <div className="skeleton-shimmer h-8 w-8 rounded" />
          </div>
        </td>
      </tr>
    ));

  return (
    <section className="contact-workspace-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div
        className="table-scroll-area min-h-0 flex-1 overflow-auto"
        aria-busy={loading}
      >
        {!online && (
          <p
            role="status"
            className="contact-list-offline m-3 rounded-xl border p-3 text-sm"
          >
            You are offline. Showing any previously loaded contacts.
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="contact-list-error m-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm"
          >
            <span>
              {contacts.length > 0
                ? `Showing previously loaded results. ${error}`
                : error}
            </span>
            <button
              type="button"
              onClick={onRetry}
              className="contact-list-retry rounded-lg border px-3 py-1.5 font-semibold"
            >
              Retry
            </button>
          </div>
        )}
        {loading && (
          <p role="status" className="sr-only">
            Loading contacts
          </p>
        )}
        <div className="hidden h-full md:block">
          <table className="w-full min-w-267 table-fixed border-collapse text-left">
            <caption className="sr-only">
              Contacts and available actions
            </caption>
            <colgroup>
              <col className="w-12" />
              <col className="w-47.5" />
              <col className="w-55" />
              <col className="w-37.5" />
              <col className="w-45" />
              <col className="w-40" />
              <col className="w-30" />
            </colgroup>
            <thead className="sticky top-0 z-30">
              <tr className="contact-table-heading border-b text-sm font-semibold">
                <th className="contact-table-heading whitespace-nowrap p-4">
                  <input
                    type="checkbox"
                    aria-label="Select all contacts on this page"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={allSelected}
                    onChange={(event) =>
                      onSelectionChange(
                        event.target.checked
                          ? contacts.map(({ _id }) => _id)
                          : [],
                      )
                    }
                  />
                </th>
                <th className="whitespace-nowrap p-4">Contact Name</th>
                <th className="whitespace-nowrap p-4">Email</th>
                <th className="whitespace-nowrap p-4">Phone</th>
                <th className="whitespace-nowrap p-4">Company</th>
                <th className="whitespace-nowrap p-4">Tags</th>
                <th className="whitespace-nowrap p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                renderLoadingRows()
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {error
                      ? "Contacts could not be displayed."
                      : "No contacts found."}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const selected = selectedIds.includes(contact._id);
                  const name = `${contact.firstName} ${contact.lastName}`;
                  return (
                    <tr
                      key={contact._id}
                      className={`transition-colors hover:bg-slate-50 ${selected ? "bg-blue-50/50" : "bg-white"}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${name}`}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selected}
                          onChange={(event) =>
                            toggleSelection(contact._id, event.target.checked)
                          }
                        />
                      </td>
                      <td className="overflow-hidden p-4 font-medium text-slate-900">
                        <button
                          type="button"
                          onClick={() => onOpenDetails(contact._id)}
                          title={name}
                          className="contact-name-link block w-full truncate text-left hover:text-blue-700 hover:underline"
                        >
                          {name}
                        </button>
                      </td>
                      <td className="overflow-hidden p-4 text-slate-600">
                        <span
                          className="block truncate"
                          title={contact.email || ""}
                        >
                          {contact.email || "—"}
                        </span>
                      </td>
                      <td className="overflow-hidden p-4 text-slate-600">
                        <span
                          className="block truncate"
                          title={contact.phone || ""}
                        >
                          {contact.phone || "—"}
                        </span>
                      </td>
                      <td className="overflow-hidden p-4 text-slate-600">
                        <span
                          className="block truncate"
                          title={contact.company || ""}
                        >
                          {contact.company || "—"}
                        </span>
                      </td>
                      <td className="overflow-hidden p-4">
                        <div
                          className="flex min-w-0 flex-wrap gap-1"
                          title={contact.tags.join(", ")}
                        >
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className={`block max-w-full truncate rounded-full px-2 py-1 text-xs font-medium ${getTagStyles(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="overflow-hidden p-4">
                        <ContactActions
                          contact={contact}
                          onEdit={onEdit}
                          onHistory={onHistory}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 md:hidden">
          {loading ? (
            <div
              role="status"
              aria-label="Loading contacts"
              className="space-y-3"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  aria-hidden="true"
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="skeleton-shimmer mb-3 h-5 w-2/3 rounded" />
                  <div className="skeleton-shimmer mb-2 h-4 w-full rounded" />
                  <div className="skeleton-shimmer h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              {error
                ? "Contacts could not be displayed."
                : "No contacts found."}
            </p>
          ) : (
            <ul aria-label="Contacts" className="space-y-3">
              {contacts.map((contact) => {
                const selected = selectedIds.includes(contact._id);
                const name = `${contact.firstName} ${contact.lastName}`;
                return (
                  <li key={contact._id}>
                    <article
                      className={`contact-mobile-card rounded-2xl border p-4 ${selected ? "is-selected" : ""}`}
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${name}`}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selected}
                          onChange={(event) =>
                            toggleSelection(contact._id, event.target.checked)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => onOpenDetails(contact._id)}
                          className="contact-name-link min-w-0 flex-1 truncate text-left font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                        >
                          {name}
                        </button>
                        <ContactActions
                          contact={contact}
                          onEdit={onEdit}
                          onHistory={onHistory}
                        />
                      </div>
                      <dl className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <dt className="font-medium text-slate-500">Email</dt>
                          <dd className="break-all text-slate-900">
                            {contact.email || "—"}
                          </dd>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <dt className="font-medium text-slate-500">
                              Phone
                            </dt>
                            <dd className="wrap-break-word text-slate-900">
                              {contact.phone || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-500">
                              Company
                            </dt>
                            <dd className="wrap-break-word text-slate-900">
                              {contact.company || "—"}
                            </dd>
                          </div>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-500">Tags</dt>
                          <dd className="mt-1 flex flex-wrap gap-1">
                            {contact.tags.length > 0
                              ? contact.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getTagStyles(tag)}`}
                                  >
                                    {tag}
                                  </span>
                                ))
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
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
    </section>
  );
}
