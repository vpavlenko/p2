export interface ChordProgression {
  chords: number[];
}

export const CHORD_PROGRESSIONS: ChordProgression[] = [
  {
    chords: [0, 9, 5, 7], // C Am F G
  },
  {
    chords: [9, 5, 0, 7], // Am F C G
  },
  {
    chords: [2, 7, 0], // Dm G C
  },
  {
    chords: [0, 5, 0, 7], // C F C G
  },
];
