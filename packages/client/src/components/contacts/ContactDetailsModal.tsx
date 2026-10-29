import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  Tag,
  X,
} from "lucide-react";
import type { Contact } from "../../../../shared/src";
import { getApiErrorMessage } from "../../services/apiClient";
import { contactService } from "../../services/contactService";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";

interface ContactDetailsModalProps {
  contactId: string;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
}

export default function ContactDetailsModal({
  contactId,
  onClose,
  onEdit,
}: ContactDetailsModalProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef<HTMLElement>(null);

  useDialogAccessibility(dialogRef, onClose);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    contactService
      .get(contactId, controller.signal)
      .then((result) => {
        if (active) setContact(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, "Contact could not be loaded"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [contactId]);

  const name = contact ? `${contact.firstName} ${contact.lastName}` : "";
  const initials = contact
    ? `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
    : "";

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-details-title"
        tabIndex={-1}
        className="contact-details-dialog flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        <header className="contact-details-header relative shrink-0 px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact details"
            className="contact-details-icon-button absolute right-4 top-4 rounded-lg p-2 sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>
          <p className="contact-details-eyebrow">CONTACT PROFILE</p>
          {loading ? (
            <div role="status" aria-label="Loading contact details" className="mt-4 flex items-center gap-4">
              <h2 id="contact-details-title" className="sr-only">
                Loading contact details
              </h2>
              <div aria-hidden="true" className="contact-details-skeleton h-14 w-14 rounded-2xl" />
              <div aria-hidden="true" className="min-w-0 flex-1 space-y-2">
                <div className="contact-details-skeleton h-5 w-2/3 rounded" />
                <div className="contact-details-skeleton h-4 w-1/3 rounded" />
              </div>
            </div>
          ) : contact ? (
            <div className="mt-4 flex min-w-0 items-center gap-4 pr-9">
              <div aria-hidden="true" className="contact-details-avatar">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 id="contact-details-title" className="contact-details-name truncate">
                  {name}
                </h2>
                <p className="contact-details-subtitle mt-1 flex items-center gap-1.5 truncate">
                  <Building2 size={14} aria-hidden="true" />
                  {contact.company || "No company"}
                </p>
              </div>
            </div>
          ) : (
            <h2 id="contact-details-title" className="contact-details-name mt-4">
              Contact details
            </h2>
          )}
        </header>

        <div className="contact-details-body min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? null : error ? (
            <div role="alert" className="contact-details-error">
              <p className="font-semibold">Unable to load contact</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : contact ? (
            <div className="space-y-5">
              <section aria-labelledby="contact-information-heading">
                <h3 id="contact-information-heading" className="contact-details-section-title">
                  Contact information
                </h3>
                <dl className="contact-details-grid mt-3">
                  <Detail icon={<Mail size={17} />} label="Email" value={contact.email} />
                  <Detail icon={<Phone size={17} />} label="Phone" value={contact.phone} />
                  <Detail icon={<Building2 size={17} />} label="Company" value={contact.company} />
                </dl>
              </section>

              <section aria-labelledby="contact-tags-heading">
                <h3 id="contact-tags-heading" className="contact-details-section-title">
                  <Tag size={15} aria-hidden="true" />
                  Tags
                </h3>
                <div className="contact-details-tag-panel mt-3">
                  {contact.tags.length > 0 ? (
                    <ul aria-label="Contact tags" className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <li key={tag} className="contact-details-tag">{tag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="contact-details-empty">No tags added</p>
                  )}
                </div>
              </section>

              <section aria-labelledby="contact-record-heading">
                <h3 id="contact-record-heading" className="contact-details-section-title">
                  Record
                </h3>
                <dl className="contact-details-record mt-3">
                  <Detail
                    icon={<CalendarDays size={17} />}
                    label="Created"
                    value={new Date(contact.createdDate).toLocaleString()}
                  />
                  <Detail
                    icon={<Clock3 size={17} />}
                    label="Last updated"
                    value={new Date(contact.updatedDate).toLocaleString()}
                  />
                </dl>
              </section>
            </div>
          ) : null}
        </div>

        <footer className="contact-details-footer flex shrink-0 justify-end gap-3 px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="contact-details-secondary-button rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Close
          </button>
          {contact && (
            <button
              type="button"
              onClick={() => onEdit(contact)}
              className="contact-details-primary-button rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            >
              Edit contact
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="contact-details-item min-w-0">
      <div aria-hidden="true" className="contact-details-item-icon">
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="contact-details-label">{label}</dt>
        <dd className="contact-details-value break-words">{value || "Not provided"}</dd>
      </div>
    </div>
  );
}
