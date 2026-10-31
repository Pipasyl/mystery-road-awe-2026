import { useEffect, useState } from "react"; // CHANGED: + useEffect, useState
import { useBookmarks } from "../components/BookmarkContext";
import ViewSection from "../components/ViewSection";
import type { Evidence } from "../types"; // CHANGED: type instead of state.ts
import { HypothesisForm } from "./HypothesisForm";
import type { Note } from "./Note";
// CHANGED: the import from "../state" is gone.

type WorkspacePageProps = {
  notes: Note[];
};

export function WorkspacePage({ notes }: WorkspacePageProps) {
  const { bookmarkedIds } = useBookmarks();

  // NEW: a box for the evidence, empty until the backend answers.
  const [evidence, setEvidence] = useState<Evidence[]>([]);

  // NEW: runs once after the first draw ([]). It asks the backend for the evidence.
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/evidence");
      setEvidence((await res.json()) as Evidence[]); // saving in state = React draws again
    }
    void load();
  }, []);

  // Bookmarked items = full evidence list filtered by the bookmark ids
  const bookmarkedEvidence = evidence.filter((ev) => bookmarkedIds.includes(ev.id));

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
