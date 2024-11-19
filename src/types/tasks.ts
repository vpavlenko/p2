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
  chromaticNotes?: number[];
  checkProgress: (
    note: number,
    octave: number,
    playedNotes: Set<string>
  ) => boolean;
  nextTaskId?: string | null;
  requiredProgress: number;
  previousTaskId?: string | null;
}

export interface TaskProgress {
  taskId: string;
  progress: number;
  status: "active" | "completing" | "completed";
}

export const TASK_SEQUENCE = [
  "play-c-across-octaves",
  "play-d-across-octaves",
  "play-e-across-octaves",
  "play-f-across-octaves",
  "play-g-across-octaves",
  "play-a-across-octaves",
  "play-b-across-octaves",
] as const;

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "play-c-across-octaves": {
    id: "play-c-across-octaves",
    description: "Play C notes across different octaves using Z, A, Q, 1 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: null,
    chromaticNotes: [0],
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
    chromaticNotes: [0, 2],
    keyboardMapping: {
      KeyX: { note: 2, octave: 2 }, // D2
      KeyS: { note: 2, octave: 3 }, // D3
      KeyW: { note: 2, octave: 4 }, // D4
      Digit2: { note: 2, octave: 5 }, // D5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log(`[play-d-across-octaves] Checking progress:`, {
        note,
        octave,
        currentPlayedNotes: Array.from(playedNotes),
        validOctaves: [2, 3, 4, 5],
        isValidNote: note === 2,
        isValidOctave: [2, 3, 4, 5].includes(octave),
      });

      if (note !== 2 || ![2, 3, 4, 5].includes(octave)) {
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
    chromaticNotes: [0, 2, 4],
    keyboardMapping: {
      KeyC: { note: 4, octave: 2 }, // E2
      KeyD: { note: 4, octave: 3 }, // E3
      KeyE: { note: 4, octave: 4 }, // E4
      Digit3: { note: 4, octave: 5 }, // E5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      console.log(`[play-e-across-octaves] Checking progress:`, {
        note,
        octave,
        currentPlayedNotes: Array.from(playedNotes),
        validOctaves: [2, 3, 4, 5],
        isValidNote: note === 4,
        isValidOctave: [2, 3, 4, 5].includes(octave),
      });

      if (note !== 4 || ![2, 3, 4, 5].includes(octave)) {
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
    nextTaskId: "play-f-across-octaves",
  },
  "play-f-across-octaves": {
    id: "play-f-across-octaves",
    description: "Play F notes across different octaves using V, F, R, 4 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-e-across-octaves",
    chromaticNotes: [0, 2, 4, 5],
    keyboardMapping: {
      KeyV: { note: 5, octave: 2 }, // F2
      KeyF: { note: 5, octave: 3 }, // F3
      KeyR: { note: 5, octave: 4 }, // F4
      Digit4: { note: 5, octave: 5 }, // F5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== 5 || ![2, 3, 4, 5].includes(octave)) {
        return false;
      }
      const noteKey = `${note}-${octave}`;
      return !playedNotes.has(noteKey);
    },
    nextTaskId: "play-g-across-octaves",
  },
  "play-g-across-octaves": {
    id: "play-g-across-octaves",
    description: "Play G notes across different octaves using B, G, T, 5 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-f-across-octaves",
    chromaticNotes: [0, 2, 4, 5, 7],
    keyboardMapping: {
      KeyB: { note: 7, octave: 2 }, // G2
      KeyG: { note: 7, octave: 3 }, // G3
      KeyT: { note: 7, octave: 4 }, // G4
      Digit5: { note: 7, octave: 5 }, // G5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== 7 || ![2, 3, 4, 5].includes(octave)) {
        return false;
      }
      const noteKey = `${note}-${octave}`;
      return !playedNotes.has(noteKey);
    },
    nextTaskId: "play-a-across-octaves",
  },
  "play-a-across-octaves": {
    id: "play-a-across-octaves",
    description: "Play A notes across different octaves using N, H, Y, 6 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-g-across-octaves",
    chromaticNotes: [0, 2, 4, 5, 7, 9],
    keyboardMapping: {
      KeyN: { note: 9, octave: 2 }, // A2
      KeyH: { note: 9, octave: 3 }, // A3
      KeyY: { note: 9, octave: 4 }, // A4
      Digit6: { note: 9, octave: 5 }, // A5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== 9 || ![2, 3, 4, 5].includes(octave)) {
        return false;
      }
      const noteKey = `${note}-${octave}`;
      return !playedNotes.has(noteKey);
    },
    nextTaskId: "play-b-across-octaves",
  },
  "play-b-across-octaves": {
    id: "play-b-across-octaves",
    description: "Play B notes across different octaves using M, J, U, 7 keys",
    total: 4,
    requiredProgress: 4,
    previousTaskId: "play-a-across-octaves",
    chromaticNotes: [0, 2, 4, 5, 7, 9, 11],
    keyboardMapping: {
      KeyM: { note: 11, octave: 2 }, // B2
      KeyJ: { note: 11, octave: 3 }, // B3
      KeyU: { note: 11, octave: 4 }, // B4
      Digit7: { note: 11, octave: 5 }, // B5
    },
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== 11 || ![2, 3, 4, 5].includes(octave)) {
        return false;
      }
      const noteKey = `${note}-${octave}`;
      return !playedNotes.has(noteKey);
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
  taskProgress: TaskProgress[]
): boolean => {
  const config = TASK_CONFIGS[taskId];
  if (!config) return false;

  if (!config.previousTaskId) return true;

  const previousTask = taskProgress.find(
    (t) => t.taskId === config.previousTaskId
  );
  const previousTaskProgress = previousTask?.progress || 0;

  return isTaskCompleted(config.previousTaskId, previousTaskProgress);
};

export const getNextTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.nextTaskId || null;
};

export const getPreviousTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.previousTaskId || null;
};
