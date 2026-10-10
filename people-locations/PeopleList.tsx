import type { Person } from "../types";
import { evidenceMentionsPerson } from "../utils";
import { getAllEvidence } from "../state";
import PeopleGrid from "./PeopleGrid";
import type { PersonWithCount } from "./PeopleGrid";

interface PeopleListProps {
  people: Person[];
}

// Counts how many evidence items mention this person.
// .filter keeps only the items where the check returns true,
// .length is how many are left.
function countEvidenceForPerson(person: Person): number {
  return getAllEvidence().filter((ev) => evidenceMentionsPerson(ev, person)).length;
}

// FEATURE component: its only job is the DATA (reading state, counting).
// It does not draw anything itself, PeopleGrid does that.
export default function PeopleList({ people }: PeopleListProps) {
  // Build one { person, evidenceCount } row per person, then hand them down.
  const items: PersonWithCount[] = people.map((person) => ({
    person,
    evidenceCount: countEvidenceForPerson(person),
  }));

  return <PeopleGrid items={items} />;
}
