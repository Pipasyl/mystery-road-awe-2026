import { useState } from 'react';

// 1. Define the valid routes based on the 5 vanilla views
type View = 'dashboard' | 'evidence' | 'people' | 'timeline' | 'workspace';

// 2. Header & Navigation Component
interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

function Header({ currentView, onViewChange }: HeaderProps) {
  // Helper to apply an 'active' class to the currently selected tab
  const getNavClass = (view: View) => 
    `nav-btn ${currentView === view ? 'active' : ''}`;

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src="assets/logo/logo.svg" alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">Investigate the failure of an AI-assisted rehabilitation robot.</p>
          </div>
        </div>
        
        <nav className="main-nav" aria-label="Main navigation">
          <button 
            className={getNavClass('dashboard')} 
            onClick={() => onViewChange('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={getNavClass('evidence')} 
            onClick={() => onViewChange('evidence')}
          >
            Evidence
          </button>
          <button 
            className={getNavClass('people')} 
            onClick={() => onViewChange('people')}
          >
            People & Locations
          </button>
          <button 
            className={getNavClass('timeline')} 
            onClick={() => onViewChange('timeline')}
          >
            Timeline
          </button>
          <button 
            className={getNavClass('workspace')} 
            onClick={() => onViewChange('workspace')}
          >
            Workspace
          </button>
        </nav>
      </div>
    </header>
  );
}

// 3. Page Stubs
function DashboardPage() {
  return (
    <section className="view active">
      <h2>Case Dashboard</h2>
      <p>Dashboard content will be built here during this exercise.</p>
    </section>
  );
}

function EvidencePage() {
  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>
      <p>Stub: Evidence functionality coming in later exercises.</p>
    </section>
  );
}

function PeoplePage() {
  return (
    <section className="view active">
      <h2>People & Locations</h2>
      <p>Stub: Profiles and maps coming soon.</p>
    </section>
  );
}

function TimelinePage() {
  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <p>Stub: Chronological events coming soon.</p>
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
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Determine which component to mount based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardPage />;
      case 'evidence': return <EvidencePage />;
      case 'people': return <PeoplePage />;
      case 'timeline': return <TimelinePage />;
      case 'workspace': return <WorkspacePage />;
      default: return <DashboardPage />;
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