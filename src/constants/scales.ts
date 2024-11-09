export type ScaleMode = "major" | "minor";

export interface ScaleModeConfig {
  label: string;
  intervals: number[];
}

export const SCALE_MODES: Record<ScaleMode, ScaleModeConfig> = {
  major: {
    label: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    label: "Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
};

export const isNoteInScale = (
  note: number,
  tonic: number,
  mode: ScaleMode
): boolean => {
  const relativeNote = (note - tonic + 12) % 12;
  return SCALE_MODES[mode].intervals.includes(relativeNote);
};
