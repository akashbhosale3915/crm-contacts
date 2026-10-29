interface ContactListFeedbackProps {
  contactsExist: boolean;
  error: string;
  online: boolean;
  loading: boolean;
  onRetry: () => void;
}

export default function ContactListFeedback({
  contactsExist,
  error,
  online,
  loading,
  onRetry,
}: ContactListFeedbackProps) {
  return (
    <>
      {!online && (
        <p
          role="status"
          className="contact-list-offline m-3 rounded-xl border p-3 text-sm"
        >
          You are offline. Showing any previously loaded contacts.
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="contact-list-error m-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm"
        >
          <span>
            {contactsExist ? `Showing previously loaded results. ${error}` : error}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="contact-list-retry rounded-lg border px-3 py-1.5 font-semibold"
          >
            Retry
          </button>
        </div>
      )}
      {loading && (
        <p role="status" className="sr-only">
          Loading contacts
        </p>
      )}
    </>
  );
}
