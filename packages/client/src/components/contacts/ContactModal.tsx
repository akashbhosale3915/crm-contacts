import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { UserRound, X } from "lucide-react";
import type { Contact, ContactInput } from "../../../../shared/src";
import toast from "react-hot-toast";
import ContactTagEditor from "./ContactTagEditor";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import {
  getApiErrorMessage,
  isConflictError,
  isDuplicateEmailError,
} from "../../services/apiClient";
import { contactService } from "../../services/contactService";

interface ContactModalProps {
  contact?: Contact;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
}

const initialFormState = (contact?: Contact): ContactFormState => ({
  firstName: contact?.firstName ?? "",
  lastName: contact?.lastName ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
  company: contact?.company ?? "",
  tags: contact?.tags ?? [],
});

export default function ContactModal({
  contact,
  onClose,
  onRefresh,
}: ContactModalProps) {
  const [formData, setFormData] = useState(initialFormState(contact));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = contact !== undefined;
  const dialogRef = useRef<HTMLElement>(null);

  useDialogAccessibility(dialogRef, onClose);

  const updateField = <K extends keyof ContactFormState>(
    field: K,
    value: ContactFormState[K],
  ) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload: ContactInput = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      tags: formData.tags,
    };

    try {
      if (contact) {
        await contactService.update(contact._id, {
          ...payload,
          __v: contact.__v,
        });
      } else {
        await contactService.create(payload);
      }
      toast.success(isEditing ? "Contact updated" : "Contact created");
      await onRefresh();
      onClose();
    } catch (requestError) {
      let message: string;
      if (isDuplicateEmailError(requestError)) {
        message = "A contact with this email already exists. Use a different email address.";
      } else if (isConflictError(requestError)) {
        message = "This contact changed elsewhere. Refresh and retry your update.";
      } else {
        message = getApiErrorMessage(
          requestError,
          isEditing ? "Contact update failed" : "Contact creation failed",
        );
      }
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        tabIndex={-1}
        className="contact-details-dialog flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        <header className="contact-details-header relative shrink-0 px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact form"
            className="contact-details-icon-button absolute right-4 top-4 rounded-lg p-2 sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>
          <p className="contact-details-eyebrow">
            {isEditing ? "CONTACT PROFILE" : "NEW CONTACT"}
          </p>
          <div className="mt-4 flex items-center gap-4 pr-9">
            <div aria-hidden="true" className="contact-details-avatar">
              <UserRound size={24} />
            </div>
            <div>
              <h2 id="contact-form-title" className="contact-details-name">
                {isEditing ? "Edit contact" : "Add a contact"}
              </h2>
              <p className="contact-details-subtitle mt-1">
                {isEditing
                  ? "Update contact information and tags."
                  : "Add someone new to your contacts."}
              </p>
            </div>
          </div>
        </header>
        <form
          id="contact-form"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="contact-details-body min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="space-y-5">
              <section aria-labelledby="contact-form-info-heading">
                <h3 id="contact-form-info-heading" className="contact-details-section-title">
                  Contact information
                </h3>
                <div className="contact-form-grid mt-3">
                  <label className="contact-form-field">
                    First name
                    <input
                      className="contact-form-input"
                      value={formData.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      maxLength={100}
                      required
                    />
                  </label>
                  <label className="contact-form-field">
                    Last name
                    <input
                      className="contact-form-input"
                      value={formData.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      maxLength={100}
                      required
                    />
                  </label>
                  <label className="contact-form-field">
                    Email
                    <input
                      type="email"
                      className="contact-form-input"
                      value={formData.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      maxLength={254}
                    />
                  </label>
                  <label className="contact-form-field">
                    Phone
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      className="contact-form-input"
                      value={formData.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                        )
                      }
                      maxLength={10}
                      placeholder="10 digits"
                      title="Enter exactly 10 digits"
                      aria-describedby="contact-phone-hint"
                    />
                    <span id="contact-phone-hint" className="sr-only">
                      Enter exactly 10 digits. Only digits are accepted.
                    </span>
                  </label>
                  <label className="contact-form-field sm:col-span-2">
                    Company
                    <input
                      className="contact-form-input"
                      value={formData.company}
                      onChange={(event) => updateField("company", event.target.value)}
                      maxLength={100}
                    />
                  </label>
                </div>
              </section>

              <ContactTagEditor
                tags={formData.tags}
                onChange={(tags) => updateField("tags", tags)}
                onError={setError}
                onClearError={() => setError("")}
              />
              {error && (
                <p role="alert" className="contact-details-error">
                  {error}
                </p>
              )}
            </div>
          </div>
          <footer className="contact-details-footer flex shrink-0 justify-end gap-3 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="contact-details-secondary-button rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="contact-details-primary-button rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create contact"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
