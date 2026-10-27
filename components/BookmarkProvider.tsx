import { useState, type ReactNode } from "react";
import { saveBookmarksToStorage } from "../api";
import { toggleId } from "../evidence/toggleId";
import { getBookmarks, setBookmarks } from "../state";
import { BookmarkContext } from "./BookmarkContext";

// The Provider OWNS the bookmark state (moved here from App).
// Everything inside {children} can read it with useBookmarks().
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  function toggleBookmark(evidenceId: string) {
    const next = toggleId(bookmarkedIds, evidenceId);

    // Immutability check (development only): the result must be a NEW array.
    if (import.meta.env.DEV && next === bookmarkedIds) {
      console.error("toggleId returned the same array: bookmarks were mutated!");
    }

    setBookmarkedIds(next); // tells React: draw again, every consumer gets the new list
    setBookmarks(next); // keeps state.ts in sync, so the saving code sees the new list
    saveBookmarksToStorage(); // saves to localStorage (same as before)
  }

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}
