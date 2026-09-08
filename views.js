// ---------------------------------------------------------------------
// views.js — every function that builds HTML and puts it on the page,
// plus the click/change handlers tied directly to that HTML.
// ---------------------------------------------------------------------
// Rule used throughout this file: a function gets `export` only if a
// DIFFERENT file genuinely calls it. Rule used for var/let/const: `let`
// if a variable is reassigned later, `const` if it's set once and never
// reassigned (loop counters are always `let`).

import {
  getAllEvidence,
  getFilteredEvidenceList, setFilteredEvidenceList,
  setSelectedEvidence,
  getBookmarks, setBookmarks,
  getCurrentPage,
  getAllPeople, getAllLocations, getAllTimeline, getCaseData,
  setCurrentPeopleTab,
  getEvidenceViewLoading,
  getViewRendered,
  getNotesStore,
  getModalCloseListenerCount, incrementModalCloseListenerCount,
  STORAGE_KEY_HYPOTHESIS
} from "./state.js";

import {
  findEvidenceById, findPersonById, findLocationById,
  evidenceMentionsPerson, formatDate,
  getStatusBadgeClass, getRelevanceBadgeClass, certaintyBadgeClass,
  getSelectedOptions, navigateTo
} from "./utils.js";

import { saveBookmarksToStorage, loadNoteForEvidence, saveNoteForEvidence } from "./api.js";

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

  const progressPct = allEvidence.length === 0 ? 0 : Math.round((reviewedCount / allEvidence.length) * 100);

  let html = "";
  html += '<div class="case-summary-card">';
  html += "<h3>" + (caseData.title || "Case") + "</h3>";
  html += '<p><span class="badge badge-flagged">' + (caseData.status || "unknown").toUpperCase() + "</span></p>";
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
  html += '<div class="progress-bar-outer"><div class="progress-bar-inner" style="width:' + progressPct + '%;"></div></div>';
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
    html += '<div class="mini-list-item"><strong>' + ev.id + "</strong> &mdash; " + ev.title +
      ' <span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span></div>";
  }
  html += "</div>";

  html += '<div class="dashboard-panel"><h3>Recent timeline events</h3>';
  const recentTimeline = getAllTimeline().slice(-5).reverse();
  if (recentTimeline.length === 0) {
    html += "<p>No timeline events loaded yet.</p>";
  }
  for (let t = 0; t < recentTimeline.length; t++) {
    const evt = recentTimeline[t];
    html += '<div class="mini-list-item"><strong>' + formatDate(evt.time) + "</strong><br>" + evt.title + "</div>";
  }
  html += "</div>";

  html += "</div>"; // dashboard-columns

  container.innerHTML = html;
}

function statCardHTML(value, label) {
  return '<div class="stat-card"><div class="stat-value">' + value + '</div><div class="stat-label">' + label + "</div></div>";
}

// ---------------------------------------------------------------------
// EVIDENCE CATALOGUE
// ---------------------------------------------------------------------

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function optionsHTML(items, getValue, getLabel) {
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
  const types = [];
  for (let i = 0; i < evidence.length; i++) {
    const t = evidence[i].type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }
  typeSelect.innerHTML = '<option value="">All types</option>' +
    optionsHTML(types, function (t) { return t; }, function (t) { return t; });

  const people = getAllPeople();
  personSelect.innerHTML = '<option value="">All people</option>' +
    optionsHTML(people, function (p) { return p.id; }, function (p) { return p.name; });

  const locations = getAllLocations();
  locationSelect.innerHTML = '<option value="">All locations</option>' +
    optionsHTML(locations, function (l) { return l.id; }, function (l) { return l.id + " - " + l.name; });
}

function getFilteredEvidence() {
  const searchBox = document.getElementById("evidenceSearch");
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = document.getElementById("filterType").value;
  const personVal = document.getElementById("filterPerson").value;
  const locationVal = document.getElementById("filterLocation").value;
  const statusVal = document.getElementById("filterStatus").value;
  const relevanceVal = document.getElementById("filterRelevance").value;

  const evidence = getAllEvidence();
  const results = [];
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
    if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal) matches = false;

    if (matches) results.push(item);
  }

  const sortSelect = document.getElementById("sortEvidence");
  const sortValue = sortSelect ? sortSelect.value : "date-desc";
  if (sortValue === "title-asc") {
    results.sort(function (a, b) { return a.title.localeCompare(b.title); });
  } else if (sortValue === "title-desc") {
    results.sort(function (a, b) { return b.title.localeCompare(a.title); });
  } else if (sortValue === "date-asc") {
    results.sort(function (a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
  } else {
    results.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  }
  setFilteredEvidenceList(results);
  return results;
}

export function renderEvidenceList() {
  console.log("render ran");
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

function renderEvidenceCardHTML(ev) {
  const isBookmarked = getBookmarks().indexOf(ev.id) !== -1;
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html += '<button class="bookmark-btn ' + (isBookmarked ? "active" : "") + '" data-action="bookmark" data-id="' + ev.id + '" aria-label="Toggle bookmark for ' + ev.title + '"><span class="bookmark-icon">' + (isBookmarked ? "★" : "☆") + "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
  html += '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
  html += "<div>";
  for (let t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
}

function handleEvidenceListClick(event) {
  const target = event.target;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id);
    return;
  }

  const card = target.closest(".evidence-card");
  if (card) {
    openEvidenceDetail(card.getAttribute("data-id"));
  }
}

function handleBookmarkClick(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  const bookmarks = getBookmarks();
  if (bookmarks.indexOf(evidenceId) === -1) {
    bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    setBookmarks(bookmarks.filter(function (id) {
      return id !== evidenceId;
    }));
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (getCurrentPage() === "evidence") renderEvidenceList();
}

export function handleSortChange() {
  const sortValue = document.getElementById("sortEvidence").value;
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
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  } else {
    filteredEvidenceList.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }
  renderEvidenceList();
}

export function clearFilters() {
  document.getElementById("evidenceSearch").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterPerson").value = "";
  document.getElementById("filterLocation").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterRelevance").value = "";
  renderEvidenceList();
}

function simulateAsyncSearch(term) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(term);
    }, 300);
  });
}

// module-level counter, reassigned on every keystroke -> let
let latestSearchRequestId = 0;

export function handleSearchInput(event) {
  const term = event.target.value;
  const requestId = ++latestSearchRequestId;

  simulateAsyncSearch(term).then(function (resolvedTerm) {
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  });
}

// ---------------------------------------------------------------------
// EVIDENCE DETAIL
// ---------------------------------------------------------------------

function openEvidenceDetail(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  setSelectedEvidence(ev);

  const section = document.getElementById("evidenceDetailSection");
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail() {
  const section = document.getElementById("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  setSelectedEvidence(null);
}

function renderEvidenceDetail(ev) {
  const section = document.getElementById("evidenceDetailSection");

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
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div></div>";
  html += '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html += '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
  html += '<div class="detail-field"><strong>Related locations</strong>' + locationNames.join(", ") + "</div>";
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
  html += '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' + ev.id + '" placeholder="Add a private note about this evidence...">' + storedNote + "</textarea>";
  html += '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html += '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' + storedNote + "</div></div>";

  section.innerHTML = html;

  document.getElementById("detailStatusSelect").addEventListener("change", function (e) {
    ev.status = e.target.value;
    renderEvidenceDetail(ev);
    if (getViewRendered().evidence) renderEvidenceList();
  });
  document.getElementById("detailRelevanceSelect").addEventListener("change", function (e) {
    ev.relevance = e.target.value;
    renderEvidenceDetail(ev);
    if (getViewRendered().evidence) renderEvidenceList();
  });
}

function statusOptionHTML(current, value, label) {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

export function saveCurrentNote() {
  const textarea = document.getElementById("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
}

// ---------------------------------------------------------------------
// PEOPLE & LOCATIONS
// ---------------------------------------------------------------------

export function switchPeopleTab(tab) {
  setCurrentPeopleTab(tab);
  const peoplePanel = document.getElementById("peoplePanel");
  const locationsPanel = document.getElementById("locationsPanel");
  const peopleTabBtn = document.getElementById("tabPeopleBtn");
  const locationsTabBtn = document.getElementById("tabLocationsBtn");

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

function countEvidenceForPerson(person) {
  const evidence = getAllEvidence();
  let count = 0;
  for (let i = 0; i < evidence.length; i++) {
    if (evidenceMentionsPerson(evidence[i], person)) count++;
  }
  return count;
}

export function renderPeople() {
  const container = document.getElementById("peoplePanel");
  const people = getAllPeople();
  let html = "";
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html += '<img class="person-avatar" src="' + person.avatar + '" alt="Portrait of ' + person.name + '">';
    html += "<div><h3>" + person.name + "</h3><div class=\"person-role\">" + person.role + "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (let r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html += '<div class="person-statement">&ldquo;' + person.statement + '&rdquo;</div>';
    html += "<p>" + count + " related evidence item" + (count === 1 ? "" : "s") + " &mdash; ";
    html += '<button type="button" class="evidence-count-link" data-person-id="' + person.id + '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");
  for (let l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e) {
      const personId = e.target.getAttribute("data-person-id");
      document.getElementById("filterPerson").value = personId;
      navigateTo("evidence");
      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations() {
  const container = document.getElementById("locationsPanel");
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
  personSelect.innerHTML = '<option value="">All people</option>' +
    optionsHTML(people, function (p) { return p.id; }, function (p) { return p.name; });

  const locations = getAllLocations();
  locationSelect.innerHTML = '<option value="">All locations</option>' +
    optionsHTML(locations, function (l) { return l.id; }, function (l) { return l.id; });

  const timeline = getAllTimeline();
  const types = [];
  for (let i = 0; i < timeline.length; i++) {
    if (types.indexOf(timeline[i].type) === -1) types.push(timeline[i].type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>' +
    optionsHTML(types, function (t) { return t; }, function (t) { return t; });
}

export function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  const order = document.getElementById("timelineOrder").value;
  const personFilter = document.getElementById("timelinePersonFilter").value;
  const locationFilter = document.getElementById("timelineLocationFilter").value;
  const typeFilter = document.getElementById("timelineTypeFilter").value;

  const allTimeline = getAllTimeline();
  const collected = [];
  for (let i = 0; i < allTimeline.length; i++) {
    const evt = allTimeline[i];
    if (personFilter && evt.personIds.indexOf(personFilter) === -1) continue;
    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1) continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    collected.push(evt);
  }

  // events is reassigned by .sort() chaining below -> let
  let events = collected.slice().sort(function (a, b) {
    const diff = new Date(a.time) - new Date(b.time);
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (let e = 0; e < events.length; e++) {
    const item = events[e];
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html += '<div class="timeline-time">' + formatDate(item.time) + '&nbsp;&middot;&nbsp;<span class="badge badge-' + certaintyBadgeClass(item.certainty) + '">' + item.certainty + "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    const eventLocationNames = [];
    for (let el = 0; el < item.locationIds.length; el++) {
      const evtLoc = findLocationById(item.locationIds[el]);
      eventLocationNames.push(evtLoc || item.locationIds[el]);
    }
    if (eventLocationNames.length > 0) {
      html += '<p class="evidence-meta">Location: ' + eventLocationNames.join(", ") + "</p>";
    }

    for (let ev2 = 0; ev2 < item.evidenceIds.length; ev2++) {
      html += '<button type="button" class="evidence-link-btn" data-evidence-id="' + item.evidenceIds[ev2] + '">View ' + item.evidenceIds[ev2] + "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");
  for (let b = 0; b < linkButtons.length; b++) {
    linkButtons[b].addEventListener("click", function (e) {
      openEvidenceModal(e.target.getAttribute("data-evidence-id"));
    });
  }
}

// --- Quick-view modal (used from the timeline) -------------------------
function openEvidenceModal(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  // reassigned below if it didn't already exist -> let
  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" + ev.title + "</h3>" +
    '<p class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</p>" +
    "<p>" + ev.summary + "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' + ev.id + '">Open full evidence</button>' +
    "</div></div>";

  incrementModalCloseListenerCount();
  console.log("modal opened, active close listeners:", getModalCloseListenerCount());

  modal.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-close-btn") || e.target.classList.contains("modal-backdrop")) {
      modal.innerHTML = "";
    }
    if (e.target.getAttribute && e.target.getAttribute("data-open-full")) {
      modal.innerHTML = "";
      navigateTo("evidence");
      setTimeout(function () {
        openEvidenceDetail(e.target.getAttribute("data-open-full"));
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
    container.innerHTML = "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    html += '<div class="mini-list-item"><strong>' + ev.id + "</strong> &mdash; " + ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' + ev.id + '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (let b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e) {
      navigateTo("evidence");
      const id = e.target.getAttribute("data-open-evidence");
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
  const noteEntries = [];
  for (let i = 0; i < evidence.length; i++) {
    const note = notesStore[evidence[i].id];
    if (note) {
      noteEntries.push({ index: i, evidenceId: evidence[i].id, title: evidence[i].title, text: note });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    html += '<div class="mini-list-item"><strong>' + entry.evidenceId + "</strong> &mdash; " + entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

function populateHypothesisDropdowns() {
  const suspectSelect = document.getElementById("hypSuspect");
  const evidenceSelect = document.getElementById("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  const people = getAllPeople();
  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>' +
    optionsHTML(people, function (p) { return p.id; }, function (p) { return p.name; });
  suspectSelect.value = currentSuspect;

  const evidence = getAllEvidence();
  evidenceSelect.innerHTML = optionsHTML(evidence, function (ev) { return ev.id; }, function (ev) { return ev.id + " - " + ev.title; });
}

export function saveHypothesis() {
  const draft = {
    suspectId: document.getElementById("hypSuspect").value,
    nature: document.getElementById("hypNature").value,
    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence")),
    confidence: document.getElementById("hypConfidence").value,
    explanation: document.getElementById("hypExplanation").value,
    alternative: document.getElementById("hypAlternative").value,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg");
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

function loadHypothesisFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  const draft = JSON.parse(raw);

  document.getElementById("hypSuspect").value = draft.suspectId || "";
  document.getElementById("hypNature").value = draft.nature || "";
  document.getElementById("hypConfidence").value = draft.confidence || 50;
  document.getElementById("hypConfidenceValue").textContent = draft.confidence || 50;
  document.getElementById("hypExplanation").value = draft.explanation || "";
  document.getElementById("hypAlternative").value = draft.alternative || "";

  const evidenceSelect = document.getElementById("hypEvidence");
  const savedIds = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected = savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}