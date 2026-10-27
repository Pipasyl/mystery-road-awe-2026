import { useReducer } from "react"; // CHANGED: useReducer instead of useState
import ViewSection from "../components/ViewSection";
import { getAllEvidence, getAllLocations, getAllPeople } from "../state";
import { evidenceMentionsPerson } from "../utils";
import { EvidenceGrid } from "./EvidenceGrid";
import { FilterToolbar } from "./FilterToolbar";
import { filterReducer, initialFilterState } from "./filterReducer"; // NEW

// The bookmark list and the two callbacks come from App (lifted state).
interface EvidenceCatalogueProps {
  bookmarkedIds: string[];
  onToggleBookmark: (evidenceId: string) => void;
  onAddNote: (evidenceId: string, text: string) => void;
}

export function EvidenceCatalogue({
  bookmarkedIds,
  onToggleBookmark,
  onAddNote,
}: EvidenceCatalogueProps) {
  // Read the data from the state.ts getters (same ones the old views used)
  const evidence = getAllEvidence();
  const people = getAllPeople();
  const locations = getAllLocations();

  // CHANGED: ONE useReducer for all 7 filter/sort values.
  // filters = the current state object, dispatch = sends an action to filterReducer.
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

  // The person dropdown stores an id, so we look up the person object once.
  const selectedPerson = people.find((p) => p.id === filters.person);

  // DERIVED VALUE (not state): recalculated from evidence + filters on every render.
  // Step 1: keep only the items that match ALL active filters ("" = filter is off).
  // .filter() returns a NEW array, the full list in `evidence` is never touched.
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

  // Step 2: sort. We sort `filtered` (a copy), never the master list.
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
      <EvidenceGrid
        items={visibleEvidence}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={onToggleBookmark}
        onAddNote={onAddNote}
      />
    </ViewSection>
  );
}
