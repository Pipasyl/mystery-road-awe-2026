// ---------------------------------------------------------------------
// views.ts — every function that builds HTML and puts it on the page,
// plus the click/change handlers tied directly to that HTML.
// ---------------------------------------------------------------------
// Rule used throughout this file: a function gets `export` only if a
// DIFFERENT file genuinely calls it. Rule used for var/let/const: `let`
// if a variable is reassigned later, `const` if it's set once and never
// reassigned (loop counters are always `let`).

import {
  getAllEvidence,
  getFilteredEvidenceList,
  setFilteredEvidenceList,
  setSelectedEvidence,
  getBookmarks,
  setBookmarks,
  getCurrentPage,
  getAllPeople,
  getAllLocations,
  getAllTimeline,
  getCaseData,
  setCurrentPeopleTab,
  getEvidenceViewLoading,
  getViewRendered,
  getNotesStore,
  getModalCloseListenerCount,
  incrementModalCloseListenerCount,
  STORAGE_KEY_HYPOTHESIS,
} from "./state";

import {
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
  certaintyBadgeClass,
  getSelectedOptions,
  navigateTo,
} from "./utils";

import { saveBookmarksToStorage, loadNoteForEvidence, saveNoteForEvidence } from "./api";
import type {
  CaseLocation,
  Evidence,
  EvidenceRelevance,
  EvidenceStatus,
  Person,
  TimelineEvent,
} from "./types";

// ---------------------------------------------------------------------
// HELPERS (new in the TypeScript migration)
// ---------------------------------------------------------------------

// For elements the code assumes are on the page: returns the element,
// or throws a clear error if it is missing.
function getEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found in the page`);
  return el as T;
}

// For elements that may legitimately be missing: returns the element
// with the right type, or null (the caller checks for null).
function findEl<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// Shape of the hypothesis draft that is saved in localStorage.
interface HypothesisDraft {
  suspectId?: string;
  nature?: string;
  evidenceIds?: string[];
  confidence?: string;
  explanation?: string;
  alternative?: string;
  savedAt?: string;
}

// ---------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------

export function renderDashboard() {
  const container = document.getElementById("dashboardContent");
  if (!container) return;

  const allEvidence = getAllEvidence();
  const caseData = getCaseData();

  let reviewedCount = 0;
  for (let i = 0; i < allEvidence.length; i++) {
    if ((allEvidence[i].status || "").toLowerCase() === "reviewed") reviewedCount++;
  }

  const progressPct =
    allEvidence.length === 0 ? 0 : Math.round((reviewedCount / allEvidence.length) * 100);

  let html = "";
  html += '<div class="case-summary-card">';
  html += "<h3>" + (caseData.title || "Case") + "</h3>";
  html +=
    '<p><span class="badge badge-flagged">' +
    (caseData.status || "unknown").toUpperCase() +
    "</span></p>";
  html += "<p>" + (caseData.summary || "") + "</p>";
  html += "</div>";

  html += '<div class="stat-grid">';
  html += statCardHTML(allEvidence.length, "Evidence items");
  html += statCardHTML(getAllPeople().length, "People");
  html += statCardHTML(getAllLocations().length, "Locations");
  html += statCardHTML(getBookmarks().length, "Bookmarked");
  html += statCardHTML(reviewedCount, "Reviewed");
  html += "</div>";

  html += '<div class="dashboard-panel">';
  html += "<h3>Review progress</h3>";
  html +=
    '<div class="progress-bar-outer"><div class="progress-bar-inner" style="width:' +
    progressPct +
    '%;"></div></div>';
  html += "<p>" + progressPct + "% of evidence reviewed</p>";
  html += "</div>";

  html += '<div class="dashboard-columns">';

  html += '<div class="dashboard-panel"><h3>Recent evidence</h3>';
  const recentEvidence = allEvidence.slice(-5).reverse();
  if (recentEvidence.length === 0) {
    html += "<p>No evidence loaded yet.</p>";
  }
  for (let e = 0; e < recentEvidence.length; e++) {
    const ev = recentEvidence[e];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <span class="badge ' +
      getStatusBadgeClass(ev.status) +
      '">' +
      ev.status +
      "</span></div>";
  }
  html += "</div>";

  html += '<div class="dashboard-panel"><h3>Recent timeline events</h3>';
  const recentTimeline = getAllTimeline().slice(-5).reverse();
  if (recentTimeline.length === 0) {
    html += "<p>No timeline events loaded yet.</p>";
  }
  for (let t = 0; t < recentTimeline.length; t++) {
    const evt = recentTimeline[t];
    html +=
      '<div class="mini-list-item"><strong>' +
      formatDate(evt.time) +
      "</strong><br>" +
      evt.title +
      "</div>";
  }
  html += "</div>";

  html += "</div>"; // dashboard-columns

  container.innerHTML = html;
}

const statCardHTML = (value: number, label: string) => {
  return (
    '<div class="stat-card"><div class="stat-value">' +
    value +
    '</div><div class="stat-label">' +
    label +
    "</div></div>"
  );
};

// ---------------------------------------------------------------------
// EVIDENCE CATALOGUE
// ---------------------------------------------------------------------

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function optionsHTML<T>(items: T[], getValue: (item: T) => string, getLabel: (item: T) => string) {
  let html = "";
  for (let i = 0; i < items.length; i++) {
    html += '<option value="' + getValue(items[i]) + '">' + getLabel(items[i]) + "</option>";
  }
  return html;
}

function populateEvidenceDropdowns() {
  const typeSelect = document.getElementById("filterType");
  const personSelect = document.getElementById("filterPerson");
  const locationSelect = document.getElementById("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  const evidence = getAllEvidence();
  const types: string[] = [];
  for (let i = 0; i < evidence.length; i++) {
    const t = evidence[i].type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }
  typeSelect.innerHTML =
    '<option value="">All types</option>' +
    optionsHTML(
      types,
      function (t) {
        return t;
      },
      function (t) {
        return t;
      },
    );

  const people = getAllPeople();
  personSelect.innerHTML =
    '<option value="">All people</option>' +
    optionsHTML(
      people,
      function (p) {
        return p.id;
      },
      function (p) {
        return p.name;
      },
    );

  const locations = getAllLocations();
  locationSelect.innerHTML =
    '<option value="">All locations</option>' +
    optionsHTML(
      locations,
      function (l) {
        return l.id;
      },
      function (l) {
        return l.id + " - " + l.name;
      },
    );
}

function getFilteredEvidence() {
  const searchBox = findEl<HTMLInputElement>("evidenceSearch");
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = getEl<HTMLSelectElement>("filterType").value;
  const personVal = getEl<HTMLSelectElement>("filterPerson").value;
  const locationVal = getEl<HTMLSelectElement>("filterLocation").value;
  const statusVal = getEl<HTMLSelectElement>("filterStatus").value;
  const relevanceVal = getEl<HTMLSelectElement>("filterRelevance").value;

  const evidence = getAllEvidence();
  const results: Evidence[] = [];
  for (let i = 0; i < evidence.length; i++) {
    const item = evidence[i];
    let matches = true; // reassigned to false below when a filter doesn't match -> let

    if (searchTerm) {
      const haystack = (item.title + " " + item.summary + " " + item.tags.join(" ")).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1) matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal) matches = false;
    if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal)
      matches = false;

    if (matches) results.push(item);
  }

  const sortSelect = findEl<HTMLSelectElement>("sortEvidence");
  const sortValue = sortSelect ? sortSelect.value : "date-desc";
  if (sortValue === "title-asc") {
    results.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sortValue === "title-desc") {
    results.sort(function (a, b) {
      return b.title.localeCompare(a.title);
    });
  } else if (sortValue === "date-asc") {
    results.sort(function (a, b) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } else {
    results.sort(function (a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  setFilteredEvidenceList(results);
  return results;
}

export function renderEvidenceList() {
  const container = document.getElementById("evidenceList");
  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (getEvidenceViewLoading()) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = ""; // reassigned below -> let
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (let i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html;
  container.removeEventListener("click", handleEvidenceListClick);
  container.addEventListener("click", handleEvidenceListClick);
}

function renderEvidenceCardHTML(ev: Evidence) {
  const isBookmarked = getBookmarks().indexOf(ev.id) !== -1;
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
  html +=
    '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
  html += "<div>";
  for (let t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
}

function handleEvidenceListClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.action === "bookmark") {
    event.stopPropagation();
    if (target.dataset.id) handleBookmarkClick(target.dataset.id);
    return;
  }

  const card = target.closest(".evidence-card");
  if (card) {
    const cardId = card.getAttribute("data-id");
    if (cardId) openEvidenceDetail(cardId);
  }
}

function handleBookmarkClick(evidenceId: string) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  const bookmarks = getBookmarks();
  if (bookmarks.indexOf(evidenceId) === -1) {
    bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    setBookmarks(
      bookmarks.filter(function (id) {
        return id !== evidenceId;
      }),
    );
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (getCurrentPage() === "evidence") renderEvidenceList();
}

export function handleSortChange() {
  const sortValue = getEl<HTMLSelectElement>("sortEvidence").value;
  const filteredEvidenceList = getFilteredEvidenceList();

  if (sortValue === "title-asc") {
    filteredEvidenceList.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sortValue === "title-desc") {
    filteredEvidenceList.sort(function (a, b) {
      return b.title.localeCompare(a.title);
    });
  } else if (sortValue === "date-asc") {
    filteredEvidenceList.sort(function (a, b) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } else {
    filteredEvidenceList.sort(function (a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  renderEvidenceList();
}

export function clearFilters() {
  getEl<HTMLInputElement>("evidenceSearch").value = "";
  getEl<HTMLSelectElement>("filterType").value = "";
  getEl<HTMLSelectElement>("filterPerson").value = "";
  getEl<HTMLSelectElement>("filterLocation").value = "";
  getEl<HTMLSelectElement>("filterStatus").value = "";
  getEl<HTMLSelectElement>("filterRelevance").value = "";
  renderEvidenceList();
}

function simulateAsyncSearch(term: string) {
  return new Promise<string>(function (resolve) {
    setTimeout(function () {
      resolve(term);
    }, 300);
  });
}

// module-level counter, reassigned on every keystroke -> let
let latestSearchRequestId = 0;

export function handleSearchInput(event: Event) {
  const term = (event.target as HTMLInputElement).value;
  const requestId = ++latestSearchRequestId;

  simulateAsyncSearch(term).then(function () {
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  });
}

// ---------------------------------------------------------------------
// EVIDENCE DETAIL
// ---------------------------------------------------------------------

function openEvidenceDetail(evidenceId: string) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  setSelectedEvidence(ev);

  const section = getEl("evidenceDetailSection");
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail() {
  const section = getEl("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  setSelectedEvidence(null);
}

function renderEvidenceDetail(ev: Evidence) {
  const section = getEl("evidenceDetailSection");

  const personNames = [];
  for (let p = 0; p < ev.personIds.length; p++) {
    const person = findPersonById(ev.personIds[p]);
    personNames.push(person ? person.name : ev.personIds[p]);
  }

  const locationNames = [];
  for (let l = 0; l < ev.locationIds.length; l++) {
    const loc = findLocationById(ev.locationIds[l]);
    locationNames.push(loc ? loc.id + " - " + loc.name : ev.locationIds[l]);
  }

  let tagsHtml = "";
  for (let t = 0; t < ev.tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";
  html +=
    '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html +=
    '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";
  html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";
  html +=
    '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  const statusSelect = getEl<HTMLSelectElement>("detailStatusSelect");
  statusSelect.addEventListener("change", function () {
    ev.status = statusSelect.value as EvidenceStatus;
    renderEvidenceDetail(ev);
    if (getViewRendered().evidence) renderEvidenceList();
  });
  const relevanceSelect = getEl<HTMLSelectElement>("detailRelevanceSelect");
  relevanceSelect.addEventListener("change", function () {
    ev.relevance = relevanceSelect.value as EvidenceRelevance;
    renderEvidenceDetail(ev);
    if (getViewRendered().evidence) renderEvidenceList();
  });
}

function statusOptionHTML(current: string | null | undefined, value: string, label: string) {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

export function saveCurrentNote() {
  const textarea = findEl<HTMLTextAreaElement>("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  if (!evidenceId) return;
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
}

// ---------------------------------------------------------------------
// PEOPLE & LOCATIONS
// ---------------------------------------------------------------------

export function switchPeopleTab(tab: string) {
  setCurrentPeopleTab(tab);
  const peoplePanel = getEl("peoplePanel");
  const locationsPanel = getEl("locationsPanel");
  const peopleTabBtn = getEl("tabPeopleBtn");
  const locationsTabBtn = getEl("tabLocationsBtn");

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

function countEvidenceForPerson(person: Person) {
  const evidence = getAllEvidence();
  let count = 0;
  for (let i = 0; i < evidence.length; i++) {
    if (evidenceMentionsPerson(evidence[i], person)) count++;
  }
  return count;
}

export function renderPeople() {
  const container = getEl("peoplePanel");
  const people = getAllPeople();
  let html = "";
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';
    html +=
      "<div><h3>" + person.name + '</h3><div class="person-role">' + person.role + "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (let r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html += '<div class="person-statement">&ldquo;' + person.statement + "&rdquo;</div>";
    html += "<p>" + count + " related evidence item" + (count === 1 ? "" : "s") + " &mdash; ";
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");
  for (let l = 0; l < links.length; l++) {
    const link = links[l];
    link.addEventListener("click", function () {
      const personId = link.getAttribute("data-person-id") ?? "";
      getEl<HTMLSelectElement>("filterPerson").value = personId;
      navigateTo("evidence");
      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations() {
  const container = getEl("locationsPanel");
  const locations = getAllLocations();
  let html = "";
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (let c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}

// ---------------------------------------------------------------------
// TIMELINE
// ---------------------------------------------------------------------

function populateTimelineDropdowns() {
  const personSelect = document.getElementById("timelinePersonFilter");
  const locationSelect = document.getElementById("timelineLocationFilter");
  const typeSelect = document.getElementById("timelineTypeFilter");
  if (!personSelect || !locationSelect || !typeSelect) return;

  const people = getAllPeople();
  personSelect.innerHTML =
    '<option value="">All people</option>' +
    optionsHTML(
      people,
      function (p) {
        return p.id;
      },
      function (p) {
        return p.name;
      },
    );

  const locations = getAllLocations();
  locationSelect.innerHTML =
    '<option value="">All locations</option>' +
    optionsHTML(
      locations,
      function (l) {
        return l.id;
      },
      function (l) {
        return l.id;
      },
    );

  const timeline = getAllTimeline();
  const types: string[] = [];
  for (let i = 0; i < timeline.length; i++) {
    if (types.indexOf(timeline[i].type) === -1) types.push(timeline[i].type);
  }
  typeSelect.innerHTML =
    '<option value="">All event types</option>' +
    optionsHTML(
      types,
      function (t) {
        return t;
      },
      function (t) {
        return t;
      },
    );
}

export function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  const order = getEl<HTMLSelectElement>("timelineOrder").value;
  const personFilter = getEl<HTMLSelectElement>("timelinePersonFilter").value;
  const locationFilter = getEl<HTMLSelectElement>("timelineLocationFilter").value;
  const typeFilter = getEl<HTMLSelectElement>("timelineTypeFilter").value;

  const allTimeline = getAllTimeline();
  const collected: TimelineEvent[] = [];
  for (let i = 0; i < allTimeline.length; i++) {
    const evt = allTimeline[i];
    if (personFilter && evt.personIds.indexOf(personFilter) === -1) continue;
    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1) continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    collected.push(evt);
  }

  // events is reassigned by .sort() chaining below -> let
  const events = collected.slice().sort(function (a, b) {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (let e = 0; e < events.length; e++) {
    const item = events[e];
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    // NOTE (demo7): findLocationById returns a location OBJECT, and join()
    // then prints "[object Object]". Existing bug, left as it is on purpose
    // so the app behaves exactly like the JavaScript version.
    const eventLocationNames: Array<CaseLocation | string> = [];
    for (let el = 0; el < item.locationIds.length; el++) {
      const evtLoc = findLocationById(item.locationIds[el]);
      eventLocationNames.push(evtLoc || item.locationIds[el]);
    }
    if (eventLocationNames.length > 0) {
      html += '<p class="evidence-meta">Location: ' + eventLocationNames.join(", ") + "</p>";
    }

    for (let ev2 = 0; ev2 < item.evidenceIds.length; ev2++) {
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        item.evidenceIds[ev2] +
        '">View ' +
        item.evidenceIds[ev2] +
        "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");
  for (let b = 0; b < linkButtons.length; b++) {
    const linkButton = linkButtons[b];
    linkButton.addEventListener("click", function () {
      const linkedId = linkButton.getAttribute("data-evidence-id");
      if (linkedId) openEvidenceModal(linkedId);
    });
  }
}

// --- Quick-view modal (used from the timeline) -------------------------
function openEvidenceModal(evidenceId: string) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  // use the existing modal element if there is one, otherwise create it
  const existingModal = document.getElementById("quickViewModal");
  const modal = existingModal ?? document.createElement("div");
  if (!existingModal) {
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" +
    ev.title +
    "</h3>" +
    '<p class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</p>" +
    "<p>" +
    ev.summary +
    "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    "</div></div>";

  incrementModalCloseListenerCount();
  console.log("modal opened, active close listeners:", getModalCloseListenerCount());

  modal.addEventListener("click", function (e) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (
      target.classList.contains("modal-close-btn") ||
      target.classList.contains("modal-backdrop")
    ) {
      modal.innerHTML = "";
    }
    const openFullId = target.getAttribute("data-open-full");
    if (openFullId) {
      modal.innerHTML = "";
      navigateTo("evidence");
      setTimeout(function () {
        openEvidenceDetail(openFullId);
      }, 0);
    }
  });
}

// ---------------------------------------------------------------------
// WORKSPACE
// ---------------------------------------------------------------------

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList() {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = getAllEvidence().filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (let b = 0; b < openButtons.length; b++) {
    const openButton = openButtons[b];
    openButton.addEventListener("click", function () {
      navigateTo("evidence");
      const id = openButton.getAttribute("data-open-evidence");
      if (!id) return;
      setTimeout(function () {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

function renderNotesList() {
  const container = document.getElementById("notesList");
  if (!container) return;

  const notesStore = getNotesStore();
  const evidence = getAllEvidence();
  const noteEntries: Array<{ index: number; evidenceId: string; title: string; text: string }> = [];
  for (let i = 0; i < evidence.length; i++) {
    const note = notesStore[evidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: evidence[i].id,
        title: evidence[i].title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

function populateHypothesisDropdowns() {
  const suspectSelect = findEl<HTMLSelectElement>("hypSuspect");
  const evidenceSelect = findEl<HTMLSelectElement>("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  const people = getAllPeople();
  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML =
    '<option value="">Select a person…</option>' +
    optionsHTML(
      people,
      function (p) {
        return p.id;
      },
      function (p) {
        return p.name;
      },
    );
  suspectSelect.value = currentSuspect;

  const evidence = getAllEvidence();
  evidenceSelect.innerHTML = optionsHTML(
    evidence,
    function (ev) {
      return ev.id;
    },
    function (ev) {
      return ev.id + " - " + ev.title;
    },
  );
}

export function saveHypothesis() {
  const draft: HypothesisDraft = {
    suspectId: getEl<HTMLSelectElement>("hypSuspect").value,
    nature: getEl<HTMLSelectElement>("hypNature").value,
    evidenceIds: getSelectedOptions(getEl<HTMLSelectElement>("hypEvidence")),
    confidence: getEl<HTMLInputElement>("hypConfidence").value,
    explanation: getEl<HTMLTextAreaElement>("hypExplanation").value,
    alternative: getEl<HTMLTextAreaElement>("hypAlternative").value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = getEl("hypothesisSavedMsg");
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

function loadHypothesisFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  const draft = JSON.parse(raw) as HypothesisDraft;
  const confidence = String(draft.confidence || 50);

  getEl<HTMLSelectElement>("hypSuspect").value = draft.suspectId || "";
  getEl<HTMLSelectElement>("hypNature").value = draft.nature || "";
  getEl<HTMLInputElement>("hypConfidence").value = confidence;
  getEl("hypConfidenceValue").textContent = confidence;
  getEl<HTMLTextAreaElement>("hypExplanation").value = draft.explanation || "";
  getEl<HTMLTextAreaElement>("hypAlternative").value = draft.alternative || "";

  const evidenceSelect = getEl<HTMLSelectElement>("hypEvidence");
  const savedIds = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected = savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
