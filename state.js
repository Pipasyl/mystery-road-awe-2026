// ---------------------------------------------------------------------
// state.js — the app's shared "memory"
// ---------------------------------------------------------------------
// Before the split, all of this lived as top-level `var` in one giant
// app.js. Any function anywhere in that file could read AND overwrite
// these variables directly. That's exactly how "two things that were
// supposed to be independent turn out to be linked" bugs happen.
//
// ES modules change the rules: every file gets its own private scope.
// A variable declared here is invisible to every other file unless we
// hand it out on purpose. So this file is now the ONLY place allowed
// to touch these variables directly. Every other module has to go
// through a getter (to read) or a setter (to write).
//
// NOTE for Demo 8: these are still declared with `var`, on purpose.
// Converting var -> let/const is a separate, later task. Don't touch
// it here.

var allEvidence = [];
var filteredEvidenceList = [];
var selectedEvidence = null;
var bookmarks = [];
var currentPage = "dashboard";

var allPeople = [];
var allLocations = [];
var allTimeline = [];
var caseData = {};

var currentPeopleTab = "people";
var loadingStepsRemaining = 2;
var evidenceViewLoading = true;

var viewRendered = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false
};

var notesStore = {};
var modalCloseListenerCount = 0;

// These three never change while the app runs, so exporting them
// directly as `const` is safe — any file can just read the value,
// no getter needed. That's the difference between "data that changes"
// (needs a getter/setter pair below) and "a fixed label" (doesn't).
export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

// --- evidence ---------------------------------------------------------
export function getAllEvidence() { return allEvidence; }
export function setAllEvidence(data) { allEvidence = data; }

export function getFilteredEvidenceList() { return filteredEvidenceList; }
export function setFilteredEvidenceList(data) { filteredEvidenceList = data; }

export function getSelectedEvidence() { return selectedEvidence; }
export function setSelectedEvidence(ev) { selectedEvidence = ev; }

// --- bookmarks ----------------------------------------------------------
export function getBookmarks() { return bookmarks; }
export function setBookmarks(list) { bookmarks = list; }

// --- navigation state -----------------------------------------------------
export function getCurrentPage() { return currentPage; }
export function setCurrentPage(page) { currentPage = page; }

// --- people / locations / timeline / case ---------------------------------
export function getAllPeople() { return allPeople; }
export function setAllPeople(data) { allPeople = data; }

export function getAllLocations() { return allLocations; }
export function setAllLocations(data) { allLocations = data; }

export function getAllTimeline() { return allTimeline; }
export function setAllTimeline(data) { allTimeline = data; }

export function getCaseData() { return caseData; }
export function setCaseData(data) { caseData = data; }

export function getCurrentPeopleTab() { return currentPeopleTab; }
export function setCurrentPeopleTab(tab) { currentPeopleTab = tab; }

// --- loading lifecycle ------------------------------------------------------
export function getLoadingStepsRemaining() { return loadingStepsRemaining; }
export function setLoadingStepsRemaining(n) { loadingStepsRemaining = n; }

// Decrements AND hands back the new value in one call, since every
// caller of the old hideLoadingStep() needed the result immediately
// anyway (to decide whether to hide the overlay).
export function decrementLoadingSteps() {
  loadingStepsRemaining--;
  return loadingStepsRemaining;
}

export function getEvidenceViewLoading() { return evidenceViewLoading; }
export function setEvidenceViewLoading(val) { evidenceViewLoading = val; }

export function getViewRendered() { return viewRendered; }
export function markViewRendered(viewName) { viewRendered[viewName] = true; }

// --- notes ------------------------------------------------------------------
export function getNotesStore() { return notesStore; }
export function setNotesStore(store) { notesStore = store; }

// --- modal debug counter --------------------------------------------------
export function getModalCloseListenerCount() { return modalCloseListenerCount; }
export function incrementModalCloseListenerCount() {
  modalCloseListenerCount++;
  return modalCloseListenerCount;
}