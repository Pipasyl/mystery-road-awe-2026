import DashboardPage from "./dashboard/DashboardPage";
import { useState } from "react";
import Header from "./shell/Header";
import TimelinePage from "./timeline/TimelinePage";
import PeoplePage from "./people-locations/PeoplePage";

// 1. Define the valid routes based on the 5 vanilla views
export type View = "dashboard" | "evidence" | "people" | "timeline" | "workspace";

function EvidencePage() {
  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>
      <p>Stub: Evidence functionality coming in later exercises.</p>
    </section>
  );
}

function WorkspacePage() {
  return (
    <section className="view active">
      <h2>Investigator Workspace</h2>
      <p>Stub: Bookmarks and Hypothesis draft coming soon.</p>
    </section>
  );
}

// 4. Main App Container (Routing Skeleton)
export default function App() {
  // Manage the state of the router
  const [currentView, setCurrentView] = useState<View>("dashboard");

  // Determine which component to mount based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage onViewChange={setCurrentView} />;
      case "evidence":
        return <EvidencePage />;
      case "people":
        return <PeoplePage />;
      case "timeline":
        return <TimelinePage />;
      case "workspace":
        return <WorkspacePage />;
      default:
        return <DashboardPage onViewChange={setCurrentView} />;
    }
  };

  return (
    <>
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main id="app" className="app-main">
        {renderCurrentView()}
      </main>
    </>
  );
}
