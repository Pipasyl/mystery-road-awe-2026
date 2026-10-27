import { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import DashboardPage from "./dashboard/DashboardPage";
import Header from "./shell/Header";
import ViewSection from "./components/ViewSection";
import { BookmarkProvider } from "./components/BookmarkProvider"; // NEW
import PeoplePage from "./people-locations/PeoplePage";
import PeopleTab from "./people-locations/PeopleTab";
import LocationsTab from "./people-locations/LocationsTab";
import PersonDetail from "./people-locations/PersonDetail";
import TimelinePage from "./timeline/TimelinePage";
import { EvidenceCatalogue } from "./evidence/EvidenceCatalogue";
import { WorkspacePage } from "./workspace/WorkspacePage";
import type { Note } from "./workspace/Note";
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

  // CHANGED: the bookmark state is gone from App, it now lives in <BookmarkProvider>.

  // Notes stay as lifted state + props on purpose (compare with bookmarks for Demo 8 Task 2).
  const [notes, setNotes] = useState<Note[]>([]);

  // Callback passed down to the evidence cards. It builds a new note and adds it.
  // [...old, newNote] makes a NEW array (immutable update), we never use .push().
  function handleAddNote(evidenceId: string, text: string) {
    const newNote: Note = { id: Date.now().toString(), evidenceId, text };
    setNotes((old) => [...old, newNote]);
  }

  // Called by Header and DashboardPage with a view word: we turn it into a navigation.
  const handleViewChange = (view: View) => navigate(PATHS[view]);

  return (
    <>
      <Header currentView={viewFromPath(location.pathname)} onViewChange={handleViewChange} />
      <main id="app" className="app-main">
        {/* NEW: every page inside the Provider can read the bookmarks with useBookmarks(). */}
        <BookmarkProvider>
          {/* The router picks the first route whose path fits the address. */}
          <Routes>
            <Route path="/" element={<DashboardPage onViewChange={handleViewChange} />} />
            <Route path="/evidence" element={<EvidenceCatalogue onAddNote={handleAddNote} />} />
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
            <Route path="/workspace" element={<WorkspacePage notes={notes} />} />
            {/* "*" matches everything that no route above matched. */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BookmarkProvider>
      </main>
    </>
  );
}
