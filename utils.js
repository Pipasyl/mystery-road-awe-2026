// ---------------------------------------------------------------------
// utils.js — small, self-contained helpers
// ---------------------------------------------------------------------
// Everything here either (a) looks something up in the case data, or
// (b) formats/classifies a single value. Nothing here renders HTML and
// nothing here fetches anything — that's the line that decides whether
// a function belongs here, in views.js, or in api.js.

import { getAllEvidence, getAllPeople, getAllLocations } from "./state.js";

export function findEvidenceById(id) {
  var list = getAllEvidence();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findPersonById(id) {
  var list = getAllPeople();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findLocationById(id) {
  var list = getAllLocations();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function evidenceMentionsPerson(ev, person) {
  if (!ev.personIds) return false;
  return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
}

export function formatDate(ts) {
  if (!ts) return "Unknown date";
  var d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function getStatusBadgeClass(status) {
  var s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance) {
  var r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
}

export function certaintyBadgeClass(certainty) {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
}

export function getSelectedOptions(selectEl) {
  var result = [];
  for (var i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

// navigateTo lives here on purpose, not in main.js and not in views.js.
// It doesn't touch state and doesn't render anything — it just changes
// the URL hash. views.js needs to call it from inside cards it renders,
// and main.js needs to call it from the router. Putting it in either of
// those two would force main.js and views.js to import from each other
// in a circle. Putting it here, in a file neither of them needs to
// import for this reason, avoids that entirely.
export function navigateTo(viewName) {
  window.location.hash = viewName;
  // handleHashChange() in main.js picks this up via the hashchange listener
}