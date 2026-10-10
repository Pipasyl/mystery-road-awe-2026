import type { Certainty } from "../types";
import { certaintyBadgeClass } from "../utils";

// Certainty is a union type: only "confirmed" | "contradictory" | "reported".
// Any other word is a TypeScript error.
interface CertaintyBadgeProps {
  certainty: Certainty;
}

export default function CertaintyBadge({ certainty }: CertaintyBadgeProps) {
  return (
    // Lookup technique: certaintyBadgeClass turns the word into a CSS class,
    // e.g. "confirmed" -> "reviewed", so the badge gets "badge badge-reviewed".
    // We import the existing function instead of copying it (one single version).
    <span className={"badge badge-" + certaintyBadgeClass(certainty)}>{certainty}</span>
  );
}
