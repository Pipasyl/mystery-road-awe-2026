// One note written by the investigator. It belongs to ONE evidence item.
export type Note = {
  id: string; // unique id of the note itself
  evidenceId: string; // which evidence item the note is about, e.g. "EV-003"
  text: string; // what the investigator wrote
};
