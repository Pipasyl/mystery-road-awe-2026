import type { Evidence, Person } from "../types"; // CHANGED: + Evidence
import { countEvidenceForPerson } from "./evidenceCount";
import PeopleGrid from "./PeopleGrid";
import type { PersonWithCount } from "./PeopleGrid";

interface PeopleListProps {
  people: Person[];
  evidence: Evidence[]; // NEW: needed for counting, handed in by PeopleTab
}

// FEATURE component: its only job is the DATA (counting).
// It does not draw anything itself, PeopleGrid does that.
export default function PeopleList({ people, evidence }: PeopleListProps) {
  // Build one { person, evidenceCount } row per person, then hand them down.
  const items: PersonWithCount[] = people.map((person) => ({
    person,
    evidenceCount: countEvidenceForPerson(person, evidence), // CHANGED: passes the evidence on
  }));

  return <PeopleGrid items={items} />;
}
