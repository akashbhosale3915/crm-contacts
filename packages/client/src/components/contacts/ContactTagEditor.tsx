import { useState } from "react";
import { X } from "lucide-react";

interface ContactTagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  onError: (message: string) => void;
  onClearError: () => void;
}

export default function ContactTagEditor({
  tags,
  onChange,
  onError,
  onClearError,
}: ContactTagEditorProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    if (tag.length > 50) {
      onError("Tags must be 50 characters or fewer.");
      return;
    }
    if (!tags.some((current) => current.toLowerCase() === tag.toLowerCase())) {
      onChange([...tags, tag]);
    }
    setNewTag("");
    onClearError();
  };

  return (
    <section aria-labelledby="contact-form-tags-heading">
      <h3 id="contact-form-tags-heading" className="contact-details-section-title">
        Tags
      </h3>
      <fieldset className="contact-form-tag-panel mt-3">
        <legend className="sr-only">Manage contact tags</legend>
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="contact-details-empty">No tags assigned</span>
          ) : (
            tags.map((tag) => (
              <span
                key={tag}
                className="contact-details-tag inline-flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag} tag`}
                  onClick={() =>
                    onChange(tags.filter((current) => current !== tag))
                  }
                  className="contact-form-remove-tag"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="contact-form-input min-w-0 flex-1"
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
            className="contact-details-secondary-button rounded-xl px-3 py-2 text-sm font-semibold"
          >
            Add tag
          </button>
        </div>
      </fieldset>
    </section>
  );
}
