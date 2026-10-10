import type { Person } from "../types";
import EmptyState from "../components/EmptyState";
import PersonCard from "./PersonCard";

// One row of finished data: a person plus the number already calculated for them.
export interface PersonWithCount {
  person: Person;
  evidenceCount: number;
}

interface PeopleGridProps {
  items: PersonWithCount[];
}

// PRESENTATIONAL: it does not read state.ts and does not count anything.
// It only draws what it receives, so a change in how counting works
// (e.g. a different evidence source) can never break this file.
export default function PeopleGrid({ items }: PeopleGridProps) {
  // Early return: nothing to draw, show a message.
  if (items.length === 0) {
    return <EmptyState message="No people found." />;
  }

  return (
    <div className="people-grid">
      {/* key = the person's stable id */}
      {items.map(({ person, evidenceCount }) => (
        <PersonCard key={person.id} person={person} evidenceCount={evidenceCount} />
      ))}
    </div>
  );
}
