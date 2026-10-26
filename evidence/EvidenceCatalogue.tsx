import { useState } from "react";
import { saveBookmarksToStorage } from "../api";
import ViewSection from "../components/ViewSection";
import {
  getAllEvidence,
  getAllLocations,
  getAllPeople,
  getBookmarks,
  setBookmarks,
} from "../state";
import { EvidenceGrid } from "./EvidenceGrid";
import { FilterToolbar, type SortOrder } from "./FilterToolbar";
import { toggleId } from "./toggleId";

export function EvidenceCatalogue() {
  // Read the data from the state.ts getters (same ones the old views used)
  const evidence = getAllEvidence();
  const people = getAllPeople();
  const locations = getAllLocations();

  // React state: the list of bookmarked ids. It starts from the stored list.
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  // React state: the text typed in the search box, and the chosen sort order.
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");

  function handleToggleBookmark(evidenceId: string) {
    const next = toggleId(bookmarkedIds, evidenceId);

    // Immutability check (development only): the result must be a different array
    // than the old one. If it is the same reference, React would not redraw.
    if (import.meta.env.DEV && next === bookmarkedIds) {
      console.error("toggleId returned the same array: bookmarks were mutated!");
    }

    setBookmarkedIds(next); // tells React: draw again with this list
    setBookmarks(next); // keeps state.ts in sync, so the Dashboard sees it too
    saveBookmarksToStorage(); // same save as the old code (localStorage)
  }

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
        onToggleBookmark={handleToggleBookmark}
      />
    </ViewSection>
  );
}
