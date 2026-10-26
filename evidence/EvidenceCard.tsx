import type { Evidence } from "../types";
import { formatDate, getStatusBadgeClass, getRelevanceBadgeClass } from "../utils";

// Props = the inputs this component receives, like function arguments.
// This card needs 1 evidence item and 1 true/false saying if it's bookmarked.
type EvidenceCardProps = {
  ev: Evidence;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
};

export function EvidenceCard({ ev, isBookmarked, onToggleBookmark }: EvidenceCardProps) {
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
    </div>
  );
}
