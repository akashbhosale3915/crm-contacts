import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Moon, Plus, Sun, Tag, Users } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import type { Contact } from "../../../shared/src";
import ActivityHistoryModal from "../components/activity/ActivityHistoryModal";
import ContactFilters from "../components/contacts/ContactFilters";
import ContactDetailsModal from "../components/contacts/ContactDetailsModal";
import ContactModal from "../components/contacts/ContactModal";
import ContactList from "../components/contacts/ContactList";
import { useContacts } from "../hooks/useContacts";
import {
  useContactListState,
  type ContactListQueryUpdate,
} from "../hooks/useContactListState";
import { getApiErrorMessage } from "../services/apiClient";
import { contactService } from "../services/contactService";
import {
  readContactListUrl,
  writeContactListUrl,
} from "../utils/contactListUrl";

type ActiveDialog =
  | { type: "create" }
  | { type: "edit"; contact: Contact }
  | { type: "details"; contactId: string }
  | { type: "history"; contact: Contact }
  | null;

type Theme = "light" | "dark";

export default function ContactsPage() {
  const [theme, setTheme] = useState<Theme>(() =>
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

  useLayoutEffect(() => {
    window.localStorage.setItem("crm-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    writeContactListUrl(
      { search, tag, company: company.trim(), sortBy, sortOrder, page },
      "replace",
    );
  }, [company, page, search, sortBy, sortOrder, tag]);

  useEffect(() => {
    const restoreListState = () => {
      const state = readContactListUrl();
      beginLoading();
      dispatchListState({ type: "url-restored", state });
    };

    window.addEventListener("popstate", restoreListState);
    return () => window.removeEventListener("popstate", restoreListState);
  }, [beginLoading, dispatchListState]);

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

  const updateQuery = (
    values: ContactListQueryUpdate,
    historyMode: "push" | "replace",
  ) => {
    beginLoading();
    writeContactListUrl(
      {
        search,
        tag,
        company: company.trim(),
        sortBy,
        sortOrder,
        page: 1,
        ...values,
      },
      historyMode,
    );
    dispatchListState({ type: "query-changed", query: values });
  };

  const updatePage = (nextPage: number) => {
    beginLoading();
    writeContactListUrl(
      { search, tag, company: company.trim(), sortBy, sortOrder, page: nextPage },
      "push",
    );
    dispatchListState({ type: "page-changed", page: nextPage });
  };

  return (
    <div
      data-theme={theme}
      className="flex h-dvh flex-col overflow-hidden bg-slate-50 text-slate-900 transition-colors"
    >
      <Toaster
        toastOptions={{
          style:
            theme === "dark"
              ? { background: "#1b1f27", color: "#e7eaf0" }
              : undefined,
        }}
      />
      <header className="mb-4 shrink-0 border-b border-gray-200 bg-white py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="shrink-0 rounded-lg bg-blue-600 p-2 text-white">
              <Users size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                CRM Contacts Workspace
              </h1>
              <p className="hidden text-sm text-slate-500 sm:block">
                Browse, filter, edit &amp; manage contact tags
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              <span className="hidden sm:inline">
                {theme === "light" ? "Dark mode" : "Light mode"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDialog({ type: "create" })}
              aria-label="Add contact"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Contact</span>
            </button>
          </div>
        </div>
      </header>

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

        <div className="h-17 shrink-0">
          {selectedIds.length > 0 && (
            <section className="flex h-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900 shadow-sm">
              <span className="ml-2 font-semibold">
                {selectedIds.length} contacts selected
              </span>
              <button
                type="button"
                onClick={() => void handleBulkTag()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Tag size={16} />
                Assign Bulk Tag
              </button>
            </section>
          )}
        </div>

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
