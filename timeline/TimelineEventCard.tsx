import type { TimelineEvent } from "../types";
import { formatDate } from "../utils";
import CertaintyBadge from "./CertaintyBadge";

interface TimelineEventCardProps {
  event: TimelineEvent;
  // Plain names prepared by the parent (e.g. ["Lab A"]).
  // Receiving text instead of location objects avoids the old
  // "[object Object]" bug from the vanilla version.
  locationNames: string[];
}

export default function TimelineEventCard({
  event,
  locationNames,
}: TimelineEventCardProps) {
  return (
    // Conditional style (lookup): the class changes with the certainty word,
    // e.g. "timeline-event certainty-confirmed".
    <div className={"timeline-event certainty-" + event.certainty}>
      <div className="timeline-time">
        {/* &nbsp; = non-breaking space, &middot; = the centered dot */}
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <CertaintyBadge certainty={event.certainty} />
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {/* Conditional with &&: the <p> only appears if there is at least one name.
          Safe because "length > 0" is always true or false, never a bare number. */}
      {locationNames.length > 0 && (
        <p className="evidence-meta">Location: {locationNames.join(", ")}</p>
      )}
    </div>
  );
}