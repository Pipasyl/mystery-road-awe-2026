import { useState } from "react";
import type { Person } from "../types";
import { getAllPeople } from "../state";

// DEMO FILE for the presentation (Exercise 4, Demo 4).
// NOT used by the real app: it uses useState, which is out of scope for Exercise 4.
// To show it live: import it in App.tsx and add <KeyDemo /> inside PeoplePage.
//
// To switch versions: comment out the active <li ...> line and the
// matching .map line, and un-comment the other pair.
export default function KeyDemo() {
  // .slice(0, 3) takes a COPY of the first 3 people, so state.ts is never changed.
  const [people, setPeople] = useState<Person[]>(getAllPeople().slice(0, 3));

  return (
    <div>
      {/* [...people] copies the list, .reverse() turns the copy around */}
      <button type="button" onClick={() => setPeople([...people].reverse())}>
        Reverse order
      </button>
      <ul>
        {/* ---------- BAD: key = position ----------
            Type text in the boxes, click Reverse: the text stays at its
            position and ends up next to a different person.
        {people.map((person, index) => (
          <li key={index}>
        */}

        {/* ---------- GOOD: key = stable id (ACTIVE) ----------
            The text follows its person when the list is reversed. */}
        {people.map((person) => (
          <li key={person.id}>
            {person.name}: <input type="text" placeholder="type a note" />
          </li>
        ))}
      </ul>
    </div>
  );
}