import type { Certainty } from "../types";
import { certaintyBadgeClass } from "../utils";

interface CertaintyBadgeProps {
  certainty: Certainty;
}

export default function CertaintyBadge({ certainty }: CertaintyBadgeProps) {
  return (
    <span className={"badge badge-" + certaintyBadgeClass(certainty)}>
      {certainty}
    </span>
  );
}