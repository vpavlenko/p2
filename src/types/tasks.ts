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
  requiredProgress: number;
  previousTaskId?: string | null;
}

export const TASK_SEQUENCE = [
  "play-c-across-octaves",
  "play-d-across-octaves",
  "play-e-across-octaves",
  "press-any-notes",
  "play-all-c-notes",
] as const;

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "play-c-across-octaves": {
    id: "play-c-across-octaves",
    description: "Play C notes across different octaves using Z, A, Q, 1 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: null,
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
    nextTaskId: "play-d-across-octaves",
  },
  "play-d-across-octaves": {
    id: "play-d-across-octaves",
    description: "Play D notes across different octaves using X, S, W, 2 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-c-across-octaves",
    keyboardMapping: {
      KeyX: { note: 2, octave: 3 }, // D3
      KeyS: { note: 2, octave: 4 }, // D4
      KeyW: { note: 2, octave: 5 }, // D5
      Digit2: { note: 2, octave: 6 }, // D6
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log(`[play-d-across-octaves] Checking progress:`, {
        note,
        octave,
        currentPlayedNotes: Array.from(playedNotes),
        validOctaves: [3, 4, 5, 6],
        isValidNote: note === 2,
        isValidOctave: [3, 4, 5, 6].includes(octave),
      });

      if (note !== 2 || ![3, 4, 5, 6].includes(octave)) {
        console.log(`[play-d-across-octaves] Rejected: invalid note or octave`);
        return false;
      }

      const noteKey = `${note}-${octave}`;
      const isNewNote = !playedNotes.has(noteKey);

      console.log(`[play-d-across-octaves] Note key "${noteKey}":`, {
        alreadyPlayed: playedNotes.has(noteKey),
        willIncrement: isNewNote,
      });

      return isNewNote;
    },
    nextTaskId: "play-e-across-octaves",
  },
  "play-e-across-octaves": {
    id: "play-e-across-octaves",
    description: "Play E notes across different octaves using C, D, E, 3 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-d-across-octaves",
    keyboardMapping: {
      KeyC: { note: 4, octave: 3 }, // E3
      KeyD: { note: 4, octave: 4 }, // E4
      KeyE: { note: 4, octave: 5 }, // E5
      Digit3: { note: 4, octave: 6 }, // E6
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log(`[play-e-across-octaves] Checking progress:`, {
        note,
        octave,
        currentPlayedNotes: Array.from(playedNotes),
        validOctaves: [3, 4, 5, 6],
        isValidNote: note === 4,
        isValidOctave: [3, 4, 5, 6].includes(octave),
      });

      if (note !== 4 || ![3, 4, 5, 6].includes(octave)) {
        console.log(`[play-e-across-octaves] Rejected: invalid note or octave`);
        return false;
      }

      const noteKey = `${note}-${octave}`;
      const isNewNote = !playedNotes.has(noteKey);

      console.log(`[play-e-across-octaves] Note key "${noteKey}":`, {
        alreadyPlayed: playedNotes.has(noteKey),
        willIncrement: isNewNote,
      });

      return isNewNote;
    },
    nextTaskId: "press-any-notes",
  },
  "press-any-notes": {
    id: "press-any-notes",
    description: "Press any 20 notes on the piano",
    total: 20,
    requiredProgress: 20,
    previousTaskId: "play-e-across-octaves",
    keyboardMapping: TRADITIONAL_KEYBOARD_MAP,
    checkProgress: () => true,
    nextTaskId: "play-all-c-notes",
  },
  "play-all-c-notes": {
    id: "play-all-c-notes",
    description: "Play all C notes using Z, X, C, V, B, N, M, comma keys",
    total: 8,
    requiredProgress: 8,
    previousTaskId: "press-any-notes",
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
};

export const isTaskCompleted = (taskId: string, progress: number): boolean => {
  const config = TASK_CONFIGS[taskId];
  return config && progress >= config.requiredProgress;
};

export const canTaskBeActivated = (
  taskId: string,
  taskProgress: Array<{ taskId: string; progress: number }>
): boolean => {
  const config = TASK_CONFIGS[taskId];
  if (!config) return false;

  if (!config.previousTaskId) return true;

  const previousTaskProgress =
    taskProgress.find((t) => t.taskId === config.previousTaskId)?.progress || 0;

  return isTaskCompleted(config.previousTaskId, previousTaskProgress);
};

export const getNextTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.nextTaskId || null;
};

export const getPreviousTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.previousTaskId || null;
};
