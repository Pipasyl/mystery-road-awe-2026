// ---------------------------------------------------------------------
// main.js — the entry point. This is the ONLY file the browser loads
// directly (see index.html: <script type="module" src="main.js">).
// ---------------------------------------------------------------------

import {
  showLoadingOverlay,
  loadCorePeopleAndLocations,
  loadEvidenceData,
  loadTimelineData,
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./api";

import {
  getCurrentPage,
  setCurrentPage,
  getViewRendered,
  markViewRendered,
  setLoadingStepsRemaining,
} from "./state";

import { navigateTo } from "./utils";

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
  saveCurrentNote,
} from "./views";

declare global {
  interface Window {
    navigateTo: typeof navigateTo;
    switchPeopleTab: typeof switchPeopleTab;
    handleSortChange: typeof handleSortChange;
    saveHypothesis: typeof saveHypothesis;
    closeEvidenceDetail: typeof closeEvidenceDetail;
    saveCurrentNote: typeof saveCurrentNote;
    renderEvidenceList: typeof renderEvidenceList;
  }
}

function getEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found in the page`);
  return el as T;
}

// Bridge for inline onclick="..." attributes in index.html and in HTML
// strings views.js generates — those run as plain global JavaScript and
// can't see our module exports, so they need these on `window` directly.
window.navigateTo = navigateTo;
window.switchPeopleTab = switchPeopleTab;
window.handleSortChange = handleSortChange;
window.saveHypothesis = saveHypothesis;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
window.renderEvidenceList = renderEvidenceList;

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

function handleHashChange() {
  let hash = window.location.hash.replace("#", ""); // reassigned below if invalid -> let
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"]; // never reassigned -> const
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  setCurrentPage(hash);

  const sections = document.querySelectorAll(".view");
  for (let i = 0; i < sections.length; i++) {
    // loop counter -> let
    sections[i].classList.remove("active");
  }
  getEl("view-" + hash).classList.add("active");

  const navButtons = document.querySelectorAll(".nav-btn");
  for (let n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

  const viewRendered = getViewRendered();

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
    renderWorkspace();
  }
}

function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll(".nav-btn"); // never reassigned -> const
  // Demo 4 fix: was `var i` — one shared counter meant every button's
  // click listener read whatever `i` ended up at AFTER the loop finished
  // (past the last valid index), crashing on click. `let` gives each
  // loop pass its own separate copy of `i`.
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  getEl("evidenceSearch").addEventListener("input", handleSearchInput);

  getEl("filterType").addEventListener("change", renderEvidenceList);
  getEl("filterPerson").addEventListener("change", renderEvidenceList);
  getEl("filterLocation").addEventListener("change", renderEvidenceList);

  // NOTE: filterStatus is wired up TWICE — addEventListener AND an
  // inline onchange string. Already this way in the original code.
  getEl("filterStatus").addEventListener("change", renderEvidenceList);

  getEl("filterRelevance").addEventListener("change", renderEvidenceList);

  getEl("clearFiltersBtn").addEventListener("click", clearFilters);

  getEl("timelineOrder").addEventListener("change", renderTimeline);
  getEl("timelinePersonFilter").addEventListener("change", renderTimeline);
  getEl("timelineLocationFilter").addEventListener("change", renderTimeline);
  getEl("timelineTypeFilter").addEventListener("change", renderTimeline);
  //task 10
  const hypConfidence = getEl<HTMLInputElement>("hypConfidence");
  hypConfidence.addEventListener("input", () => {
    getEl("hypConfidenceValue").textContent = hypConfidence.value;
  });
}

// Demo 3 fix: was a plain function using loadNoteAsync("E01") without
// await, so it logged the Promise object itself instead of the resolved
// note text. `async` + `await` here makes it wait for the real value.
async function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  await loadAllData();
  handleHashChange();

  const firstNote = await loadNoteAsync("E01");
  console.log("First note preview:", firstNote);
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);
