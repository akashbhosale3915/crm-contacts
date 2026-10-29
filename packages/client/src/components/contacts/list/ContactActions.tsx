import { Edit2, History } from "lucide-react";
import type { Contact } from "../../../../../shared/src";

interface ContactActionsProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onHistory: (contact: Contact) => void;
}

export default function ContactActions({
  contact,
  onEdit,
  onHistory,
}: ContactActionsProps) {
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
