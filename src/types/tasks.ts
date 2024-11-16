export interface TaskConfig {
  id: string;
  total: number;
  description: string;
  checkProgress: (
    note: number,
    octave: number,
    playedNotes: Set<string>
  ) => boolean;
}

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "press-any-notes": {
    id: "press-any-notes",
    total: 20,
    description: "Press any 20 notes on the piano",
    checkProgress: () => true, // Always increment
  },
  "play-all-c-notes": {
    id: "play-all-c-notes",
    total: 8,
    description: "Play all C notes using Z, X, C, V, B, N, M, comma keys",
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== 0) return false; // Only count C notes
      const noteKey = `${note}-${octave}`;
      if (playedNotes.has(noteKey)) return false; // Don't count repeats
      return true;
    },
  },
};
