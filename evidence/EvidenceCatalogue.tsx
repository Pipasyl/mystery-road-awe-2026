import { useState } from "react";
import ViewSection from "../components/ViewSection";
import { getAllEvidence, getAllLocations, getAllPeople } from "../state";
import { EvidenceGrid } from "./EvidenceGrid";
import { FilterToolbar, type SortOrder } from "./FilterToolbar";

// NEW: the bookmark list and the toggle function now come from App (lifted state).
interface EvidenceCatalogueProps {
  bookmarkedIds: string[];
  onToggleBookmark: (evidenceId: string) => void;
}

export function EvidenceCatalogue({ bookmarkedIds, onToggleBookmark }: EvidenceCatalogueProps) {
  // Read the data from the state.ts getters (same ones the old views used)
  const evidence = getAllEvidence();
  const people = getAllPeople();
  const locations = getAllLocations();

  // React state that only THIS page needs: the search text and the sort order.
  // They stay here because nobody else reads them.
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");

  // DERIVED VALUE (not useState): the visible list is recalculated from
  // evidence + searchTerm + sortOrder on every render, so it can never go out of sync.
  // Step 1: filter by the search text.
  // .filter() returns a NEW array, the full list in `evidence` is never touched.
  const term = searchTerm.trim().toLowerCase();
  const filtered = evidence.filter(
    (ev) =>
      term === "" ||
      ev.title.toLowerCase().includes(term) ||
      ev.summary.toLowerCase().includes(term) ||
      ev.tags.some((tag) => tag.toLowerCase().includes(term)),
  );

  // Step 2: sort. We sort `filtered` (a copy), never the master list.
  const visibleEvidence = filtered.sort((a, b) => {
    if (sortOrder === "title-asc") return a.title.localeCompare(b.title);
    if (sortOrder === "title-desc") return b.title.localeCompare(a.title);
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return sortOrder === "date-asc" ? diff : -diff;
  });

  // Unique list of evidence types for the "type" dropdown.
  const types = Array.from(new Set(evidence.map((ev) => ev.type)));

  return (
    <ViewSection title="Evidence Catalogue">
      <FilterToolbar
        types={types}
        people={people}
        locations={locations}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      <EvidenceGrid
        items={visibleEvidence}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={onToggleBookmark}
      />
    </ViewSection>
  );
}
