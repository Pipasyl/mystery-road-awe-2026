import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import EmptyState from "../components/EmptyState";
import type { Evidence, Person } from "../types"; // CHANGED: types instead of state.ts
import PersonCard from "./PersonCard";
import { countEvidenceForPerson } from "./evidenceCount";

// FEATURE component: the content of the /team/people/:personId route.
export default function PersonDetail() {
  // For #/team/people/nova-byte it is { personId: "nova-byte" }.
  const { personId } = useParams<{ personId: string }>();

  // NEW: 2 boxes for the data, plus a flag that says "the answer has arrived".
  const [people, setPeople] = useState<Person[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loaded, setLoaded] = useState(false);

  // NEW: runs once after the first draw. It asks the backend for people and evidence.
  useEffect(() => {
    async function load() {
      const [p, e] = await Promise.all([
        fetch("/api/people").then((res) => res.json() as Promise<Person[]>),
        fetch("/api/evidence").then((res) => res.json() as Promise<Evidence[]>),
      ]);
      setPeople(p);
      setEvidence(e);
      setLoaded(true); // now we know the lists are real, not just empty
    }
    void load();
  }, []);

  // NEW: while the answer has not arrived, the lists are empty. Without this line the
  // page would flash "No person found" for a moment. Demo 6 does proper loading screens.
  if (!loaded) return <p>Loading…</p>;

  // .find returns the first person whose id matches, or undefined if none does.
  const person = people.find((p) => p.id === personId);

  // Unknown id (e.g. #/team/people/banana) shows a message instead of crashing.
  if (!person) {
    return (
      <>
        <EmptyState message={`No person with id "${personId}" exists.`} />
        <Link to="/team/people">Back to all people</Link>
      </>
    );
  }

  return (
    <>
      <Link to="/team/people">Back to all people</Link>
      <PersonCard person={person} evidenceCount={countEvidenceForPerson(person, evidence)} />
    </>
  );
}
