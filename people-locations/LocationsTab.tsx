import { getLocations } from "../backendApi"; // NEW: the API layer
import EmptyState from "../components/EmptyState";
import { useFetch } from "../components/useFetch";
import LocationsList from "./LocationsList";

// FEATURE component: the content of the /team/locations route. UI only: no fetch, no URL.
export default function LocationsTab() {
  // CHANGED: we pass the API function. No address and no type written here any more.
  const { data: locations, status } = useFetch(getLocations);

  if (status === "loading") return <p>⏳ Loading locations…</p>;

  if (status === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load locations. Please try again.
      </p>
    );

  if (!locations || locations.length === 0) return <EmptyState message="No locations to show." />;

  return <LocationsList locations={locations} />;
}
