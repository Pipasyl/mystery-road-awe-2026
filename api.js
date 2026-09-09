// ---------------------------------------------------------------------
// api.js — anything that talks OUTSIDE this app: the server (fetch)
// and the browser's own storage (localStorage).
// ---------------------------------------------------------------------
// This file never touches the page's content and never calls a render
// function. It only knows how to fetch/save data, and it calls an
// `onComplete` callback once data has landed in state.js. Deciding
// WHAT to render once data arrives is main.js's job (see main.js) —
// that's what keeps this file and views.js from needing to import
// each other.

import {
  setCaseData,
  setAllPeople,
  setAllLocations,
  setAllEvidence,
  setAllTimeline,
  getAllEvidence,
  getBookmarks,
  setBookmarks,
  setFilteredEvidenceList,
  setEvidenceViewLoading,
  getNotesStore,
  setNotesStore,
  decrementLoadingSteps,
  STORAGE_KEY_BOOKMARKS,
  STORAGE_KEY_NOTES
} from "./state.js";

// --- loading overlay --------------------------------------------------------

export function showLoadingOverlay(msg) {
  const overlay = document.getElementById("loadingOverlay"); // never reassigned -> const
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

export function hideLoadingStep() {
  const remaining = decrementLoadingSteps(); // never reassigned -> const
  if (remaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

// --- fetching case data ------------------------------------------------------
// Left exactly as a deeply-nested .then() chain on purpose. Demo 9 asks
// you to find "the most deeply nested chain of .then() calls" in this
// app and convert it to async/await — this is the one. Not touching the
// nesting shape here, only swapping global-variable writes for state.js
// setters and render calls for the onComplete callback.

// Demo 9: was 3 levels of nested .then() calls (case -> people -> locations,
// each waiting for the previous to finish). Converted to async/await —
// exact same sequential behavior (still one request after another, not
// parallel; that optimization is a later exercise), just linear to read.
export async function loadCorePeopleAndLocations(onComplete) {
  const caseRes = await fetch("data/case.json");
  const caseJson = await caseRes.json();
  setCaseData(caseJson);

  const peopleRes = await fetch("data/people.json");
  const peopleJson = await peopleRes.json();
  setAllPeople(peopleJson);

  const locationsRes = await fetch("data/locations.json");
  const locationsJson = await locationsRes.json();
  setAllLocations(locationsJson);

  hideLoadingStep();
  if (onComplete) onComplete();
}

export function loadEvidenceData(onComplete) {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      setAllEvidence(data);
      setEvidenceViewLoading(false);
      applyStoredBookmarkFlags();
      // NOTE: this points filteredEvidenceList at the SAME array as
      // allEvidence, it does not copy it — exactly like the original
      // `filteredEvidence = allEvidence;` line. Not fixing that here,
      // pure refactor only. Keep this in your back pocket for Demo 2.
      setFilteredEvidenceList(getAllEvidence());
      if (onComplete) onComplete();
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

// Demo 9: second conversion — .then()/.catch()/.finally() rewritten as
// async/await with try/catch/finally, same error handling preserved.
export async function loadTimelineData(onComplete) {
  try {
    const res = await fetch("data/timeline.json");
    const data = await res.json();
    setAllTimeline(data);
    if (onComplete) onComplete();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export function applyStoredBookmarkFlags() {
  const evidence = getAllEvidence(); // never reassigned -> const
  const bookmarkedIds = getBookmarks();
  for (let i = 0; i < evidence.length; i++) { // loop counter -> let
    evidence[i].bookmarked = bookmarkedIds.indexOf(evidence[i].id) !== -1;
  }
}

// --- localStorage persistence -------------------------------------------

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(getBookmarks()));
}

export function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS); // never reassigned -> const
    const parsed = raw ? JSON.parse(raw) : [];
    setBookmarks(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    setBookmarks([]);
  }
}

export function saveNoteForEvidence(evidenceId, text) {
  const notes = getNotesStore(); // the variable is never reassigned, only a property inside it is set -> const
  notes[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
}

export function loadNoteForEvidence(evidenceId) {
  return getNotesStore()[evidenceId] || "";
}

export function loadNotesFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    setNotesStore({});
    return;
  }
  setNotesStore(JSON.parse(raw));
}

export function loadNoteAsync(evidenceId) {
  return new Promise(function (resolve) {
    resolve(getNotesStore()[evidenceId] || "");
  });
}