import { useState } from "react"; // NEW: for the text typed in the note box
import type { Evidence } from "../types";
import { formatDate, getStatusBadgeClass, getRelevanceBadgeClass } from "../utils";

// Props = the inputs this component receives, like function arguments.
type EvidenceCardProps = {
  ev: Evidence;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onAddNote: (evidenceId: string, text: string) => void; // NEW: callback from App
};

export function EvidenceCard({ ev, isBookmarked, onToggleBookmark, onAddNote }: EvidenceCardProps) {
  // NEW: local state. The text being typed is only needed by THIS card, so it stays here.
  const [noteText, setNoteText] = useState("");

  // NEW: runs when the form is submitted (button click or Enter key).
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // stops the browser from reloading the page
    const text = noteText.trim();
    if (text === "") return; // ignore empty notes
    onAddNote(ev.id, text); // announce to App: "add this note to this evidence"
    setNoteText(""); // clear the box
  }

  return (
    <div className="evidence-card">
      <button
        type="button"
        onClick={() => onToggleBookmark(ev.id)}
        className={"bookmark-btn " + (isBookmarked ? "active" : "")}
        aria-label={"Toggle bookmark for " + ev.title}
      >
        <span className="bookmark-icon">{isBookmarked ? "★" : "☆"}</span>
      </button>
      <h3>{ev.title}</h3>
      <div className="evidence-meta">
        {ev.id} &middot; {ev.type} &middot; {formatDate(ev.timestamp)}
      </div>
      <div className="evidence-summary">{ev.summary}</div>
      {ev.tags.includes("critical") && <span className="badge badge-critical">Critical</span>}
      <span className={"badge " + getStatusBadgeClass(ev.status)}>{ev.status}</span>
      <span className={"badge " + getRelevanceBadgeClass(ev.relevance)}>{ev.relevance}</span>
      <div>
        {ev.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </div>
      {/* NEW: note form. The input is controlled: its value always comes from noteText. */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a private note..."
          aria-label={"Note for " + ev.title}
        />
        <button type="submit">Add note</button>
      </form>
    </div>
  );
}
