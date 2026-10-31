import { Link, useParams } from "react-router";
import { getEvidence, getPeople } from "../backendApi"; // NEW: the API layer
import EmptyState from "../components/EmptyState";
import { useFetch } from "../components/useFetch"; // NEW: replaces useState + useEffect
import PersonCard from "./PersonCard";
import { countEvidenceForPerson } from "./evidenceCount";

// FEATURE component: the content of the /team/people/:personId route. UI only.
export default function PersonDetail() {
  const { personId } = useParams<{ personId: string }>();

  // CHANGED: 2 hook calls replace the 2 state boxes, the `loaded` flag and the effect.
  const { data: people, status: peopleStatus } = useFetch(getPeople);
  const { data: evidence, status: evidenceStatus } = useFetch(getEvidence);

  // NEW: the hook gives us an error status for free, so this page can show it.
  if (peopleStatus === "error" || evidenceStatus === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load this person. Please try again.
      </p>
    );

  // While the data is null, the answer has not arrived. This replaces the old `loaded` flag,
  // and also stops a wrong "No person found" from flashing.
  if (!people || !evidence) return <p>Loading…</p>;

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
