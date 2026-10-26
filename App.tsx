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
import { WorkspacePage } from "./workspace/WorkspacePage";
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

  // Called by Header and DashboardPage with a view word: we turn it into a navigation.
  const handleViewChange = (view: View) => navigate(PATHS[view]);

  return (
    <>
      <Header currentView={viewFromPath(location.pathname)} onViewChange={handleViewChange} />
      <main id="app" className="app-main">
        {/* The router picks the first route whose path fits the address. */}
        <Routes>
          <Route path="/" element={<DashboardPage onViewChange={handleViewChange} />} />
          <Route path="/evidence" element={<EvidenceCatalogue />} />
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
          <Route path="/workspace" element={<WorkspacePage />} />
          {/* "*" matches everything that no route above matched. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
