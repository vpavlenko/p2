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
    description: "Press 20 different notes on the piano",
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      const noteKey = `${note}-${octave}`;
      if (playedNotes.has(noteKey)) return false;
      playedNotes.add(noteKey);
      return true;
    },
  },
  "play-all-c-notes": {
    id: "play-all-c-notes",
    total: 8,
    description: "Play all C notes using Z, X, C, V, B, N, M, comma keys",
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log("C-notes task checker called with:", {
        note,
        octave,
        isC: note === 0,
        validOctave: octave >= 1 && octave <= 8,
        existingNotes: Array.from(playedNotes),
      });

      if (note !== 0) {
        console.log("Rejected: Not a C note");
        return false;
      }

      if (octave < 1 || octave > 8) {
        console.log("Rejected: Invalid octave range");
        return false;
      }

      const noteKey = `${note}-${octave}`;
      if (playedNotes.has(noteKey)) {
        console.log("Rejected: Already played this C note");
        return false;
      }

      playedNotes.add(noteKey);
      console.log(
        `Success: Counted C note in octave ${octave}. Current played notes:`,
        Array.from(playedNotes)
      );
      return true;
    },
  },
};
