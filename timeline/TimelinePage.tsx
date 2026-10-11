import { useSearchParams } from "react-router";
import ViewSection from "../components/ViewSection";
import { getAllLocations, getAllPeople, getAllTimeline } from "../state";
import TimelineFilters from "./TimelineFilters";
import TimelineList from "./TimelineList";

// FEATURE component: the whole Timeline page.
export default function TimelinePage() {
  // useSearchParams() reads the part after "?" in the address.
  // We only use the first value (the reader), never the setter, so there is
  // no state here: the address is simply an input for the first draw.
  const [searchParams] = useSearchParams();

  // #/timeline                   -> get("person") is null -> we use ""
  // #/timeline?person=nova-byte  -> get("person") is "nova-byte"
  const personId = searchParams.get("person") ?? "";

  // Oldest first, like the default of the order dropdown.
  // .slice() makes a COPY, so the list in state.ts is never reordered.
  const allEvents = getAllTimeline()
    .slice()
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Initial list: with a person in the address keep only their events,
  // otherwise keep all of them.
  const events = personId
    ? allEvents.filter((event) => event.personIds.includes(personId))
    : allEvents;

  // Distinct event types for the dropdown. A Set removes duplicates.
  const eventTypes = Array.from(new Set(allEvents.map((event) => event.type)));

  return (
    <ViewSection title="Investigation Timeline">
      {/* Dropdowns are visually complete but NOT wired (no onChange): Exercise 5. */}
      <TimelineFilters
        people={getAllPeople()}
        locations={getAllLocations()}
        eventTypes={eventTypes}
        selectedPersonId={personId}
      />
      <TimelineList events={events} />
    </ViewSection>
  );
}
