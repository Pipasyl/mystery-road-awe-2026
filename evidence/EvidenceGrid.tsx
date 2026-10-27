import type { Evidence } from "../types";
import { EvidenceCard } from "./EvidenceCard";

// The grid receives the list to show and the note callback.
// CHANGED: no bookmark props any more, so the grid doesn't even know about bookmarks.
type EvidenceGridProps = {
  items: Evidence[];
  onAddNote: (evidenceId: string, text: string) => void;
};

export function EvidenceGrid({ items, onAddNote }: EvidenceGridProps) {
  // Same message as the old code when the list is empty
  if (items.length === 0) {
    return <p>No evidence matches the current filters.</p>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard key={ev.id} ev={ev} onAddNote={onAddNote} />
      ))}
    </div>
  );
}
