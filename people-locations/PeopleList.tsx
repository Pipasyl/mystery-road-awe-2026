import type { Person } from "../types";
import { countEvidenceForPerson } from "./evidenceCount";
import PeopleGrid from "./PeopleGrid";
import type { PersonWithCount } from "./PeopleGrid";

interface PeopleListProps {
  people: Person[];
}

// FEATURE component: its only job is the DATA (counting).
// It does not draw anything itself, PeopleGrid does that.
export default function PeopleList({ people }: PeopleListProps) {
  // Build one { person, evidenceCount } row per person, then hand them down.
  const items: PersonWithCount[] = people.map((person) => ({
    person,
    evidenceCount: countEvidenceForPerson(person),
  }));

  return <PeopleGrid items={items} />;
}
