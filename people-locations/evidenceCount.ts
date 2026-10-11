import type { Person } from "../types";
import { evidenceMentionsPerson } from "../utils";
import { getAllEvidence } from "../state";

// Counts how many evidence items mention this person.
// Shared by PeopleList (all people) and PersonDetail (one person),
// so the counting rule exists in exactly one place.
export function countEvidenceForPerson(person: Person): number {
  return getAllEvidence().filter((ev) => evidenceMentionsPerson(ev, person)).length;
}
