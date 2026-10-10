import type { CaseLocation } from "../types";
import EmptyState from "../components/EmptyState";
import LocationCard from "./LocationCard";

interface LocationsListProps {
  locations: CaseLocation[];
}

export default function LocationsList({ locations }: LocationsListProps) {
  // Early return: no locations means we show a message, not a blank page.
  if (locations.length === 0) {
    return <EmptyState message="No locations found." />;
  }

  return (
    // "locations-grid" is the class from the old HTML, so styles.css still lays out the cards.
    <div className="locations-grid">
      {/* key = the location's stable id, so React can tell the cards apart */}
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}