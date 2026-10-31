import { useEffect, useState } from "react";

// The 3 situations of a request (same idea as in Demo 6).
export type FetchStatus = "loading" | "error" | "success";

// THEORY: a custom hook is a function whose name starts with "use" and that calls
// other hooks (useState, useEffect) inside. <T> = "the kind of data we expect",
// so every page gets the right type back (Person[], Evidence[], ...).
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null); // null = nothing arrived yet
  const [status, setStatus] = useState<FetchStatus>("loading");

  useEffect(() => {
    // Demo 7: one controller per effect run, so an old request can never set state.
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(url, { signal: controller.signal });
        // Demo 6: fetch does NOT throw for a 500, so we check res.ok ourselves.
        if (!res.ok) throw new Error(`Server answered ${res.status}`);
        setData((await res.json()) as T);
        setStatus("success");
      } catch (err) {
        // A cancelled request is not a real error: ignore it quietly.
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(`Could not load ${url}`, err);
        setStatus("error"); // the error path ALSO sets the status
      }
    }
    void load();

    // Demo 7: cleanup cancels the request that is still waiting.
    return () => controller.abort();
  }, [url]); // runs again if the address changes

  // The page gets the data and the status back and decides what to draw.
  return { data, status };
}
