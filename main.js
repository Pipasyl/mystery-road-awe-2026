// ---------------------------------------------------------------------
// main.js — the entry point. This is the ONLY file the browser loads
// directly (see index.html: <script type="module" src="main.js">).
// Its job: import everything else, wire up the router and every event
// listener, and kick the app off once the page has loaded.
// ---------------------------------------------------------------------

import {
  showLoadingOverlay,
  loadCorePeopleAndLocations,
  loadEvidenceData,
  loadTimelineData,
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync
} from "./api.js";

import {
  getCurrentPage,
  setCurrentPage,
  getViewRendered,
  markViewRendered,
  setLoadingStepsRemaining
} from "./state.js";

import { navigateTo } from "./utils.js";

import {
  renderDashboard,
  renderEvidenceList,
  renderPeople,
  renderLocations,
  renderTimeline,
  renderWorkspace,
  populateAllDropdowns,
  handleSearchInput,
  clearFilters,
  switchPeopleTab,
  handleSortChange,
  saveHypothesis,
  closeEvidenceDetail,
  saveCurrentNote
} from "./views.js";

// -------------------------------------------------------------------------
// Bridge to inline onclick="..." handlers
// -------------------------------------------------------------------------
// index.html (and a couple of HTML strings views.js generates, like the
// evidence detail's Close button) still call functions the old way:
//   <button onclick="navigateTo('dashboard')">
// Inline onclick attributes run as plain, old-school global JavaScript —
// they look the function name up on `window`. They have no idea our
// modules even exist, so import/export doesn't help them at all.
// Without these lines, clicking any of these buttons throws:
//   "Uncaught ReferenceError: navigateTo is not defined"
// renderEvidenceList is on this list for a less obvious reason: the
// filterStatus dropdown in index.html is wired up TWICE in the original
// code (see setupEventListeners below) — once with addEventListener,
// and once with a hand-written onchange="renderEvidenceList()" string.
// That second one needs this same bridge or it throws on every change.
// Every OTHER click in this app uses addEventListener instead, and none
// of those need this treatment.
window.navigateTo = navigateTo;
window.switchPeopleTab = switchPeopleTab;
window.handleSortChange = handleSortChange;
window.saveHypothesis = saveHypothesis;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
window.renderEvidenceList = renderEvidenceList;

// -------------------------------------------------------------------------
// Data loading orchestration
// -------------------------------------------------------------------------
// api.js only knows how to fetch things and store them in state.js — it
// deliberately has no idea views.js exists. Deciding what to render once
// each fetch resolves happens here instead, via callbacks, which is why
// api.js's loader functions take an onComplete parameter.

function loadAllData() {
  showLoadingOverlay("Loading case file…");
  setLoadingStepsRemaining(2);

  return loadCorePeopleAndLocations(function () {
    renderDashboard();
    populateAllDropdowns();
  }).then(function () {
    loadEvidenceData(function () {
      renderDashboard();
      populateAllDropdowns();
      if (getCurrentPage() === "evidence") renderEvidenceList();
    });

    loadTimelineData(function () {
      renderDashboard();
      if (getCurrentPage() === "timeline") renderTimeline();
      populateAllDropdowns();
    });
  });
}

// -------------------------------------------------------------------------
// Hash-based routing
// -------------------------------------------------------------------------

function handleHashChange() {
  var hash = window.location.hash.replace("#", "");
  var validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  setCurrentPage(hash);

  var sections = document.querySelectorAll(".view");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  document.getElementById("view-" + hash).classList.add("active");

  var navButtons = document.querySelectorAll(".nav-btn");
  for (var n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

  var viewRendered = getViewRendered();

  if (hash === "dashboard" && !viewRendered.dashboard) {
    renderDashboard();
    markViewRendered("dashboard");
  } else if (hash === "evidence" && !viewRendered.evidence) {
    renderEvidenceList();
    markViewRendered("evidence");
  } else if (hash === "people" && !viewRendered.people) {
    renderPeople();
    renderLocations();
    markViewRendered("people");
  } else if (hash === "timeline" && !viewRendered.timeline) {
    renderTimeline();
    markViewRendered("timeline");
  } else if (hash === "workspace") {
    // workspace is cheap enough that it always re-renders
    renderWorkspace();
  }
}

// -------------------------------------------------------------------------
// Event listener setup
// -------------------------------------------------------------------------

function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  var navButtons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      var targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  document.getElementById("evidenceSearch").addEventListener("input", handleSearchInput);

  document.getElementById("filterType").addEventListener("change", renderEvidenceList);
  document.getElementById("filterPerson").addEventListener("change", renderEvidenceList);
  document.getElementById("filterLocation").addEventListener("change", renderEvidenceList);

  // NOTE: filterStatus gets wired up TWICE right here — once with
  // addEventListener, once with setAttribute("onchange", ...). That was
  // already this weird in the original code. Not touching it in this
  // demo (pure refactor only) — keep it in mind for the bug hunts.
  document.getElementById("filterStatus").addEventListener("change", renderEvidenceList);
  document.getElementById("filterStatus").setAttribute("onchange", "renderEvidenceList()");

  document.getElementById("filterRelevance").addEventListener("change", renderEvidenceList);

  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

  document.getElementById("timelineOrder").addEventListener("change", renderTimeline);
  document.getElementById("timelinePersonFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineLocationFilter").addEventListener("change", renderTimeline);
  document.getElementById("timelineTypeFilter").addEventListener("change", renderTimeline);

  document.getElementById("hypConfidence").addEventListener("input", function (e) {
    document.getElementById("hypConfidenceValue").textContent = e.target.value;
  });
}

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    // Kept exactly as in the original: loadNoteAsync() returns a Promise,
    // so this logs a pending Promise object, not the actual note text.
    // Not fixing it here — pure refactor only.
    var firstNote = loadNoteAsync("E01");
    console.log("First note preview:", firstNote);
  });
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);