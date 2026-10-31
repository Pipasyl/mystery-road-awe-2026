import { StrictMode } from "react"; // TEMPORARY (Demo 1): wrapper that double-calls components in dev
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router";
import { loadBookmarksFromStorage } from "./api";
// CHANGED: the 3 old loaders (core, evidence, timeline) are no longer imported.

// The ONE allowed place that touches the page directly: React needs a start element.
const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("#react-root not found in react.html");

const root = createRoot(rootElement);

// Still needed: the bookmarks live in localStorage, not in the backend,
// and BookmarkProvider reads them from state.ts on its first draw.
loadBookmarksFromStorage();

// CHANGED: the app is drawn right away. Before, we waited here until 3 loaders had
// finished (the "pending" counter and "Loading case data…"). Now every page fetches
// its own data from the backend inside a useEffect, so nothing has to wait.
// HashRouter must wrap the whole app so every component can read the URL.
// StrictMode (TEMPORARY, Demo 1) wraps everything so React double-calls each component.
root.render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
