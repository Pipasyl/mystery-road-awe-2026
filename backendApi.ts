import type { CaseData, CaseLocation, Evidence, Person, TimelineEvent } from "./types";

// THEORY: this file is the ONLY place that knows the backend's addresses and answer shapes.
// It does not know about React, loading screens or errors on the page.

// One helper for every request. The signal lets the caller cancel (Demo 7).
async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  // Demo 6: fetch does NOT throw for a 500, so we throw ourselves.
  if (!res.ok) throw new Error(`Server answered ${res.status} for ${url}`);
  return (await res.json()) as T;
}

// One small function per backend address. Components and the hook only use these names.
export const getCase = (signal?: AbortSignal) => getJson<CaseData>("/api/case", signal);
export const getPeople = (signal?: AbortSignal) => getJson<Person[]>("/api/people", signal);
export const getLocations = (signal?: AbortSignal) =>
  getJson<CaseLocation[]>("/api/locations", signal);
export const getEvidence = (signal?: AbortSignal) => getJson<Evidence[]>("/api/evidence", signal);
export const getTimeline = (signal?: AbortSignal) =>
  getJson<TimelineEvent[]>("/api/timeline", signal);
