import { StrictMode } from "react"; // TEMPORARY (Demo 1): wrapper that double-calls components in dev
import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router";
import {
  loadBookmarksFromStorage,
  loadCorePeopleAndLocations,
  loadEvidenceData,
  loadTimelineData,
} from "./api";

// The ONE allowed place that touches the page directly: React needs a start element.
const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("#react-root not found in react.html");

const root = createRoot(rootElement);

// NEW: shown by React while the data loads. It replaces the old hand-made overlay
// (getElementById + classList) that used to live in api.ts.
root.render(<p>Loading case data…</p>);

// Bookmarks must be loaded first: loadEvidenceData() uses them to set ev.bookmarked.
loadBookmarksFromStorage();

// Render the real app only after all 3 loads have finished, because React does not
// notice changes in state.ts by itself (placeholder, see Demo 10 question 1).
let pending = 3;
function onLoaded() {
  pending--;
  // HashRouter must wrap the whole app so every component can read the URL.
  // StrictMode (TEMPORARY, Demo 1) wraps everything so React double-calls each component.
  if (pending === 0)
    root.render(
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>,
    );
}

void loadCorePeopleAndLocations(onLoaded);
loadEvidenceData(onLoaded);
void loadTimelineData(onLoaded);
