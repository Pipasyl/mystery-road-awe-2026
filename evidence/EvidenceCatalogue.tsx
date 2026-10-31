import { useEffect, useReducer, useState } from "react"; // CHANGED: + useEffect, useState
import ViewSection from "../components/ViewSection";
import type { CaseLocation, Evidence, Person } from "../types"; // CHANGED: types instead of state.ts
import { evidenceMentionsPerson } from "../utils";
import { EvidenceGrid } from "./EvidenceGrid";
import { FilterToolbar } from "./FilterToolbar";
import { filterReducer, initialFilterState } from "./filterReducer";
// CHANGED: the import from "../state" is gone.

// CHANGED: only the note callback is left. The bookmarks now come through Context.
interface EvidenceCatalogueProps {
  onAddNote: (evidenceId: string, text: string) => void;
}

export function EvidenceCatalogue({ onAddNote }: EvidenceCatalogueProps) {
  // NEW: 3 boxes for the data. They start empty because the backend has not answered yet.
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locations, setLocations] = useState<CaseLocation[]>([]);

  // NEW: runs once after the first draw ([]). Promise.all sends the 3 requests at the
  // same time and waits until all 3 have answered.
  useEffect(() => {
    async function load() {
      const [e, p, l] = await Promise.all([
        fetch("/api/evidence").then((res) => res.json() as Promise<Evidence[]>),
        fetch("/api/people").then((res) => res.json() as Promise<Person[]>),
        fetch("/api/locations").then((res) => res.json() as Promise<CaseLocation[]>),
      ]);
      // Saving into state makes React draw the page again, now with data.
      setEvidence(e);
      setPeople(p);
      setLocations(l);
    }
    void load();
  }, []);

  // ONE useReducer for all 7 filter/sort values.
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

  // The person dropdown stores an id, so we look up the person object once.
  const selectedPerson = people.find((p) => p.id === filters.person);

  // DERIVED VALUE (not state): recalculated from evidence + filters on every render.
  // Step 1: keep only the items that match ALL active filters ("" = filter is off).
  const term = filters.search.trim().toLowerCase();
  const filtered = evidence.filter(
    (ev) =>
      (term === "" ||
        ev.title.toLowerCase().includes(term) ||
        ev.summary.toLowerCase().includes(term) ||
        ev.tags.some((tag) => tag.toLowerCase().includes(term))) &&
      (filters.type === "" || ev.type === filters.type) &&
      (filters.person === "" ||
        (selectedPerson !== undefined && evidenceMentionsPerson(ev, selectedPerson))) &&
      (filters.location === "" || ev.locationIds.includes(filters.location)) &&
      (filters.status === "" || ev.status === filters.status) &&
      (filters.relevance === "" || ev.relevance === filters.relevance),
  );

  // Step 2: sort. We sort `filtered` (a copy), never the list in state.
  const visibleEvidence = filtered.sort((a, b) => {
    if (filters.sort === "title-asc") return a.title.localeCompare(b.title);
    if (filters.sort === "title-desc") return b.title.localeCompare(a.title);
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return filters.sort === "date-asc" ? diff : -diff;
  });

  // Unique list of evidence types for the "type" dropdown.
  const types = Array.from(new Set(evidence.map((ev) => ev.type)));

  return (
    <ViewSection title="Evidence Catalogue">
      <FilterToolbar
        types={types}
        people={people}
        locations={locations}
        filters={filters}
        dispatch={dispatch}
      />
      <EvidenceGrid items={visibleEvidence} onAddNote={onAddNote} />
    </ViewSection>
  );
}
