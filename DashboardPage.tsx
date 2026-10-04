import { Badge, Button, StatCard } from "./UI";
import type { CaseData } from "./types";
import type { View } from "./App";
import { formatDate, getStatusBadgeClass } from "./utils";
import {
  getAllEvidence,
  getCaseData,
  getAllPeople,
  getAllLocations,
  getBookmarks,
  getAllTimeline,
} from "./state";

interface ViewChangeProps {
  onViewChange: (view: View) => void;
}

function IntroCard({ onViewChange }: ViewChangeProps) {
  return (
    <div className="intro-card">
      <h3>How to use this portal</h3>
      <p>
        Everything gathered on the case so far is organised into four working views. Use the
        navigation bar at the top to move between them at any time.
      </p>
      <div className="howto-grid">
        <div className="howto-item">
          <h4>1. Evidence Catalogue</h4>
          <p>
            Search, filter, and sort every evidence item. Open one for full details, related people
            and locations, and to add a private note.
          </p>
          <Button onClick={() => onViewChange("evidence")}>Go to Evidence</Button>
        </div>
        <div className="howto-item">
          <h4>2. People &amp; Locations</h4>
          <p>
            Read profiles and statements from the six team members involved, and look up the six
            key locations in the investigation.
          </p>
          <Button onClick={() => onViewChange("people")}>Go to People &amp; Locations</Button>
        </div>
        <div className="howto-item">
          <h4>3. Timeline</h4>
          <p>
            Walk through events in chronological order, filter by person, location, or type, and
            jump straight to the evidence behind any event.
          </p>
          <Button onClick={() => onViewChange("timeline")}>Go to Timeline</Button>
        </div>
        <div className="howto-item">
          <h4>4. Investigator Workspace</h4>
          <p>
            Your bookmarked evidence and notes collect here. Draft a hypothesis: who you suspect,
            why, and how confident you are. It's saved automatically in your browser.
          </p>
          <Button onClick={() => onViewChange("workspace")}>Go to Workspace</Button>
        </div>
      </div>
    </div>
  );
}

function CaseSummaryCard({ caseData }: { caseData: Partial<CaseData> }) {
  return (
    <div className="case-summary-card">
      <h3>{caseData.title || "Case"}</h3>
      <p>
        <Badge variant="flagged">{(caseData.status || "unknown").toUpperCase()}</Badge>
      </p>
      <p>{caseData.summary || ""}</p>
    </div>
  );
}

function ReviewProgress({ percentage }: { percentage: number }) {
  return (
    <div className="dashboard-panel">
      <h3>Review progress</h3>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percentage}%` }}></div>
      </div>
      <p>{percentage}% of evidence reviewed</p>
    </div>
  );
}

export default function DashboardPage({ onViewChange }: ViewChangeProps) {
  const allEvidence = getAllEvidence();
  const caseData = getCaseData();

  const reviewedCount = allEvidence.filter(
    (ev) => (ev.status || "").toLowerCase() === "reviewed",
  ).length;
  const progressPct =
    allEvidence.length === 0 ? 0 : Math.round((reviewedCount / allEvidence.length) * 100);

  const recentEvidence = allEvidence.slice(-5).reverse();
  const recentTimeline = getAllTimeline().slice(-5).reverse();

  return (
    <section id="view-dashboard" className="view active">
      <h2>Case Dashboard</h2>
      <IntroCard onViewChange={onViewChange} />
      <CaseSummaryCard caseData={caseData} />
      <div className="stat-grid">
        <StatCard value={allEvidence.length} label="Evidence items" />
        <StatCard value={getAllPeople().length} label="People" />
        <StatCard value={getAllLocations().length} label="Locations" />
        <StatCard value={getBookmarks().length} label="Bookmarked" />
        <StatCard value={reviewedCount} label="Reviewed" />
      </div>
      <ReviewProgress percentage={progressPct} />
      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <h3>Recent evidence</h3>
          {recentEvidence.length === 0 ? (
            <p>No evidence loaded yet.</p>
          ) : (
            recentEvidence.map((ev) => (
              <div key={ev.id} className="mini-list-item">
                <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
                <Badge variant={getStatusBadgeClass(ev.status).replace("badge-", "")}>
                  {ev.status}
                </Badge>
              </div>
            ))
          )}
        </div>
        <div className="dashboard-panel">
          <h3>Recent timeline events</h3>
          {recentTimeline.length === 0 ? (
            <p>No timeline events loaded yet.</p>
          ) : (
            recentTimeline.map((evt) => (
              <div key={evt.id} className="mini-list-item">
                <strong>{formatDate(evt.time)}</strong>
                <br />
                {evt.title}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}