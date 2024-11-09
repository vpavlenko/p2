export interface ChordProgression {
  id: string;
  label: string;
  chords: number[]; // Just the root numbers, scale mode determines major/minor
}

export const CHORD_PROGRESSIONS: ChordProgression[] = [
  {
    id: "basic",
    label: "1-6-4-5",
    chords: [0, 9, 5, 7], // C Am F G
  },
  {
    id: "pop",
    label: "6-4-1-5",
    chords: [9, 5, 0, 7], // Am F C G
  },
  {
    id: "jazz",
    label: "2-5-1",
    chords: [2, 7, 0], // Dm G C
  },
  {
    id: "blues",
    label: "1-4-1-5",
    chords: [0, 5, 0, 7], // C F C G
  },
];
