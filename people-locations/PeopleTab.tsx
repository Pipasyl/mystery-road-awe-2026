import { getEvidence, getPeople } from "../backendApi"; // NEW: the API layer
import EmptyState from "../components/EmptyState";
import { useFetch } from "../components/useFetch";
import PeopleList from "./PeopleList";

// FEATURE component: the content of the /team/people route. UI only: no fetch, no URL.
export default function PeopleTab() {
  // CHANGED: two calls, each gets its own API function.
  const { data: people, status: peopleStatus } = useFetch(getPeople);
  const { data: evidence, status: evidenceStatus } = useFetch(getEvidence);

  // Specific to THIS page: we need BOTH answers, so we combine the 2 statuses.
  if (peopleStatus === "error" || evidenceStatus === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load people. Please try again.
      </p>
    );
  if (peopleStatus === "loading" || evidenceStatus === "loading") return <p>⏳ Loading people…</p>;

  if (!people || !evidence || people.length === 0)
    return <EmptyState message="No people to show." />;

  return <PeopleList people={people} evidence={evidence} />;
}
