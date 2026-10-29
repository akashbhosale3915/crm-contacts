import type { Contact } from "../../../../../shared/src";
import ContactActions from "./ContactActions";
import ContactTags from "./ContactTags";

interface ContactTableProps {
  contacts: Contact[];
  selectedIds: string[];
  loading: boolean;
  error: string;
  onSelectionChange: (ids: string[]) => void;
  onToggleSelection: (contactId: string, selected: boolean) => void;
  onOpenDetails: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
  onHistory: (contact: Contact) => void;
}

export default function ContactTable({
  contacts,
  selectedIds,
  loading,
  error,
  onSelectionChange,
  onToggleSelection,
  onOpenDetails,
  onEdit,
  onHistory,
}: ContactTableProps) {
  const allSelected =
    contacts.length > 0 &&
    contacts.every(({ _id }) => selectedIds.includes(_id));

  return (
    <div className="hidden h-full md:block">
      <table className="w-full min-w-267 table-fixed border-collapse text-left">
        <caption className="sr-only">Contacts and available actions</caption>
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
            <LoadingRows />
          ) : contacts.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">
                {error ? "Contacts could not be displayed." : "No contacts found."}
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
                        onToggleSelection(contact._id, event.target.checked)
                      }
                    />
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    <button
                      type="button"
                      onClick={() => onOpenDetails(contact._id)}
                      data-tooltip={name}
                      className="contact-name-link block w-full truncate text-left hover:text-blue-700 hover:underline"
                    >
                      {name}
                    </button>
                  </td>
                  <Cell value={contact.email} />
                  <Cell value={contact.phone} />
                  <Cell value={contact.company} />
                  <td className="p-4">
                    <ContactTags tags={contact.tags} compact />
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
  );
}

function Cell({ value }: { value?: string }) {
  return (
    <td className="p-4 text-slate-600">
      <span
        className="contact-cell-tooltip block truncate"
        data-tooltip={value || undefined}
      >
        {value || "—"}
      </span>
    </td>
  );
}

function LoadingRows() {
  return Array.from({ length: 10 }, (_, row) => (
    <tr key={`skeleton-${row}`} aria-hidden="true">
      <td className="bg-white p-4">
        <div className="skeleton-shimmer h-4 w-4 rounded" />
      </td>
      <td className="p-4"><div className="skeleton-shimmer h-4 w-32 rounded" /></td>
      <td className="p-4"><div className="skeleton-shimmer h-4 w-40 rounded" /></td>
      <td className="p-4"><div className="skeleton-shimmer h-4 w-24 rounded" /></td>
      <td className="p-4"><div className="skeleton-shimmer h-4 w-32 rounded" /></td>
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
}
