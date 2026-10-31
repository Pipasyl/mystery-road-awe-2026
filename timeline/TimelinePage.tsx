import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import ViewSection from "../components/ViewSection";
import type { CaseLocation, Person, TimelineEvent } from "../types"; // CHANGED: more types
import TimelineFilters from "./TimelineFilters";
import TimelineList from "./TimelineList";
// CHANGED: the import from "../state" is gone, this page reads only from the backend now.

// FEATURE component: the whole Timeline page.
export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const personId = searchParams.get("person") ?? "";

  // 3 state boxes, all empty at first because the backend has not answered yet.
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [people, setPeople] = useState<Person[]>([]); // NEW
  const [locations, setLocations] = useState<CaseLocation[]>([]); // NEW

  // Runs once after the first draw. Promise.all sends the 3 requests at the same
  // time and waits until all 3 have answered.
  useEffect(() => {
    async function load() {
      const [t, p, l] = await Promise.all([
        fetch("/api/timeline").then((res) => res.json() as Promise<TimelineEvent[]>),
        fetch("/api/people").then((res) => res.json() as Promise<Person[]>),
        fetch("/api/locations").then((res) => res.json() as Promise<CaseLocation[]>),
      ]);
      // Saving into state makes React draw the page again, now with data.
      setTimeline(t);
      setPeople(p);
      setLocations(l);
    }
    void load();
  }, []);

  // Oldest first. .slice() makes a COPY, so the state list is never reordered.
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
