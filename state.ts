interface DataRecord {
  [key: string]: unknown;
}
interface IdRecord extends DataRecord {
  id: string;
}

let allEvidence: IdRecord[] = [];
let filteredEvidenceList: IdRecord[] = [];
let selectedEvidence: IdRecord | null = null;
let bookmarks: string[] = [];
let currentPage = "dashboard";
let allPeople: IdRecord[] = [];
let allLocations: IdRecord[] = [];
let allTimeline: DataRecord[] = [];
let caseData: DataRecord = {};

let currentPeopleTab = "people";
let loadingStepsRemaining = 2;
let evidenceViewLoading = true;

// const: this object itself is never replaced with a new object — only
// individual properties inside it change (see markViewRendered below),
// so the variable binding itself never needs reassigning.
const viewRendered: Record<string, boolean> = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false,
};

let notesStore: Record<string, string> = {};
let modalCloseListenerCount = 0;

// These three never change while the app runs, so exporting them
// directly as `const` is safe — any file can just read the value,
// no getter needed. That's the difference between "data that changes"
// (needs a getter/setter pair below) and "a fixed label" (doesn't).
export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

// --- evidence ---------------------------------------------------------
export function getAllEvidence() {
  return allEvidence;
}
export function setAllEvidence(data: IdRecord[]) {
  allEvidence = data;
}

export function getFilteredEvidenceList() {
  return filteredEvidenceList;
}
export function setFilteredEvidenceList(data: IdRecord[]) {
  filteredEvidenceList = data;
}

export function getSelectedEvidence() {
  return selectedEvidence;
}
export function setSelectedEvidence(ev: IdRecord | null) {
  selectedEvidence = ev;
}

// --- bookmarks ----------------------------------------------------------
export function getBookmarks() {
  return bookmarks;
}
export function setBookmarks(list: string[]) {
  bookmarks = list;
}

// --- navigation state -----------------------------------------------------
export function getCurrentPage() {
  return currentPage;
}
export function setCurrentPage(page: string) {
  currentPage = page;
}

// --- people / locations / timeline / case ---------------------------------
export function getAllPeople() {
  return allPeople;
}
export function setAllPeople(data: IdRecord[]) {
  allPeople = data;
}

export function getAllLocations() {
  return allLocations;
}
export function setAllLocations(data: IdRecord[]) {
  allLocations = data;
}

export function getAllTimeline() {
  return allTimeline;
}
export function setAllTimeline(data: DataRecord[]) {
  allTimeline = data;
}

export function getCaseData() {
  return caseData;
}
export function setCaseData(data: DataRecord) {
  caseData = data;
}

export function getCurrentPeopleTab() {
  return currentPeopleTab;
}
export function setCurrentPeopleTab(tab: string) {
  currentPeopleTab = tab;
}

// --- loading lifecycle ------------------------------------------------------
export function getLoadingStepsRemaining() {
  return loadingStepsRemaining;
}
export function setLoadingStepsRemaining(n: number) {
  loadingStepsRemaining = n;
}

// Decrements AND hands back the new value in one call, since every
// caller of the old hideLoadingStep() needed the result immediately
// anyway (to decide whether to hide the overlay).
export function decrementLoadingSteps() {
  loadingStepsRemaining--;
  return loadingStepsRemaining;
}

export function getEvidenceViewLoading() {
  return evidenceViewLoading;
}
export function setEvidenceViewLoading(val: boolean) {
  evidenceViewLoading = val;
}

export function getViewRendered() {
  return viewRendered;
}
export function markViewRendered(viewName: string) {
  viewRendered[viewName] = true;
}

// --- notes ------------------------------------------------------------------
export function getNotesStore() {
  return notesStore;
}
export function setNotesStore(store: Record<string, string>) {
  notesStore = store;
}

// --- modal debug counter --------------------------------------------------
export function getModalCloseListenerCount() {
  return modalCloseListenerCount;
}
export function incrementModalCloseListenerCount() {
  modalCloseListenerCount++;
  return modalCloseListenerCount;
}