import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { Contact } from "../../../shared/src";
import ActivityHistoryModal from "../components/activity/ActivityHistoryModal";
import BulkTagActions from "../components/contacts/BulkTagActions";
import ContactFilters from "../components/contacts/ContactFilters";
import ContactDetailsModal from "../components/contacts/ContactDetailsModal";
import ContactModal from "../components/contacts/ContactModal";
import ContactList from "../components/contacts/ContactList";
import ContactsHeader from "../components/layout/ContactsHeader";
import { useContacts } from "../hooks/useContacts";
import { useContactListState } from "../hooks/useContactListState";
import { useContactListNavigation } from "../hooks/useContactListNavigation";
import { getApiErrorMessage } from "../services/apiClient";
import { contactService } from "../services/contactService";

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; contact: Contact }
  | { type: "details"; contactId: string }
  | { type: "history"; contact: Contact }
  | null;

export default function ContactsPage() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.localStorage.getItem("crm-theme") === "dark" ? "dark" : "light",
  );
  const [listState, dispatchListState] = useContactListState();
  const [tags, setTags] = useState<string[]>([]);
  const { search, tag, company, sortBy, sortOrder, page, selectedIds } =
    listState;
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const {
    contacts,
    totalContacts,
    totalPages,
    loading,
    error: contactsError,
    refresh: refreshContacts,
    beginLoading,
  } = useContacts({
    page,
    limit: 10,
    search,
    tag: tag || undefined,
    company: company.trim() || undefined,
    sortBy,
    sortOrder,
  });
  const { updateQuery, updatePage } = useContactListNavigation({
    state: listState,
    dispatch: dispatchListState,
    beginLoading,
  });

  useLayoutEffect(() => {
    window.localStorage.setItem("crm-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const fetchTags = useCallback(async () => {
    try {
      setTags(await contactService.listTags());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load available tags"));
    }
  }, []);

  const refreshWorkspace = useCallback(async () => {
    await Promise.all([refreshContacts(), fetchTags()]);
  }, [fetchTags, refreshContacts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTags();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTags]);

  useEffect(() => {
    if (contactsError) toast.error(contactsError);
  }, [contactsError]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      void refreshContacts();
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshContacts]);

  const handleBulkTag = async () => {
    const value = window.prompt(
      "Enter a tag to assign (e.g., VIP, Customer, Lead):",
    );
    const newTag = value?.trim();
    if (!newTag) return;
    if (newTag.length > 50) {
      toast.error("Tags must be 50 characters or fewer");
      return;
    }
    try {
      await contactService.assignTags({ contactIds: selectedIds, tag: newTag });
      toast.success("Tags applied");
      dispatchListState({ type: "selection-changed", selectedIds: [] });
      await refreshWorkspace();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to apply tags"));
    }
  };

  return (
    <div
      data-theme={theme}
      className="crm-workspace flex h-dvh flex-col overflow-hidden transition-colors"
    >
      <Toaster
        toastOptions={{
          style:
            theme === "dark"
              ? { background: "#1b1f27", color: "#e7eaf0" }
              : undefined,
        }}
      />
      <ContactsHeader
        theme={theme}
        onThemeToggle={() =>
          setTheme((current) => (current === "light" ? "dark" : "light"))
        }
        onAddContact={() => setActiveDialog({ type: "create" })}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-4 overflow-hidden px-4 pb-4 sm:px-8">
        <ContactFilters
          search={search}
          tag={tag}
          company={company}
          sortBy={sortBy}
          sortOrder={sortOrder}
          tags={tags}
          loading={loading}
          hasActiveFilters={
            Boolean(search.trim() || tag || company.trim()) ||
            sortBy !== "createdDate" ||
            sortOrder !== "desc"
          }
          onSearchChange={(value) =>
            updateQuery({ search: value }, "replace")
          }
          onTagChange={(value) =>
            updateQuery({ tag: value }, "push")
          }
          onCompanyChange={(value) =>
            updateQuery({ company: value }, "replace")
          }
          onSortChange={(nextSortBy, nextSortOrder) =>
            updateQuery(
              { sortBy: nextSortBy, sortOrder: nextSortOrder },
              "push",
            )
          }
          onClearFilters={() =>
            updateQuery(
              {
                search: "",
                tag: "",
                company: "",
                sortBy: "createdDate",
                sortOrder: "desc",
              },
              "push",
            )
          }
          onRefresh={() => void refreshContacts()}
        />

        <ContactList
          contacts={contacts}
          selectedIds={selectedIds}
          loading={loading}
          error={contactsError}
          online={online}
          page={page}
          totalPages={totalPages}
          totalContacts={totalContacts}
          onSelectionChange={(selectedIds) =>
            dispatchListState({
              type: "selection-changed",
              selectedIds,
            })
          }
          onOpenDetails={(contactId) =>
            setActiveDialog({ type: "details", contactId })
          }
          onEdit={(contact) => setActiveDialog({ type: "edit", contact })}
          onHistory={(contact) => setActiveDialog({ type: "history", contact })}
          onRetry={() => void refreshContacts()}
          onPageChange={updatePage}
        />
        <BulkTagActions
          selectedCount={selectedIds.length}
          onAssignTag={() => void handleBulkTag()}
        />
      </main>

      {activeDialog?.type === "create" && (
        <ContactModal onClose={() => setActiveDialog(null)} onRefresh={refreshWorkspace} />
      )}
      {activeDialog?.type === "edit" && (
        <ContactModal
          contact={activeDialog.contact}
          onClose={() => setActiveDialog(null)}
          onRefresh={refreshWorkspace}
        />
      )}
      {activeDialog?.type === "details" && (
        <ContactDetailsModal
          key={activeDialog.contactId}
          contactId={activeDialog.contactId}
          onClose={() => setActiveDialog(null)}
          onEdit={(contact) => setActiveDialog({ type: "edit", contact })}
        />
      )}
      {activeDialog?.type === "history" && (
        <ActivityHistoryModal
          key={activeDialog.contact._id}
          contact={activeDialog.contact}
          onClose={() => setActiveDialog(null)}
        />
      )}
    </div>
  );
}
