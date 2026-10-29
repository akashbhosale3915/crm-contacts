import type { Contact } from "../../../../../shared/src";
import ContactActions from "./ContactActions";
import ContactTags from "./ContactTags";

interface ContactCardsProps {
  contacts: Contact[];
  selectedIds: string[];
  loading: boolean;
  error: string;
  onToggleSelection: (contactId: string, selected: boolean) => void;
  onOpenDetails: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
  onHistory: (contact: Contact) => void;
}

export default function ContactCards({
  contacts,
  selectedIds,
  loading,
  error,
  onToggleSelection,
  onOpenDetails,
  onEdit,
  onHistory,
}: ContactCardsProps) {
  return (
    <div className="p-3 md:hidden">
      {loading ? (
        <LoadingCards />
      ) : contacts.length === 0 ? (
        <p className="p-8 text-center text-gray-500">
          {error ? "Contacts could not be displayed." : "No contacts found."}
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
                        onToggleSelection(contact._id, event.target.checked)
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
                        <dt className="font-medium text-slate-500">Phone</dt>
                        <dd className="wrap-break-word text-slate-900">
                          {contact.phone || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">Company</dt>
                        <dd className="wrap-break-word text-slate-900">
                          {contact.company || "—"}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Tags</dt>
                      <dd className="mt-1">
                        <ContactTags tags={contact.tags} />
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
  );
}

function LoadingCards() {
  return (
    <div role="status" aria-label="Loading contacts" className="space-y-3">
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
  );
}
