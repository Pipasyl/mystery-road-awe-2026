// ALL the filter state in ONE object: 7 values that belong together.
export type SortOrder = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export type FilterState = {
  search: string; // text in the search box
  type: string; // "" means "All types"
  person: string; // person id, "" means "All people"
  location: string; // location id, "" means "All locations"
  status: string; // "unreviewed" | "reviewed" | "flagged", "" means all
  relevance: string; // "unknown" | "relevant" | "irrelevant", "" means all
  sort: SortOrder;
};

// The 6 fields that SET_FILTER is allowed to change (everything except sort).
export type FilterField = "search" | "type" | "person" | "location" | "status" | "relevance";

// ACTIONS = the only ways this state can change. Each has a `type` name.
export type FilterAction =
  | { type: "SET_FILTER"; field: FilterField; value: string } // change ONE filter field
  | { type: "SET_SORT"; sort: SortOrder } // change the sort order
  | { type: "CLEAR_FILTERS" }; // reset everything at once

// The values the page starts with, and the values "Clear filters" goes back to.
export const initialFilterState: FilterState = {
  search: "",
  type: "",
  person: "",
  location: "",
  status: "",
  relevance: "",
  sort: "date-desc",
};

// The reducer: gets (old state, action) and returns the NEW state.
// It never changes the old state, it always returns a new object ({ ...state }).
export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_FILTER":
      // copy all old values, then overwrite only the one field that changed
      return { ...state, [action.field]: action.value };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "CLEAR_FILTERS":
      // ONE line resets all 7 values, because they all live in the same object
      return initialFilterState;
  }
}
