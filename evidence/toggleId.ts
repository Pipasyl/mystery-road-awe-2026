// Adds the id if it is missing, removes it if it is present.
// Returns a NEW array every time. The array that is passed in is never changed.
export function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
