import { useEffect, useRef, useState } from "react";
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

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-details-title"
        tabIndex={-1}
        className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="contact-details-title" className="mb-5 text-xl font-bold">
          Contact Details
        </h2>
        {loading ? (
          <p role="status">Loading contact...</p>
        ) : error ? (
          <p role="alert" className="text-red-700">{error}</p>
        ) : contact ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="First name" value={contact.firstName} />
            <Detail label="Last name" value={contact.lastName} />
            <Detail label="Email" value={contact.email || "—"} />
            <Detail label="Phone" value={contact.phone || "—"} />
            <Detail label="Company" value={contact.company || "—"} />
            <Detail label="Tags" value={contact.tags.join(", ") || "—"} />
            <Detail
              label="Created"
              value={new Date(contact.createdDate).toLocaleString()}
            />
            <Detail
              label="Updated"
              value={new Date(contact.updatedDate).toLocaleString()}
            />
          </dl>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border px-4 py-2">
            Close
          </button>
          {contact && (
            <button
              onClick={() => onEdit(contact)}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Edit Contact
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="wrap-break-word text-slate-900">{value}</dd>
    </div>
  );
}
