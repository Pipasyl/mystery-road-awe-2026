import { useState, type ReactNode } from "react";
import { saveBookmarksToStorage } from "../api";
import { toggleId } from "../evidence/toggleId";
import { getBookmarks } from "../state"; // CHANGED: setBookmarks is not needed any more
import { BookmarkContext } from "./BookmarkContext";

// The Provider OWNS the bookmark state.
// getBookmarks() is only used ONCE here, to get the starting list loaded from localStorage.
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarks());

  function toggleBookmark(evidenceId: string) {
    const next = toggleId(bookmarkedIds, evidenceId);

    // Immutability check (development only): the result must be a NEW array.
    if (import.meta.env.DEV && next === bookmarkedIds) {
      console.error("toggleId returned the same array: bookmarks were mutated!");
    }

    setBookmarkedIds(next); // React state is the ONE truth
    saveBookmarksToStorage(next); // CHANGED: save the new list directly, no copy in state.ts
  }

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}
