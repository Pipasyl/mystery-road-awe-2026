import type { CaseLocation, Person } from "../types";

interface TimelineFiltersProps {
  people: Person[];
  locations: CaseLocation[];
  // The distinct event types, already collected by the parent (e.g. ["meeting", "alert"]).
  eventTypes: string[];
  // The person id read from the URL, or "" when there is none.
  selectedPersonId: string;
}

// PRESENTATIONAL: visually complete filter bar, but NOT wired yet.
// There is no onChange and no state, so changing a dropdown filters nothing.
// That is intended for Exercise 4 (real filtering comes in Exercise 5).
// Class names (toolbar, toolbar-row, visually-hidden) are from the old index.html.
export default function TimelineFilters({
  people,
  locations,
  eventTypes,
  selectedPersonId,
}: TimelineFiltersProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="timelineOrder" className="visually-hidden">
          Order
        </label>
        <select id="timelineOrder" defaultValue="asc">
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>

        <label htmlFor="timelinePersonFilter" className="visually-hidden">
          Filter by person
        </label>
        {/* defaultValue = the option that is selected when the page first draws.
            "" is the value of "All people", so with no ?person= it shows that one. */}
        <select id="timelinePersonFilter" defaultValue={selectedPersonId}>
          <option value="">All people</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <label htmlFor="timelineLocationFilter" className="visually-hidden">
          Filter by location
        </label>
        <select id="timelineLocationFilter" defaultValue="">
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        <label htmlFor="timelineTypeFilter" className="visually-hidden">
          Filter by event type
        </label>
        <select id="timelineTypeFilter" defaultValue="">
          <option value="">All event types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
