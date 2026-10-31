import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import type { CaseLocation } from "../types";
import LocationsList from "./LocationsList";

// THEORY: while we wait for the backend, the page can be in 3 situations:
//   "loading" = the request is on its way
//   "error"   = the request failed
//   "success" = the answer arrived (it may still be an empty list)
// ONE variable (status) says which one it is, so they can never mix up.
type Status = "loading" | "error" | "success";

// FEATURE component: the content of the /team/locations route.
export default function LocationsTab() {
  const [locations, setLocations] = useState<CaseLocation[]>([]);
  const [status, setStatus] = useState<Status>("loading"); // NEW: starts as "loading"

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/locations");
        // NEW: fetch does NOT throw for a 500 answer, it only throws if the network fails.
        // So we check res.ok ourselves and throw on purpose.
        if (!res.ok) throw new Error(`Server answered ${res.status}`);
        setLocations((await res.json()) as CaseLocation[]);
        setStatus("success");
      } catch (err) {
        console.error("Could not load locations", err);
        setStatus("error"); // the error path ALSO sets the status, nothing is left hanging
      }
    }
    void load();
  }, []);

  // One early return per situation. Each looks different on the page.
  if (status === "loading") return <p>⏳ Loading locations…</p>;

  if (status === "error")
    return (
      <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
        ❌ Could not load locations. Please try again.
      </p>
    );

  // success + empty list = "no data" (NOT an error, NOT loading)
  if (locations.length === 0) return <EmptyState message="No locations to show." />;

  return <LocationsList locations={locations} />;
}
