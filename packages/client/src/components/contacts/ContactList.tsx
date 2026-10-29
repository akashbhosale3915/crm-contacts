import type { Contact } from "../../../../shared/src";
import ContactCards from "./list/ContactCards";
import ContactListFeedback from "./list/ContactListFeedback";
import ContactPagination from "./list/ContactPagination";
import ContactTable from "./list/ContactTable";

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

  return (
    <section className="contact-workspace-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div
        className="table-scroll-area min-h-0 flex-1 overflow-auto"
        aria-busy={loading}
      >
        <ContactListFeedback
          contactsExist={contacts.length > 0}
          error={error}
          online={online}
          loading={loading}
          onRetry={onRetry}
        />
        <ContactTable
          contacts={contacts}
          selectedIds={selectedIds}
          loading={loading}
          error={error}
          onSelectionChange={onSelectionChange}
          onToggleSelection={toggleSelection}
          onOpenDetails={onOpenDetails}
          onEdit={onEdit}
          onHistory={onHistory}
        />
        <ContactCards
          contacts={contacts}
          selectedIds={selectedIds}
          loading={loading}
          error={error}
          onToggleSelection={toggleSelection}
          onOpenDetails={onOpenDetails}
          onEdit={onEdit}
          onHistory={onHistory}
        />
      </div>
      <ContactPagination
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalContacts={totalContacts}
        onPageChange={onPageChange}
      />
    </section>
  );
}
