import { useBookmarks } from "../components/BookmarkContext"; // NEW
import ViewSection from "../components/ViewSection";
import { getAllEvidence } from "../state";
import { HypothesisForm } from "./HypothesisForm";
import type { Note } from "./Note";

// CHANGED: bookmarkedIds is no longer a prop, it comes from Context. Notes are still a prop.
type WorkspacePageProps = {
  notes: Note[];
};

export function WorkspacePage({ notes }: WorkspacePageProps) {
  const { bookmarkedIds } = useBookmarks(); // NEW: read the bookmark list from Context

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
          {/* The notes list is drawn straight from the `notes` prop */}
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
