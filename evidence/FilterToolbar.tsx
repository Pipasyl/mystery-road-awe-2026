import type { Dispatch } from "react";
import type { CaseLocation, Person } from "../types";
import type { FilterAction, FilterState, SortOrder } from "./filterReducer";

// SortOrder now lives in filterReducer.ts; re-exported here so old imports keep working.
export type { SortOrder };

// The toolbar needs the option lists for the three dropdowns that are filled from data.
// filters = the current values to show in the boxes.
// dispatch = the function to send an action to the reducer in EvidenceCatalogue.
type FilterToolbarProps = {
  types: string[];
  people: Person[];
  locations: CaseLocation[];
  filters: FilterState;
  dispatch: Dispatch<FilterAction>;
};

export function FilterToolbar({ types, people, locations, filters, dispatch }: FilterToolbarProps) {
  return (
    <div className="toolbar" id="evidenceToolbar">
      <div className="toolbar-row">
        <label htmlFor="evidenceSearch" className="visually-hidden">
          Search evidence
        </label>
        {/* value = what the box shows (from the reducer state).
            onChange = sends a SET_FILTER action on every keystroke. */}
        <input
          type="text"
          id="evidenceSearch"
          placeholder="Search evidence by title, summary, or tag…"
          autoComplete="off"
          value={filters.search}
          onChange={(e) => dispatch({ type: "SET_FILTER", field: "search", value: e.target.value })}
        />

        <label htmlFor="filterType" className="visually-hidden">
          Filter by type
        </label>
        <select
          id="filterType"
          value={filters.type}
          onChange={(e) => dispatch({ type: "SET_FILTER", field: "type", value: e.target.value })}
        >
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
        <select
          id="filterPerson"
          value={filters.person}
          onChange={(e) => dispatch({ type: "SET_FILTER", field: "person", value: e.target.value })}
        >
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
        <select
          id="filterLocation"
          value={filters.location}
          onChange={(e) =>
            dispatch({ type: "SET_FILTER", field: "location", value: e.target.value })
          }
        >
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
        <select
          id="filterStatus"
          value={filters.status}
          onChange={(e) => dispatch({ type: "SET_FILTER", field: "status", value: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="filterRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select
          id="filterRelevance"
          value={filters.relevance}
          onChange={(e) =>
            dispatch({ type: "SET_FILTER", field: "relevance", value: e.target.value })
          }
        >
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
          value={filters.sort}
          onChange={(e) => dispatch({ type: "SET_SORT", sort: e.target.value as SortOrder })}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
        </select>

        {/* One click = one action = all 7 values reset */}
        <button
          type="button"
          id="clearFiltersBtn"
          className="btn btn-secondary"
          onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
