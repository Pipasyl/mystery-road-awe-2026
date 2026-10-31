import { useEffect, useState } from "react";
import type { CaseLocation } from "../types";
import LocationsList from "./LocationsList";
// CHANGED: the import from "../state" is gone.

// FEATURE component: the content of the /team/locations route.
export default function LocationsTab() {
  // NEW: a box for the locations, empty until the backend answers.
  const [locations, setLocations] = useState<CaseLocation[]>([]);

  // NEW: runs once after the first draw. It asks the backend for the locations.
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/locations");
      setLocations((await res.json()) as CaseLocation[]);
    }
    void load();
  }, []);

  return <LocationsList locations={locations} />;
}
