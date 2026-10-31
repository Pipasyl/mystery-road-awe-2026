import { useEffect, useState } from "react";
import type { Person } from "../types";

// THROWAWAY lab (like CleanupLab): it only exists to show a request race and its fix.
export default function RaceLab() {
  const [delay, setDelay] = useState(0);
  const [shown, setShown] = useState("nothing yet");

  useEffect(() => {
    // NEW: one controller for THIS run of the effect. It cancels only this request.
    const controller = new AbortController();
    console.log(`REQUEST sent (backend waits ${delay} ms)`);

    async function load() {
      try {
        // NEW: the signal connects the controller to this request.
        const res = await fetch(`/api/people?delay=${delay}`, { signal: controller.signal });
        const data = (await res.json()) as Person[];
        console.log(`ANSWER arrived (from the ${delay} ms request)`);
        setShown(`answer of the ${delay} ms request (${data.length} people)`);
      } catch (err) {
        // NEW: abort() makes fetch throw an error called "AbortError".
        // That is not a real problem, so we only log it and do NOT show an error.
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log(`ABORTED (the ${delay} ms request was cancelled)`);
          return;
        }
        console.error("Real error", err);
      }
    }
    void load();

    // NEW: the cleanup. React calls it before the effect runs again (delay changed)
    // and when the component is removed. Here it cancels the request that is still waiting.
    return () => {
      console.log(`CLEANUP: abort the ${delay} ms request`);
      controller.abort();
    };
  }, [delay]);

  return (
    <div>
      <button onClick={() => setDelay(3000)}>Slow request (3000 ms)</button>
      <button onClick={() => setDelay(0)}>Fast request (0 ms)</button>
      <p>Last button clicked: {delay} ms</p>
      <p>Screen shows: {shown}</p>
    </div>
  );
}
