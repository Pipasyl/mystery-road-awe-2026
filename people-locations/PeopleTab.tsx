import EmptyState from "../components/EmptyState";
import { useFetch } from "../components/useFetch"; // NEW: replaces useState + useEffect + Promise.all
import type { Evidence, Person } from "../types";
import PeopleList from "./PeopleList";

// FEATURE component: the content of the /team/people route.
export default function PeopleTab() {
  // NEW: the hook is called TWICE, once per address. Each call has its own data and status.
  const { data: people, status: peopleStatus } = useFetch<Person[]>("/api/people");
  const { data: evidence, status: evidenceStatus } = useFetch<Evidence[]>("/api/evidence");

  // Specific to THIS page: we need BOTH answers, so we combine the 2 statuses.
  // Any error = error. Otherwise, any still waiting = loading.
  if (peopleStatus === "error" || evidenceStatus === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load people. Please try again.
      </p>
    );
  if (peopleStatus === "loading" || evidenceStatus === "loading") return <p>⏳ Loading people…</p>;

  // Both succeeded. `!people` / `!evidence` only calm TypeScript (data starts as null).
  if (!people || !evidence || people.length === 0)
    return <EmptyState message="No people to show." />;

  return <PeopleList people={people} evidence={evidence} />;
}
