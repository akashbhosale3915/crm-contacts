import { Moon, Plus, Sun, Users } from "lucide-react";

export type ThemePreference = "light" | "dark";

interface ContactsHeaderProps {
  theme: ThemePreference;
  onThemeToggle: () => void;
  onAddContact: () => void;
}

export default function ContactsHeader({
  theme,
  onThemeToggle,
  onAddContact,
}: ContactsHeaderProps) {
  return (
    <header className="crm-app-header mb-4 shrink-0 border-b py-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="shrink-0 rounded-lg bg-blue-600 p-2 text-white">
            <Users size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="crm-app-title truncate text-lg font-bold sm:text-2xl">
              CRM Contacts Workspace
            </h1>
            <p className="crm-app-subtitle hidden text-sm sm:block">
              Browse, filter, edit &amp; manage contact tags
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="contact-details-secondary-button flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            <span className="hidden sm:inline">
              {theme === "light" ? "Dark mode" : "Light mode"}
            </span>
          </button>
          <button
            type="button"
            onClick={onAddContact}
            aria-label="Add contact"
            className="contact-details-primary-button flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>
    </header>
  );
}
