import type { TimelineEvent } from "../types";
import { findLocationById } from "../utils";
import EmptyState from "../components/EmptyState";
import TimelineEventCard from "./TimelineEventCard";

interface TimelineListProps {
  events: TimelineEvent[];
}

// Turns location ids (e.g. ["loc-a"]) into plain names (e.g. ["Lab A"]).
// If an id has no matching location, we show the raw id instead of crashing.
function getLocationNames(locationIds: string[]): string[] {
  return locationIds.map((id) => {
    const location = findLocationById(id);
    return location ? location.name : id;
  });
}

export default function TimelineList({ events }: TimelineListProps) {
  // Conditional technique: EARLY RETURN.
  // With no events we stop here and show a message instead of a blank page.
  if (events.length === 0) {
    return <EmptyState message="No timeline events match." />;
  }

  // Only reached when there is at least one event.
  // key = the event's stable id, so React can tell the cards apart.
  return (
    <div>
      {events.map((event) => (
        <TimelineEventCard
          key={event.id}
          event={event}
          locationNames={getLocationNames(event.locationIds)}
        />
      ))}
    </div>
  );
}