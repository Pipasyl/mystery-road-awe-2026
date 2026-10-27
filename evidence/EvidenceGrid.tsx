import type { Evidence } from "../types";
import { EvidenceCard } from "./EvidenceCard";

// The grid receives the list to show, the bookmarked ids and the callbacks.
// It owns no data itself: it only draws what it is given and passes callbacks on.
type EvidenceGridProps = {
  items: Evidence[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onAddNote: (evidenceId: string, text: string) => void; // NEW: just passed on to each card
};

export function EvidenceGrid({
  items,
  bookmarkedIds,
  onToggleBookmark,
  onAddNote,
}: EvidenceGridProps) {
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
          onAddNote={onAddNote}
        />
      ))}
    </div>
  );
}
