import type { Certainty } from "../types";
import { certaintyBadgeClass } from "../utils";
// Badge is the shared element from components/UI.tsx.
// The Dashboard uses it too, so there is only ONE place that defines
// what a badge looks like (the <span> and the "badge badge-..." classes).
import { Badge } from "../components/UI";

// Certainty is a union type: only "confirmed" | "contradictory" | "reported".
interface CertaintyBadgeProps {
  certainty: Certainty;
}

// Thin wrapper: it only translates a certainty word into a Badge variant.
// "confirmed" -> "reviewed", so the result is <span class="badge badge-reviewed">.
export default function CertaintyBadge({ certainty }: CertaintyBadgeProps) {
  return <Badge variant={certaintyBadgeClass(certainty)}>{certainty}</Badge>;
}
