import { useEffect, useRef, useState } from "react";
import { Activity as ActivityIcon, Clock3, History, X } from "lucide-react";
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-history-title"
        tabIndex={-1}
        className="contact-details-dialog flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        <header className="contact-details-header relative shrink-0 px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close activity history"
            className="contact-details-icon-button absolute right-4 top-4 rounded-lg p-2 sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>
          <p className="contact-details-eyebrow">CONTACT TIMELINE</p>
          <div className="mt-4 flex items-center gap-4 pr-9">
            <div aria-hidden="true" className="contact-details-avatar">
              <History size={23} />
            </div>
            <div className="min-w-0">
              <h2 id="activity-history-title" className="contact-details-name">
                Recent activity
              </h2>
              <p className="contact-details-subtitle mt-1 truncate">
                {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>
        </header>
        <div className="contact-details-body min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {loading ? (
            <div role="status" aria-label="Loading activity history" className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`activity-skeleton-${index}`} className="contact-details-item">
                  <div aria-hidden="true" className="contact-details-skeleton h-8 w-8 rounded-xl" />
                  <div aria-hidden="true" className="min-w-0 flex-1 space-y-2 py-1">
                    <div className="contact-details-skeleton h-4 w-2/3 rounded" />
                    <div className="contact-details-skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading activity history</span>
            </div>
          ) : error ? (
            <p role="alert" className="contact-details-error">
              {error}
            </p>
          ) : activities.length === 0 ? (
            <div className="contact-history-empty">
              <div aria-hidden="true" className="contact-details-item-icon mx-auto">
                <ActivityIcon size={20} />
              </div>
              <p className="mt-3 font-semibold">No activity yet</p>
              <p className="mt-1 text-sm">Changes to this contact will appear here.</p>
            </div>
          ) : (
            <ol aria-label="Recent contact activity" className="contact-history-list">
              {activities.map((activity) => (
                <li key={activity._id} className="contact-history-entry">
                  <div aria-hidden="true" className="contact-history-marker">
                    <ActivityIcon size={16} />
                  </div>
                  <article className="contact-history-card">
                    <p className="contact-history-title">
                      {activity.type.replaceAll("_", " ")}
                    </p>
                    {activity.details && (
                      <p className="contact-history-description">{activity.details}</p>
                    )}
                    <time
                      className="contact-history-time"
                      dateTime={activity.timestamp}
                    >
                      <Clock3 size={13} aria-hidden="true" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </time>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
        <footer className="contact-details-footer flex shrink-0 justify-end px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="contact-details-secondary-button rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
