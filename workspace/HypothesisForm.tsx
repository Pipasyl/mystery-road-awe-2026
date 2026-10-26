import React, { useState, useEffect } from "react";

// 1. Define the TypeScript shape so the red squiggles go away
interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
}

export function HypothesisForm() {
  // 2. Initialize the single state object for all fields
  const [draft, setDraft] = useState<HypothesisDraft>({
    suspectId: "",
    nature: "",
    evidenceIds: [],
    confidence: "50",
    explanation: "",
    alternative: "",
  });

  // 3. The universal change handler for all input types
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const name = target.name;

    // Handle the multi-select specifically
    if (target.type === "select-multiple") {
      const selectTarget = target as HTMLSelectElement;
      const selectedValues = Array.from(selectTarget.selectedOptions, (option) => option.value);
      setDraft((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setDraft((prev) => ({ ...prev, [name]: target.value }));
    }
  };

  // 4. Save to localStorage (Task 3)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("hypothesis_draft", JSON.stringify(draft));
    alert("Hypothesis saved to localStorage!");
  };

  return (
    <form onSubmit={handleSubmit} className="hypothesis-form">
      <h3>Hypothesis Workspace</h3>

      <label>Suspect:</label>
      <select name="suspectId" value={draft.suspectId} onChange={handleChange}>
        <option value="">Select a person...</option>
        <option value="p-1">Person 1</option>
        <option value="p-2">Person 2</option>
      </select>

      <label>Nature of involvement:</label>
      <select name="nature" value={draft.nature} onChange={handleChange}>
        <option value="">Select nature...</option>
        <option value="direct">Direct</option>
        <option value="indirect">Indirect</option>
      </select>

      <label>Supporting Evidence (Multi-select):</label>
      <select name="evidenceIds" multiple value={draft.evidenceIds} onChange={handleChange}>
        <option value="ev-1">EV-1</option>
        <option value="ev-2">EV-2</option>
      </select>

      <label>Confidence Level: {draft.confidence}%</label>
      <input
        type="range"
        name="confidence"
        min="0"
        max="100"
        value={draft.confidence}
        onChange={handleChange}
      />

      <label>Explanation:</label>
      <textarea name="explanation" value={draft.explanation} onChange={handleChange} />

      <label>Alternative explanation:</label>
      <textarea name="alternative" value={draft.alternative} onChange={handleChange} />

      <button type="submit" className="btn btn-primary">
        Save hypothesis draft
      </button>
    </form>
  );
}
