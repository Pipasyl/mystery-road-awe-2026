import { NavLink } from "react-router";

// Presentational component: the two tabs of the People & Locations view.
// Each tab is a real link, so each one has its own address.
// "tab-bar" and "tab-btn" are the class names from the old index.html.
export default function PeopleLocationsTabs() {
  // NavLink calls this function with { isActive }.
  // isActive is true when the current address matches the link's "to".
  const getTabClass = ({ isActive }: { isActive: boolean }) =>
    "tab-btn" + (isActive ? " active" : "");

  return (
    <div className="tab-bar">
      <NavLink to="/team/people" className={getTabClass}>
        People
      </NavLink>
      <NavLink to="/team/locations" className={getTabClass}>
        Locations
      </NavLink>
    </div>
  );
}
