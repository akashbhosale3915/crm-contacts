import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";

interface ContactFilterOption {
  value: string;
  label: string;
}

interface ContactFilterSelectProps {
  "aria-label": string;
  className: string;
  onChange: (value: string) => void;
  options: ContactFilterOption[];
  value: string;
}

export default function ContactFilterSelect({
  "aria-label": ariaLabel,
  className,
  onChange,
  options,
  value,
}: ContactFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab" && open) {
      setOpen(false);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
        setOpen(true);
      } else {
        setActiveIndex((current) =>
          (current + direction + options.length) % options.length,
        );
      }
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      setOpen(true);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      selectOption(activeIndex);
    }
  };

  const handleOptionMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <div
      ref={rootRef}
      className={`contact-filter-select-wrap${open ? " is-open" : ""} ${className}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        className="contact-filter-control contact-filter-select w-full rounded-xl border py-2.5 pl-3"
        onClick={() => {
          setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">{selectedOption?.label ?? ""}</span>
        <ChevronDown
          aria-hidden="true"
          className={`contact-filter-select-icon${open ? " is-open" : ""}`}
          size={16}
        />
      </button>
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className="contact-filter-select-menu"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              id={`${id}-option-${index}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`contact-filter-select-option${index === activeIndex ? " is-active" : ""}`}
              onMouseDown={handleOptionMouseDown}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(index)}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <Check aria-hidden="true" size={16} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
