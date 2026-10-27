import { createContext, useContext } from "react";

// What every component below the Provider can read.
export type BookmarkContextValue = {
  bookmarkedIds: string[]; // the one list of bookmarked evidence ids
  toggleBookmark: (evidenceId: string) => void; // the one function that changes it
};

// The Context itself. null = "no Provider above me" (a mistake we want to catch).
export const BookmarkContext = createContext<BookmarkContextValue | null>(null);

// Hook = the short way to read the Context. Components call useBookmarks().
export function useBookmarks(): BookmarkContextValue {
  const value = useContext(BookmarkContext);
  if (value === null) {
    throw new Error("useBookmarks must be used inside <BookmarkProvider>");
  }
  return value;
}
