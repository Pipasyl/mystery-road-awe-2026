import ViewSection from "../components/ViewSection";
import { getAllEvidence } from "../state";
import { HypothesisForm } from "./HypothesisForm";
import type { Note } from "./Note"; // NEW

// The bookmark list and the notes list come from App (lifted state).
type WorkspacePageProps = {
  bookmarkedIds: string[];
  notes: Note[]; // NEW
};

export function WorkspacePage({ bookmarkedIds, notes }: WorkspacePageProps) {
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
          <p className="hint-text">Notes are added with the form on each evidence card.</p>
          {/* NEW: the notes list is drawn straight from the `notes` prop */}
          <div className="notes-list">
            {notes.length === 0 ? (
              <p>No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id}>
                  {note.evidenceId} · {note.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <HypothesisForm />
    </ViewSection>
  );
}
