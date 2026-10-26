import type { Evidence } from "../types";
import { EvidenceCard } from "./EvidenceCard";

// The grid receives the list to show and the list of bookmarked ids.
// It owns no data itself: it only draws what it is given.
type EvidenceGridProps = {
  items: Evidence[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
};

export function EvidenceGrid({ items, bookmarkedIds, onToggleBookmark }: EvidenceGridProps) {
  // Same message as the old code when the list is empty
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard
          key={ev.id}
          ev={ev}
          isBookmarked={bookmarkedIds.includes(ev.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
