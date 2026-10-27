import ViewSection from "../components/ViewSection";
import { getAllEvidence } from "../state";
import { HypothesisForm } from "./HypothesisForm";

// NEW: the bookmark list comes from App (lifted state)
export function WorkspacePage({ bookmarkedIds }: { bookmarkedIds: string[] }) {
  // Bookmarked items = full evidence list filtered by the bookmark ids
  const bookmarkedEvidence = getAllEvidence().filter((ev) => bookmarkedIds.includes(ev.id));

  return (
    <ViewSection title="Investigator Workspace">
      <div className="workspace-grid">
        <div className="workspace-col">
          <h3>Bookmarked Evidence</h3>
          <div className="bookmarks-list">
            {bookmarkedEvidence.length === 0 ? (
              <p>No bookmarked evidence yet.</p>
            ) : (
              bookmarkedEvidence.map((ev) => (
                <div key={ev.id}>
                  {ev.id} · {ev.title}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="workspace-col">
          <h3>Personal Notes</h3>
          <p className="hint-text">
            Notes are attached to whichever evidence item is currently open in the Evidence view.
          </p>
          <div className="notes-list"></div>
        </div>
      </div>

      <HypothesisForm />
    </ViewSection>
  );
}
