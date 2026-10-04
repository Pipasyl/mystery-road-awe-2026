import { createRoot } from "react-dom/client";
import App from "./App";
import {
  loadBookmarksFromStorage,
  loadCorePeopleAndLocations,
  loadEvidenceData,
  loadTimelineData,
} from "./api";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("#react-root not found in react.html");

const root = createRoot(rootElement);

// Bookmarks must be loaded first: loadEvidenceData() uses them to set ev.bookmarked.
loadBookmarksFromStorage();

// Render React only after all 3 loads have finished, because React does not
// notice changes in state.ts by itself (placeholder, see Demo 10 question 1).
let pending = 3;
function onLoaded() {
  pending--;
  if (pending === 0) root.render(<App />);
}

void loadCorePeopleAndLocations(onLoaded);
loadEvidenceData(onLoaded);
void loadTimelineData(onLoaded);