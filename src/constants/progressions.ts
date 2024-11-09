export interface ChordProgression {
  id: string;
  label: string;
  chords: Array<{
    root: number; // 0-11 representing C through B
    type: "major" | "minor";
  }>;
}

export const CHORD_PROGRESSIONS: ChordProgression[] = [
  {
    id: "basic",
    label: "I-vi-IV-V",
    chords: [
      { root: 0, type: "major" }, // C
      { root: 9, type: "minor" }, // Am
      { root: 5, type: "major" }, // F
      { root: 7, type: "major" }, // G
    ],
  },
  {
    id: "pop",
    label: "vi-IV-I-V",
    chords: [
      { root: 9, type: "minor" }, // Am
      { root: 5, type: "major" }, // F
      { root: 0, type: "major" }, // C
      { root: 7, type: "major" }, // G
    ],
  },
  {
    id: "jazz",
    label: "ii-V-I",
    chords: [
      { root: 2, type: "minor" }, // Dm
      { root: 7, type: "major" }, // G
      { root: 0, type: "major" }, // C
    ],
  },
  {
    id: "blues",
    label: "I-IV-I-V",
    chords: [
      { root: 0, type: "major" }, // C
      { root: 5, type: "major" }, // F
      { root: 0, type: "major" }, // C
      { root: 7, type: "major" }, // G
    ],
  },
];
