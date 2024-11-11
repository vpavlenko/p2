export type Voicing = "single" | "fifth" | "major" | "diatonic";

export interface VoicingConfig {
  label: string;
  getNotes: (
    baseNote: number,
    baseOctave: number,
    scale?: "major" | "minor"
  ) => Array<{ note: number; octave: number }>;
}

export const VOICINGS: Record<Voicing, VoicingConfig> = {
  single: {
    label: "1",
    getNotes: (note, octave) => [{ note, octave }],
  },
  fifth: {
    label: "5",
    getNotes: (note, octave) => [
      { note, octave },
      { note: (note + 7) % 12, octave: note + 7 >= 12 ? octave + 1 : octave },
    ],
  },
  major: {
    label: "M",
    getNotes: (note, octave) => [
      { note, octave },
      { note: (note + 4) % 12, octave: note + 4 >= 12 ? octave + 1 : octave },
      { note: (note + 7) % 12, octave: note + 7 >= 12 ? octave + 1 : octave },
    ],
  },
  diatonic: {
    label: "d",
    getNotes: (note, octave, scale = "major") => {
      // Define scale intervals
      const scaleIntervals =
        scale === "major"
          ? [0, 2, 4, 5, 7, 9, 11] // Major scale
          : [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale

      // Find which scale degree we're on (0-6)
      const scaleDegree = scaleIntervals.findIndex(
        (interval) => note % 12 === interval
      );

      if (scaleDegree === -1) return [{ note, octave }]; // Not in scale, return single note

      // Build triad by walking up the scale in thirds
      const getScaleNote = (degree: number) => {
        const normalizedDegree = degree % 7; // Wrap around to stay in scale
        return scaleIntervals[normalizedDegree];
      };

      // Root, third (root + 2 steps), fifth (root + 4 steps)
      const chordDegrees = [
        scaleDegree,
        (scaleDegree + 2) % 7,
        (scaleDegree + 4) % 7,
      ];

      return chordDegrees.map((degree) => {
        const newNote = getScaleNote(degree);
        const interval = newNote - note;
        const adjustedInterval = interval < 0 ? interval + 12 : interval;
        return {
          note: (note + adjustedInterval) % 12,
          octave: note + adjustedInterval >= 12 ? octave + 1 : octave,
        };
      });
    },
  },
};
