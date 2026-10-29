interface ContactTagsProps {
  tags: string[];
  compact?: boolean;
}

const getTagStyles = (tag: string): string => {
  const normalizedTag = tag.toLowerCase();
  if (normalizedTag === "lead") return "bg-cyan-100 text-cyan-800";
  if (normalizedTag === "vip" || normalizedTag === "customer") {
    return "bg-orange-100 text-orange-800";
  }
  if (normalizedTag === "enterprise") return "bg-pink-100 text-pink-800";
  if (normalizedTag === "prospect") return "bg-emerald-100 text-emerald-800";
  return "bg-gray-100 text-gray-800";
};

export default function ContactTags({
  tags,
  compact = false,
}: ContactTagsProps) {
  const visibleTags = compact ? tags.slice(0, 2) : tags;

  return (
    <div
      className="contact-tags-tooltip flex min-w-0 flex-wrap gap-1"
      data-tooltip={tags.length > 0 ? tags.join(", ") : undefined}
    >
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={`block max-w-full truncate rounded-full px-2 py-1 text-xs font-medium ${getTagStyles(tag)}`}
        >
          {tag}
        </span>
      ))}
      {compact && tags.length > visibleTags.length && (
        <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          +{tags.length - visibleTags.length}
        </span>
      )}
      {!compact && tags.length === 0 && "—"}
    </div>
  );
}
