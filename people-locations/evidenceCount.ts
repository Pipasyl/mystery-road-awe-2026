import type { Evidence, Person } from "../types";
import { evidenceMentionsPerson } from "../utils";
// CHANGED: the import from "../state" is gone.

// Counts how many evidence items mention this person.
// CHANGED: the evidence list is now a PARAMETER. Before, this function took it from
// state.ts by itself. Now only the component that fetched it from the backend has it,
// so that component has to hand it in.
export function countEvidenceForPerson(person: Person, evidence: Evidence[]): number {
  return evidence.filter((ev) => evidenceMentionsPerson(ev, person)).length;
}
