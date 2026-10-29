import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Contact, ContactInput } from "../../../../shared/src";
import toast from "react-hot-toast";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import {
  getApiErrorMessage,
  isConflictError,
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
  const [newTag, setNewTag] = useState("");
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
      const message = isConflictError(requestError)
        ? "This contact changed elsewhere. Refresh and retry your update."
        : getApiErrorMessage(
            requestError,
            isEditing ? "Contact update failed" : "Contact creation failed",
          );
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    if (tag.length > 50) {
      setError("Tags must be 50 characters or fewer.");
      return;
    }
    if (!formData.tags.some((current) => current.toLowerCase() === tag.toLowerCase())) {
      updateField("tags", [...formData.tags, tag]);
    }
    setNewTag("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="contact-form-title" className="mb-5 text-xl font-bold">
          {isEditing ? "Edit Contact" : "Add Contact"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            First name
            <input
              className="mt-1 w-full rounded border p-2"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input
              className="mt-1 w-full rounded border p-2"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded border p-2"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              maxLength={254}
            />
          </label>
          <label className="text-sm font-medium">
            Phone
            <input
              className="mt-1 w-full rounded border p-2"
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              maxLength={100}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Company
            <input
              className="mt-1 w-full rounded border p-2"
              value={formData.company}
              onChange={(event) => updateField("company", event.target.value)}
              maxLength={100}
            />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium">Tags</legend>
            <div className="mb-3 flex flex-wrap gap-2">
              {formData.tags.length === 0 ? (
                <span className="text-sm text-gray-500">No tags assigned</span>
              ) : (
                formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag} tag`}
                      onClick={() =>
                        updateField(
                          "tags",
                          formData.tags.filter((current) => current !== tag),
                        )
                      }
                      className="font-bold hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded border p-2"
                aria-label="New tag"
                placeholder="Add a tag"
                value={newTag}
                maxLength={50}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded border px-3 py-2 hover:bg-gray-50"
              >
                Add tag
              </button>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-red-700 sm:col-span-2">
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Contact"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
