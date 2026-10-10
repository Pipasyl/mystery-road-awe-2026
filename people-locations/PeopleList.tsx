import type { Person } from "../types";
import { evidenceMentionsPerson } from "../utils";
import { getAllEvidence } from "../state";
import EmptyState from "../components/EmptyState";
import PersonCard from "./PersonCard";

interface PeopleListProps {
  people: Person[];
}

// Counts how many evidence items mention this person.
// .filter keeps only the items where the check returns true,
// .length is how many are left. Same result as the old for loop in views.ts.
function countEvidenceForPerson(person: Person): number {
  return getAllEvidence().filter((ev) => evidenceMentionsPerson(ev, person)).length;
}

export default function PeopleList({ people }: PeopleListProps) {
  // Early return: no people means we show a message, not a blank page.
  if (people.length === 0) {
    return <EmptyState message="No people found." />;
  }

  return (
    // "people-grid" is the class from the old HTML, so styles.css still lays out the cards.
    <div className="people-grid">
      {/* key = the person's stable id, so React can tell the cards apart */}
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          evidenceCount={countEvidenceForPerson(person)}
        />
      ))}
    </div>
  );
}
