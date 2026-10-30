import { useEffect, useState } from "react";

// TEMPORARY (Demo 2 – Task 1): throwaway component to watch how often effects run.
// Deleted again after the demo.
export default function EffectLab() {
  const [count, setCount] = useState(0); // the value effect C depends on
  const [other, setOther] = useState(0); // a second value that effect C does NOT depend on

  // Effect A: NO dependency array -> runs after EVERY render.
  useEffect(() => {
    console.log("A (no array) ran");
  });

  // Effect B: EMPTY array -> runs after the first render only.
  useEffect(() => {
    console.log("B ([]) ran");
  }, []);

  // Effect C: array with [count] -> runs after the first render,
  // and again only when count has changed since the last render.
  useEffect(() => {
    console.log("C ([count]) ran, count =", count);
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>count + 1 (now {count})</button>
      <button onClick={() => setOther(other + 1)}>other + 1 (now {other})</button>
    </div>
  );
}
