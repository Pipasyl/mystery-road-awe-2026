import { Link, useParams } from "react-router";
import { getAllPeople } from "../state";
import EmptyState from "../components/EmptyState";
import PersonCard from "./PersonCard";
import { countEvidenceForPerson } from "./evidenceCount";

// FEATURE component: the content of the /team/people/:personId route.
export default function PersonDetail() {
  // useParams() returns the variable parts of the address.
  // For #/team/people/nova-byte it is { personId: "nova-byte" }.
  // TypeScript types every value as string | undefined, because the
  // address can be anything the user types.
  const { personId } = useParams<{ personId: string }>();

  // .find returns the first person whose id matches, or undefined if none does.
  const person = getAllPeople().find((p) => p.id === personId);

  // Early return: unknown id (e.g. #/team/people/banana) shows a message,
  // so the page never tries to read fields of "undefined".
  if (!person) {
    return (
      <>
        <EmptyState message={`No person with id "${personId}" exists.`} />
        <Link to="/team/people">Back to all people</Link>
      </>
    );
  }

  // From here on, TypeScript knows that person is a real Person.
  return (
    <>
      <Link to="/team/people">Back to all people</Link>
      <PersonCard person={person} evidenceCount={countEvidenceForPerson(person)} />
    </>
  );
}
