import { ColorMode } from "../components/types";
import { KeyboardMapping } from "../constants/keyboard";
import { LESSONS } from "../data/lessons";

export interface TaskConfig {
  id: string;
  description: string;
  total: number;
  keyboardMapping?: KeyboardMapping;
  colorMode?: ColorMode;
  chromaticNotes?: number[];
  checker: TaskChecker;
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
  "play-d-again",
  "play-c-sharp",
  "play-e-again",
  "play-d-sharp",
  "play-a-again",
  "play-g-sharp",
  "play-b-again",
  "play-a-sharp",
  "play-f-again",
  "play-f-sharp",
  "play-chromatic-ascending",
  "play-chromatic-descending",
] as const;

// First, let's create a type for our key mappings
export type NoteMapping = {
  note: number;
  octave: number;
  keys: string[]; // Array of keys that can trigger this note
};

// Create a function to generate both keyboard mapping and key display
export const createNoteMapping = (
  note: number,
  keys: [string, string, string, string] // Four keys for four octaves
): NoteMapping => ({
  note,
  octave: 0, // Base octave, will be adjusted in usage
  keys,
});

// Define our note mappings centrally
export const NOTE_MAPPINGS = {
  C: createNoteMapping(0, ["KeyZ", "KeyA", "KeyQ", "Digit1"]),
  D: createNoteMapping(2, ["KeyX", "KeyS", "KeyW", "Digit2"]),
  E: createNoteMapping(4, ["KeyC", "KeyD", "KeyE", "Digit3"]),
  F: createNoteMapping(5, ["KeyV", "KeyF", "KeyR", "Digit4"]),
  G: createNoteMapping(7, ["KeyB", "KeyG", "KeyT", "Digit5"]),
  A: createNoteMapping(9, ["KeyN", "KeyH", "KeyY", "Digit6"]),
  B: createNoteMapping(11, ["KeyM", "KeyJ", "KeyU", "Digit7"]),
  "C#": createNoteMapping(1, ["KeyZ", "KeyA", "KeyQ", "Digit1"]), // Same keys as C for black keys
  "E-again": createNoteMapping(4, ["KeyV", "KeyF", "KeyR", "Digit4"]),
  "D#": createNoteMapping(3, ["KeyC", "KeyD", "KeyE", "Digit3"]),
  "A-again": createNoteMapping(9, ["Comma", "KeyK", "KeyI", "Digit8"]),
  "G#": createNoteMapping(8, ["KeyM", "KeyJ", "KeyU", "Digit7"]),
  "B-again": createNoteMapping(11, ["Slash", "Semicolon", "KeyP", "Digit0"]),
  "A#": createNoteMapping(10, ["Period", "KeyL", "KeyO", "Digit9"]),
  "F-again": createNoteMapping(5, ["KeyB", "KeyG", "KeyT", "Digit5"]),
  "F#": createNoteMapping(6, ["KeyN", "KeyH", "KeyY", "Digit6"]),
} as const;

// Helper function to convert NoteMapping to KeyboardMapping
export const createKeyboardMapping = (
  noteMapping: NoteMapping
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  noteMapping.keys.forEach((key, index) => {
    mapping[key] = {
      note: noteMapping.note,
      octave: index + 2, // Start from octave 2
    };
  });
  return mapping;
};

// Add new type for sequence checking
export type SequenceChecker = {
  type: "sequence";
  sequence: Array<{ note: number; octave: number }>;
  currentIndex: number;
};

export type SetChecker = {
  type: "set";
  targetNotes: Set<string>; // Format: "note-octave"
};

export type TaskChecker = SequenceChecker | SetChecker;

// Create the ascending sequence starting from A0
const createAscendingChromaticSequence = (): Array<{
  note: number;
  octave: number;
}> => {
  // Start from A0 (note 9, octave 0)
  const sequence: Array<{ note: number; octave: number }> = [];
  let currentNote = 9; // A
  let currentOctave = 0;

  // Generate sequence until we reach the end of keyboard
  while (!(currentNote === 0 && currentOctave === 8)) {
    // Stop at C8
    sequence.push({ note: currentNote, octave: currentOctave });

    // Move to next note
    currentNote++;
    if (currentNote > 11) {
      currentNote = 0;
      currentOctave++;
    }
  }

  // Add final C8
  sequence.push({ note: 0, octave: 8 });

  return sequence;
};

// Create the descending sequence starting from C8
const createDescendingChromaticSequence = (): Array<{
  note: number;
  octave: number;
}> => {
  // Start from C8 (note 0, octave 8)
  const sequence: Array<{ note: number; octave: number }> = [];
  let currentNote = 0; // C
  let currentOctave = 8;

  // Generate sequence until we reach A0
  while (!(currentNote === 9 && currentOctave === 0)) {
    // Stop at A0
    sequence.push({ note: currentNote, octave: currentOctave });

    // Move to previous note
    currentNote--;
    if (currentNote < 0) {
      currentNote = 11;
      currentOctave--;
    }
  }

  // Add final A0
  sequence.push({ note: 9, octave: 0 });

  return sequence;
};

// Create the ascending and descending sequences
const ascendingSequence = createAscendingChromaticSequence();
const descendingSequence = createDescendingChromaticSequence();

// Define key sequence for ascending (left to right)
const ASCENDING_KEY_SEQUENCE = [
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
  "Slash",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "BracketLeft",
  "BracketRight",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
];

// Define key sequence for descending (right to left)
const DESCENDING_KEY_SEQUENCE = [
  "Equal",
  "Minus",
  "Digit0",
  "Digit9",
  "Digit8",
  "Digit7",
  "Digit6",
  "Digit5",
  "Digit4",
  "Digit3",
  "Digit2",
  "Digit1",
  "BracketRight",
  "BracketLeft",
  "KeyP",
  "KeyO",
  "KeyI",
  "KeyU",
  "KeyY",
  "KeyT",
  "KeyR",
  "KeyE",
  "KeyW",
  "KeyQ",
  "Quote",
  "Semicolon",
  "KeyL",
  "KeyK",
  "KeyJ",
  "KeyH",
  "KeyG",
  "KeyF",
  "KeyD",
  "KeyS",
  "KeyA",
  "Slash",
  "Period",
  "Comma",
  "KeyM",
  "KeyN",
  "KeyB",
  "KeyV",
  "KeyC",
  "KeyX",
  "KeyZ",
];

// Add this helper function to create keyboard mapping for sequences
const createSequenceKeyboardMapping = (
  sequence: Array<{ note: number; octave: number }>,
  keys: string[]
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  sequence.forEach(({ note, octave }, index) => {
    if (index < keys.length) {
      mapping[keys[index]] = { note, octave };
    }
  });
  return mapping;
};

// Update createTaskConfig to use NOTE_MAPPINGS
const createTaskConfig = (
  index: number,
  targetNote: NoteMapping,
  description: string,
  chromaticNotes: number[]
): TaskConfig => {
  return {
    id: TASK_SEQUENCE[index],
    description,
    total: 4,
    requiredProgress: 4,
    previousTaskId: index > 0 ? TASK_SEQUENCE[index - 1] : null,
    nextTaskId:
      index < TASK_SEQUENCE.length - 1 ? TASK_SEQUENCE[index + 1] : null,
    chromaticNotes,
    keyboardMapping: createKeyboardMapping(targetNote),
    checker: {
      type: "sequence",
      sequence: ascendingSequence,
      currentIndex: 0,
    },
  };
};

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "play-c-across-octaves": createTaskConfig(
    0,
    NOTE_MAPPINGS.C,
    "Play C notes across different octaves",
    [0]
  ),
  "play-d-across-octaves": createTaskConfig(
    1,
    NOTE_MAPPINGS.D,
    "Play D notes across different octaves",
    [0, 2]
  ),
  "play-e-across-octaves": createTaskConfig(
    2,
    NOTE_MAPPINGS.E,
    "Play E notes across different octaves",
    [0, 2, 4]
  ),
  "play-f-across-octaves": createTaskConfig(
    3,
    NOTE_MAPPINGS.F,
    "Play F notes across different octaves",
    [0, 2, 4, 5]
  ),
  "play-g-across-octaves": createTaskConfig(
    4,
    NOTE_MAPPINGS.G,
    "Play G notes across different octaves",
    [0, 2, 4, 5, 7]
  ),
  "play-a-across-octaves": createTaskConfig(
    5,
    NOTE_MAPPINGS.A,
    "Play A notes across different octaves",
    [0, 2, 4, 5, 7, 9]
  ),
  "play-b-across-octaves": createTaskConfig(
    6,
    NOTE_MAPPINGS.B,
    "Play B notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11]
  ),
  "play-d-again": createTaskConfig(
    7,
    NOTE_MAPPINGS.D,
    "Play D notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11]
  ),
  "play-c-sharp": createTaskConfig(
    8,
    NOTE_MAPPINGS["C#"],
    "Play C# notes across different octaves",
    [0, 1, 2, 4, 5, 7, 9, 11]
  ),
  "play-e-again": createTaskConfig(
    9,
    NOTE_MAPPINGS["E-again"],
    "Play E notes across different octaves",
    [0, 1, 2, 4, 5, 7, 9, 11]
  ),
  "play-d-sharp": createTaskConfig(
    10,
    NOTE_MAPPINGS["D#"],
    "Play D# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 9, 11]
  ),
  "play-a-again": createTaskConfig(
    11,
    NOTE_MAPPINGS["A-again"],
    "Play A notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 9, 11]
  ),
  "play-g-sharp": createTaskConfig(
    12,
    NOTE_MAPPINGS["G#"],
    "Play G# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 11]
  ),
  "play-b-again": createTaskConfig(
    13,
    NOTE_MAPPINGS["B-again"],
    "Play B notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 11]
  ),
  "play-a-sharp": createTaskConfig(
    14,
    NOTE_MAPPINGS["A#"],
    "Play A# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
  ),
  "play-f-again": createTaskConfig(
    15,
    NOTE_MAPPINGS["F-again"],
    "Play F notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
  ),
  "play-f-sharp": createTaskConfig(
    16,
    NOTE_MAPPINGS["F#"],
    "Play F# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  ),
  "play-chromatic-ascending": {
    id: "play-chromatic-ascending",
    description: "Play notes in ascending chromatic order, starting from A0",
    total: ASCENDING_KEY_SEQUENCE.length,
    requiredProgress: ASCENDING_KEY_SEQUENCE.length,
    keyboardMapping: createSequenceKeyboardMapping(
      ascendingSequence,
      ASCENDING_KEY_SEQUENCE
    ),
    colorMode: "chromatic",
    chromaticNotes: Array.from(new Set(ascendingSequence.map((n) => n.note))),
    checker: {
      type: "sequence",
      sequence: ascendingSequence,
      currentIndex: 0,
    },
    previousTaskId: "play-f-sharp",
    nextTaskId: "play-chromatic-descending",
  },

  "play-chromatic-descending": {
    id: "play-chromatic-descending",
    description: "Play notes in descending chromatic order, starting from C8",
    total: DESCENDING_KEY_SEQUENCE.length,
    requiredProgress: DESCENDING_KEY_SEQUENCE.length,
    keyboardMapping: createSequenceKeyboardMapping(
      descendingSequence,
      DESCENDING_KEY_SEQUENCE
    ),
    colorMode: "chromatic",
    chromaticNotes: Array.from(new Set(descendingSequence.map((n) => n.note))),
    checker: {
      type: "sequence",
      sequence: descendingSequence,
      currentIndex: 0,
    },
    previousTaskId: "play-chromatic-ascending",
    nextTaskId: null,
  },
};

export const isTaskCompleted = (taskId: string, progress: number): boolean => {
  const config = TASK_CONFIGS[taskId];
  return config && progress >= config.requiredProgress;
};

export const canTaskBeActivated = (
  taskId: string,
  taskProgress: TaskProgress[],
  currentLessonId: number
): boolean => {
  const config = TASK_CONFIGS[taskId];
  if (!config) return false;

  // Find which lesson this task belongs to
  const taskLesson = LESSONS.find((lesson) => lesson.taskIds.includes(taskId));
  if (!taskLesson || taskLesson.id !== currentLessonId) {
    return false; // Don't activate if task is not in current lesson
  }

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

// Add helper to check if a note matches the current sequence position
export const checkSequenceProgress = (
  checker: SequenceChecker,
  note: number,
  octave: number
): boolean => {
  const target = checker.sequence[checker.currentIndex];
  return target.note === note && target.octave === octave;
};
