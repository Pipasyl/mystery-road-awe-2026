import { useEffect, useState } from "react";
import type { Evidence, Person } from "../types"; // CHANGED: + Evidence
import PeopleList from "./PeopleList";

// FEATURE component: the content of the /team/people route.
// It asks the backend for people AND evidence and hands both to the list.
export default function PeopleTab() {
  const [people, setPeople] = useState<Person[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]); // NEW: box for the evidence

  // Runs once after the first draw. Promise.all sends both requests at the same
  // time and waits until both have answered.
  useEffect(() => {
    async function load() {
      const [p, e] = await Promise.all([
        fetch("/api/people").then((res) => res.json() as Promise<Person[]>),
        fetch("/api/evidence").then((res) => res.json() as Promise<Evidence[]>),
      ]);
      setPeople(p);
      setEvidence(e);
    }
    void load();
  }, []);

  return <PeopleList people={people} evidence={evidence} />;
}
