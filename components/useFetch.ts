import { useEffect, useState } from "react";

// The 3 situations of a request (same idea as in Demo 6).
export type FetchStatus = "loading" | "error" | "success";

// CHANGED: the input is a FUNCTION from backendApi.ts (for example getPeople), not a URL.
// The hook no longer knows any address. <T> is worked out from the function,
// so the call sites do not need to write the type any more.
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null); // null = nothing arrived yet
  const [status, setStatus] = useState<FetchStatus>("loading");

  useEffect(() => {
    // Demo 7: one controller per effect run, so an old request can never set state.
    const controller = new AbortController();

    async function load() {
      try {
        // CHANGED: we call the API function and hand it the signal.
        setData(await fetcher(controller.signal));
        setStatus("success");
      } catch (err) {
        // A cancelled request is not a real error: ignore it quietly.
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Could not load data", err);
        setStatus("error"); // the error path ALSO sets the status
      }
    }
    void load();

    // Demo 7: cleanup cancels the request that is still waiting.
    return () => controller.abort();
  }, [fetcher]); // the API functions never change, so this still runs once

  return { data, status };
}
