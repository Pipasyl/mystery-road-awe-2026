import { useState } from "react";
import type { Person } from "../types";
import { getAllPeople } from "../state";

// THROWAWAY: only for the Demo 4 task. Deleted before the commit.
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
                {/* GOOD: key is the person's stable id, so React knows who is who */}
                {people.map((person) => (
                    <li key={person.id}>
                        {person.name}: <input type="text" placeholder="type a note" />
                    </li>
                ))}
            </ul>
        </div>
    );
}