import EmptyState from "../components/EmptyState";
import { useFetch } from "../components/useFetch"; // NEW: replaces useState + useEffect
import type { CaseLocation } from "../types";
import LocationsList from "./LocationsList";

// FEATURE component: the content of the /team/locations route.
export default function LocationsTab() {
  // NEW: ONE line instead of about 20. The hook does the fetching, the status and the cancel.
  const { data: locations, status } = useFetch<CaseLocation[]>("/api/locations");

  // These 3 stay HERE, because what to show is specific to this page.
  if (status === "loading") return <p>⏳ Loading locations…</p>;

  if (status === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load locations. Please try again.
      </p>
    );

  // success + empty list = "no data". `!locations` only calms TypeScript (data starts as null).
  if (!locations || locations.length === 0) return <EmptyState message="No locations to show." />;

  return <LocationsList locations={locations} />;
}
