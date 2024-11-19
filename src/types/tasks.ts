import { ColorMode } from "../components/types";
import {
  KeyboardMapping,
  TRADITIONAL_KEYBOARD_MAP,
} from "../constants/keyboard";

export interface TaskConfig {
  id: string;
  description: string;
  total: number;
  keyboardMapping?: KeyboardMapping;
  colorMode?: ColorMode;
  checkProgress: (
    note: number,
    octave: number,
    playedNotes: Set<string>
  ) => boolean;
  nextTaskId?: string | null;
}

// Define all tasks and their configurations
export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "press-any-notes": {
    id: "press-any-notes",
    description: "Press any 20 notes on the piano",
    total: 20,
    keyboardMapping: TRADITIONAL_KEYBOARD_MAP,
    checkProgress: () => true,
    nextTaskId: "play-all-c-notes",
  },
  "play-all-c-notes": {
    id: "play-all-c-notes",
    description: "Play all C notes using Z, X, C, V, B, N, M, comma keys",
    total: 8,
    keyboardMapping: {
      KeyZ: { note: 0, octave: 1 }, // C1
      KeyX: { note: 0, octave: 2 }, // C2
      KeyC: { note: 0, octave: 3 }, // C3
      KeyV: { note: 0, octave: 4 }, // C4
      KeyB: { note: 0, octave: 5 }, // C5
      KeyN: { note: 0, octave: 6 }, // C6
      KeyM: { note: 0, octave: 7 }, // C7
      Comma: { note: 0, octave: 8 }, // C8
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      const noteKey = `${note}-${octave}`;
      return note === 0 && !playedNotes.has(noteKey);
    },
    nextTaskId: null,
  },
  "play-c-across-octaves": {
    id: "play-c-across-octaves",
    description: "Play C notes across different octaves using Z, A, Q, 1 keys",
    total: 4,
    keyboardMapping: {
      KeyZ: { note: 0, octave: 2 }, // C2
      KeyA: { note: 0, octave: 3 }, // C3
      KeyQ: { note: 0, octave: 4 }, // C4
      Digit1: { note: 0, octave: 5 }, // C5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log(`[play-c-across-octaves] Checking progress:`, {
        note,
        octave,
        currentPlayedNotes: Array.from(playedNotes),
        validOctaves: [2, 3, 4, 5],
        isValidNote: note === 0,
        isValidOctave: [2, 3, 4, 5].includes(octave),
      });

      if (note !== 0 || ![2, 3, 4, 5].includes(octave)) {
        console.log(`[play-c-across-octaves] Rejected: invalid note or octave`);
        return false;
      }

      const noteKey = `${note}-${octave}`;
      const isNewNote = !playedNotes.has(noteKey);

      console.log(`[play-c-across-octaves] Note key "${noteKey}":`, {
        alreadyPlayed: playedNotes.has(noteKey),
        willIncrement: isNewNote,
      });

      return isNewNote;
    },
    nextTaskId: null,
  },
};
