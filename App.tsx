import { useState } from "react"; // NEW: for the bookmark state
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import DashboardPage from "./dashboard/DashboardPage";
import Header from "./shell/Header";
import ViewSection from "./components/ViewSection";
import PeoplePage from "./people-locations/PeoplePage";
import PeopleTab from "./people-locations/PeopleTab";
import LocationsTab from "./people-locations/LocationsTab";
import PersonDetail from "./people-locations/PersonDetail";
import TimelinePage from "./timeline/TimelinePage";
import { EvidenceCatalogue } from "./evidence/EvidenceCatalogue";
import { toggleId } from "./evidence/toggleId"; // NEW: moved here from EvidenceCatalogue
import { WorkspacePage } from "./workspace/WorkspacePage";
import { saveBookmarksToStorage } from "./api"; // NEW: moved here from EvidenceCatalogue
import { getBookmarks, setBookmarks } from "./state"; // NEW: moved here from EvidenceCatalogue
// The 5 views of the app (still used by Header and DashboardPage).
export type View = "dashboard" | "evidence" | "people" | "timeline" | "workspace";

// One address per view. This is the only place that knows the URLs.
const PATHS: Record<View, string> = {
  dashboard: "/",
  evidence: "/evidence",
  people: "/team/people",
  timeline: "/timeline",
  workspace: "/workspace",
};

// Reverse direction: address -> view word (so Header can mark the active button).
function viewFromPath(pathname: string): View {
  if (pathname.startsWith("/team")) return "people";
  if (pathname.startsWith("/timeline")) return "timeline";
  if (pathname.startsWith("/evidence")) return "evidence";
  if (pathname.startsWith("/workspace")) return "workspace";
  return "dashboard";
}

// Shown when the address matches no route.
function NotFoundPage() {
  return (
    <ViewSection title="Page not found">
      <p>This address does not exist.</p>
    </ViewSection>
  );
}

export default function App() {
  const navigate = useNavigate(); // function: changes the address
  const location = useLocation(); // object: knows the current address

  // NEW: LIFTED STATE. The ONE place where the bookmark list lives.
  // App is the lowest component that contains Dashboard, Evidence and Workspace.
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  // NEW: the only function that changes the bookmarks. It is passed down to Evidence.
  function handleToggleBookmark(evidenceId: string) {
    const next = toggleId(bookmarkedIds, evidenceId);

    // Immutability check (development only): the result must be a NEW array.
    if (import.meta.env.DEV && next === bookmarkedIds) {
      console.error("toggleId returned the same array: bookmarks were mutated!");
    }

    setBookmarkedIds(next); // tells React: draw again, all pages get the new list
    setBookmarks(next); // keeps state.ts in sync, so the saving code sees the new list
    saveBookmarksToStorage(); // saves to localStorage (same as before)
  }

  // Called by Header and DashboardPage with a view word: we turn it into a navigation.
  const handleViewChange = (view: View) => navigate(PATHS[view]);

  return (
    <>
      <Header currentView={viewFromPath(location.pathname)} onViewChange={handleViewChange} />
      <main id="app" className="app-main">
        {/* The router picks the first route whose path fits the address. */}
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage onViewChange={handleViewChange} bookmarkedIds={bookmarkedIds} />
            }
          />
          <Route
            path="/evidence"
            element={
              <EvidenceCatalogue
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
              />
            }
          />
          {/* Parent route: PeoplePage is the frame, children go into its <Outlet />. */}
          <Route path="/team" element={<PeoplePage />}>
            {/* "/team" alone redirects to the people tab. replace = no extra Back-button entry. */}
            <Route index element={<Navigate to="/team/people" replace />} />
            <Route path="people" element={<PeopleTab />} />
            <Route path="locations" element={<LocationsTab />} />
            {/* :personId is a variable part: one route handles every person. */}
            <Route path="people/:personId" element={<PersonDetail />} />
          </Route>
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/workspace" element={<WorkspacePage bookmarkedIds={bookmarkedIds} />} />
          {/* "*" matches everything that no route above matched. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
