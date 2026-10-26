import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { STORAGE_KEY_HYPOTHESIS, getAllEvidence, getAllPeople } from "../state";

interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt?: string;
}

export function HypothesisForm() {
  const people = getAllPeople();
  const evidence = getAllEvidence();

  // One state object for all 6 form fields. Every input shows its value from here.
  const [draft, setDraft] = useState<Omit<HypothesisDraft, "savedAt">>({
    suspectId: "",
    nature: "",
    evidenceIds: [],
    confidence: "50",
    explanation: "",
    alternative: "",
  });

  // Controls the small "Saved" message
  const [showSaved, setShowSaved] = useState(false);

  // One handler for all inputs: the input's name attribute says which field to update.
  // The multi-select returns an array of the selected option values, all others a string.
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLSelectElement && target.multiple
        ? Array.from(target.selectedOptions, (option) => option.value)
        : target.value;
    // New object every time, the old draft is never edited
    setDraft((prev) => ({ ...prev, [target.name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stops the browser from reloading the page
    const toSave: HypothesisDraft = { ...draft, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(toSave));
    } catch (err) {
      console.error("Could not save hypothesis draft", err);
      alert("Your hypothesis could not be saved to local storage.");
      return;
    }
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form id="hypothesisForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="hypSuspect">Suspected responsible person</label>
          <select id="hypSuspect" name="suspectId" value={draft.suspectId} onChange={handleChange}>
            <option value="">Select a person…</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypNature">Accidental or deliberate incident</label>
          <select id="hypNature" name="nature" value={draft.nature} onChange={handleChange}>
            <option value="">Select…</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidence">Selected supporting evidence</label>
          <select
            id="hypEvidence"
            name="evidenceIds"
            multiple
            size={6}
            value={draft.evidenceIds}
            onChange={handleChange}
          >
            {evidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} – {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypConfidence">Confidence (0–100)</label>
          <input
            type="range"
            id="hypConfidence"
            name="confidence"
            min="0"
            max="100"
            value={draft.confidence}
            onChange={handleChange}
          />
          <output id="hypConfidenceValue">{draft.confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanation">Written explanation</label>
          <textarea
            id="hypExplanation"
            name="explanation"
            rows={4}
            placeholder="Explain your reasoning…"
            value={draft.explanation}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternative">Alternative explanation</label>
          <textarea
            id="hypAlternative"
            name="alternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={draft.alternative}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          <span className={"saved-msg " + (showSaved ? "" : "hidden")}>Saved</span>
        </div>
      </form>
    </div>
  );
}
