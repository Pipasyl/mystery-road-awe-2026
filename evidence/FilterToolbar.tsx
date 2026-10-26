import type { CaseLocation, Person } from "../types";

// The toolbar needs the option lists for the three dropdowns that
// are filled from data (types, people, locations).
// The status/relevance/sort options are fixed, so they are written inline.
// searchTerm + onSearchChange: the text currently in the search box,
// and the function to call when the user types.
export type SortOrder = "date-desc" | "date-asc" | "title-asc" | "title-desc";

type FilterToolbarProps = {
  types: string[];
  people: Person[];
  locations: CaseLocation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
};

export function FilterToolbar({
  types,
  people,
  locations,
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
}: FilterToolbarProps) {
  return (
    <div className="toolbar" id="evidenceToolbar">
      <div className="toolbar-row">
        <label htmlFor="evidenceSearch" className="visually-hidden">
          Search evidence
        </label>
        {/* value = what the box shows (comes from React state).
            onChange = runs on every keystroke, e.target.value is the full text in the box. */}
        <input
          type="text"
          id="evidenceSearch"
          placeholder="Search evidence by title, summary, or tag…"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <label htmlFor="filterType" className="visually-hidden">
          Filter by type
        </label>
        <select id="filterType">
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label htmlFor="filterPerson" className="visually-hidden">
          Filter by person
        </label>
        <select id="filterPerson">
          <option value="">All people</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label htmlFor="filterLocation" className="visually-hidden">
          Filter by location
        </label>
        <select id="filterLocation">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-row">
        <label htmlFor="filterStatus" className="visually-hidden">
          Filter by status
        </label>
        <select id="filterStatus">
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="filterRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select id="filterRelevance">
          <option value="">All relevance</option>
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>

        <label htmlFor="sortEvidence" className="visually-hidden">
          Sort evidence
        </label>
        <select
          id="sortEvidence"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
        </select>

        <button type="button" id="clearFiltersBtn" className="btn btn-secondary">
          Clear filters
        </button>
      </div>
    </div>
  );
}
