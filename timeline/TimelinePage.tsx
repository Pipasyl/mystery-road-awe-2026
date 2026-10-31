import { useSearchParams } from "react-router";
import { getLocations, getPeople, getTimeline } from "../backendApi"; // NEW: the API layer
import { useFetch } from "../components/useFetch"; // NEW: replaces useState + useEffect
import ViewSection from "../components/ViewSection";
import TimelineFilters from "./TimelineFilters";
import TimelineList from "./TimelineList";

// FEATURE component: the whole Timeline page. UI only: no fetch, no URL.
export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const personId = searchParams.get("person") ?? "";

  // CHANGED: 3 hook calls instead of 3 state boxes + an effect with Promise.all.
  // `data` is null until the answer arrives, so `?? []` keeps the old behaviour:
  // an empty list at first, the real list after.
  const { data: timelineData } = useFetch(getTimeline);
  const { data: peopleData } = useFetch(getPeople);
  const { data: locationsData } = useFetch(getLocations);
  const timeline = timelineData ?? [];
  const people = peopleData ?? [];
  const locations = locationsData ?? [];

  // Oldest first. .slice() makes a COPY, so the list from the hook is never reordered.
  const allEvents = timeline
    .slice()
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const events = personId
    ? allEvents.filter((event) => event.personIds.includes(personId))
    : allEvents;

  const eventTypes = Array.from(new Set(allEvents.map((event) => event.type)));

  return (
    <ViewSection title="Investigation Timeline">
      {/* Dropdowns are visually complete but NOT wired (no onChange): Exercise 5. */}
      <TimelineFilters
        people={people}
        locations={locations}
        eventTypes={eventTypes}
        selectedPersonId={personId}
      />
      <TimelineList events={events} />
    </ViewSection>
  );
}
