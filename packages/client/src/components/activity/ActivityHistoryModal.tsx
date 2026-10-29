import { useEffect, useRef, useState } from "react";
import type { Activity, Contact } from "../../../../shared/src";
import { getApiErrorMessage } from "../../services/apiClient";
import { contactService } from "../../services/contactService";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";

interface ActivityHistoryModalProps {
  contact: Pick<Contact, "_id" | "firstName" | "lastName">;
  onClose: () => void;
}

export default function ActivityHistoryModal({
  contact,
  onClose,
}: ActivityHistoryModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);

  useDialogAccessibility(dialogRef, onClose);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    contactService
      .getActivities(contact._id, controller.signal)
      .then((result) => {
        if (active) setActivities(result);
      })
      .catch((requestError: unknown) => {
        if (active)
          setError(
            getApiErrorMessage(
              requestError,
              "Activity history could not be loaded",
            ),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [contact._id]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-history-title"
        tabIndex={-1}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
      >
        <header className="shrink-0 border-b border-gray-200 p-4">
          <h2 id="activity-history-title" className="mb-1 text-xl font-bold">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600">
            {contact.firstName} {contact.lastName}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <p role="status">Loading activity...</p>
          ) : error ? (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          ) : activities.length === 0 ? (
            <p className="text-gray-600">No recent activity.</p>
          ) : (
            <ol className="space-y-3">
              {activities.map((activity) => (
                <li key={activity._id} className="rounded border p-3">
                  <p className="font-semibold">
                    {activity.type.replaceAll("_", " ")}
                    {activity.details ? `: ${activity.details}` : ""}
                  </p>
                  <time
                    className="text-sm text-gray-600"
                    dateTime={activity.timestamp}
                  >
                    {new Date(activity.timestamp).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
        <footer className="flex shrink-0 justify-end border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 cursor-pointer hover:bg-gray-100"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
