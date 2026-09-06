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
  var overlay = document.getElementById("loadingOverlay");
  var text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

export function hideLoadingStep() {
  var remaining = decrementLoadingSteps();
  if (remaining <= 0) {
    var overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

// --- fetching case data ------------------------------------------------------
// Left exactly as a deeply-nested .then() chain on purpose. Demo 9 asks
// you to find "the most deeply nested chain of .then() calls" in this
// app and convert it to async/await — this is the one. Not touching the
// nesting shape here, only swapping global-variable writes for state.js
// setters and render calls for the onComplete callback.

export function loadCorePeopleAndLocations(onComplete) {
  return fetch("data/case.json").then(function (caseRes) {
    return caseRes.json().then(function (caseJson) {
      setCaseData(caseJson);

      return fetch("data/people.json").then(function (peopleRes) {
        return peopleRes.json().then(function (peopleJson) {
          setAllPeople(peopleJson);

          return fetch("data/locations.json").then(function (locationsRes) {
            return locationsRes.json().then(function (locationsJson) {
              setAllLocations(locationsJson);

              hideLoadingStep();
              if (onComplete) onComplete();
            });
          });
        });
      });
    });
  });
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
      // `filteredEvidence = allEvidence;` line. Fixed for Demo 2.
      setFilteredEvidenceList(getAllEvidence().slice());
      if (onComplete) onComplete();
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

export function loadTimelineData(onComplete) {
  return fetch("data/timeline.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      setAllTimeline(data);
      if (onComplete) onComplete();
    })
    .catch(function (err) {
      console.log("timeline load error", err);
    })
    .finally(function () {
      hideLoadingStep();
    });
}

export function applyStoredBookmarkFlags() {
  var evidence = getAllEvidence();
  var bookmarkedIds = getBookmarks();
  for (var i = 0; i < evidence.length; i++) {
    evidence[i].bookmarked = bookmarkedIds.indexOf(evidence[i].id) !== -1;
  }
}

// --- localStorage persistence -------------------------------------------

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(getBookmarks()));
}

export function loadBookmarksFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    var parsed = raw ? JSON.parse(raw) : [];
    setBookmarks(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    setBookmarks([]);
  }
}

export function saveNoteForEvidence(evidenceId, text) {
  var notes = getNotesStore();
  notes[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
}

export function loadNoteForEvidence(evidenceId) {
  return getNotesStore()[evidenceId] || "";
}

export function loadNotesFromStorage() {
  var raw = localStorage.getItem(STORAGE_KEY_NOTES);
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