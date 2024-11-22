import { NoteInSequence } from "./tasks";

// Add these new types for the public API
export interface CheckerState {
  completedNotes: Array<{ note: number; octave: number }>;
  activeTargets: Array<{ note: number; octave: number }>;
  progress: number;
}

// Update the checker types to be more stateless
export type SequenceChecker = {
  type: "sequence";
  sequence: NoteInSequence[];
  getState: (currentIndex: number) => CheckerState;
  checkNote: (note: number, octave: number, currentIndex: number) => boolean;
};

export type SetChecker = {
  type: "set";
  targetNotes: Set<string>;
  getState: (playedNotes: Set<string>) => CheckerState;
  checkNote: (
    note: number,
    octave: number,
    playedNotes: Set<string>
  ) => boolean;
};

export type TaskChecker = SequenceChecker | SetChecker;

// Update the checker creators
export const createSequenceChecker = (
  sequence: NoteInSequence[]
): SequenceChecker => ({
  type: "sequence",
  sequence,
  getState: (currentIndex: number) => ({
    completedNotes: sequence.slice(0, currentIndex),
    activeTargets: sequence.slice(currentIndex, currentIndex + 1),
    progress: currentIndex,
  }),
  checkNote: (note: number, octave: number, currentIndex: number) => {
    const target = sequence[currentIndex];
    return target && target.note === note && target.octave === octave;
  },
});

export const createSetChecker = (targetNotes: Set<string>): SetChecker => ({
  type: "set",
  targetNotes,
  getState: (playedNotes: Set<string> = new Set()) => {
    const completed: Array<{ note: number; octave: number }> = [];
    const active: Array<{ note: number; octave: number }> = [];

    // Ensure playedNotes is a Set
    const safePlayedNotes = playedNotes || new Set<string>();

    Array.from(targetNotes).forEach((noteKey) => {
      const [note, octave] = noteKey.split("-").map(Number);
      if (safePlayedNotes.has(noteKey)) {
        completed.push({ note, octave });
      } else {
        active.push({ note, octave });
      }
    });

    return {
      completedNotes: completed,
      activeTargets: active,
      progress: completed.length,
    };
  },
  checkNote: (
    note: number,
    octave: number,
    playedNotes: Set<string> = new Set()
  ) => {
    const noteKey = `${note}-${octave}`;
    const safePlayedNotes = playedNotes || new Set<string>();
    return targetNotes.has(noteKey) && !safePlayedNotes.has(noteKey);
  },
});
