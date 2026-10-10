// "import type" loads only the type (it is erased when the app runs).
// View is still defined in App.tsx, so we climb one folder up with "../".
import type { View } from "../App";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

// FEATURE-LEVEL shell component: the frame shown on every page
// (logo, title, navigation). The buttons are still driven by state in App.tsx
// until real routes arrive in Demo 8.
export default function Header({ currentView, onViewChange }: HeaderProps) {
  // Helper: adds the "active" class only to the button of the current view.
  const getNavClass = (view: View) => `nav-btn ${currentView === view ? "active" : ""}`;

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src="assets/logo/logo.svg" alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <button className={getNavClass("dashboard")} onClick={() => onViewChange("dashboard")}>
            Dashboard
          </button>
          <button className={getNavClass("evidence")} onClick={() => onViewChange("evidence")}>
            Evidence
          </button>
          <button className={getNavClass("people")} onClick={() => onViewChange("people")}>
            People & Locations
          </button>
          <button className={getNavClass("timeline")} onClick={() => onViewChange("timeline")}>
            Timeline
          </button>
          <button className={getNavClass("workspace")} onClick={() => onViewChange("workspace")}>
            Workspace
          </button>
        </nav>
      </div>
    </header>
  );
}
