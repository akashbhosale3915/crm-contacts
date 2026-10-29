import { Tag } from "lucide-react";

interface BulkTagActionsProps {
  selectedCount: number;
  onAssignTag: () => void;
}

export default function BulkTagActions({
  selectedCount,
  onAssignTag,
}: BulkTagActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <section
      aria-label="Bulk contact actions"
      className="contact-selection-bar flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 shadow-sm sm:px-5"
    >
      <span className="font-semibold">
        {selectedCount} {selectedCount === 1 ? "contact" : "contacts"} selected
      </span>
      <button
        type="button"
        onClick={onAssignTag}
        className="contact-details-primary-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white sm:w-auto"
      >
        <Tag size={16} />
        Assign bulk tag
      </button>
    </section>
  );
}
