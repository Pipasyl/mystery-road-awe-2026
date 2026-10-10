import type { Person } from "../types";

// Typed props: the card MUST get a Person (8 fields) and a number.
interface PersonCardProps {
  person: Person;
  // Calculated by the parent, so this card never calls countEvidenceForPerson.
  evidenceCount: number;
}

// Presentational component: it only displays what it receives.
export default function PersonCard({ person, evidenceCount }: PersonCardProps) {
  return (
    // className (not class) because "class" is reserved in JavaScript.
    // Same class names as the old vanilla HTML, so styles.css still works.
    <div className="person-card">
      <div className="person-card-header">
        {/* Self-closing tag: JSX requires <img ... /> */}
        <img
          className="person-avatar"
          src={person.avatar}
          alt={"Portrait of " + person.name}
        />
        <div>
          <h3>{person.name}</h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>
      <ul>
        {/* .map replaces the old for loop: one <li> per responsibility.
            key helps React tell the items apart (explained in Demo 3). */}
        {person.responsibilities.map((responsibility) => (
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>
      {/* &ldquo; and &rdquo; are the curly quote characters */}
      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
      <p>
        {/* Ternary: adds "s" unless the count is exactly 1.
            {" "} forces a real space, because JSX removes spaces at line ends. */}
        {evidenceCount} related evidence item{evidenceCount === 1 ? "" : "s"}{" "}
        &mdash;{" "}
        {/* No onClick yet: click handling is out of scope for Exercise 4 */}
        <button type="button" className="evidence-count-link">
          view
        </button>
      </p>
    </div>
  );
}