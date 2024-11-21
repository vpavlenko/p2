import { ColorMode } from "../components/types";
import { KeyboardMapping } from "../constants/keyboard";
import { LESSONS } from "../data/lessons";

export type RelativeNote = 0 | 2 | 4 | 5 | 7 | 9 | 11; // C D E F G A B
export type ChromaticNote = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface TaskConfig {
  id: string;
  description: string;
  total: number;
  keyboardMapping?: KeyboardMapping;
  colorMode?: ColorMode;
  chromaticNotes?: number[];
  checker: TaskChecker;
  requiredProgress: number;
  previousTaskId?: string | null;
  playedNotes?: Set<string>;
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
  "play-chromatic-ascending-flat",
  "play-major-seconds-from-a0",
  "play-major-seconds-from-asharp0",
] as const;

// First, let's create a type for our key mappings
export type NoteMapping = {
  note: ChromaticNote;
  octave: number;
  keys: string[]; // Array of keys that can trigger this note
};

// Create a function to generate both keyboard mapping and key display
export const createNoteMapping = (
  note: ChromaticNote,
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
type NoteInSequence = {
  note: ChromaticNote;
  octave: number;
};

// Add these new types for the public API
export interface CheckerState {
  completedNotes: Array<{ note: number; octave: number }>;
  activeTargets: Array<{ note: number; octave: number }>;
}

// Update the checker types to include methods for getting state
export type SequenceChecker = {
  type: "sequence";
  sequence: NoteInSequence[];
  currentIndex: number;
  getState: () => CheckerState;
};

export type SetChecker = {
  type: "set";
  targetNotes: Set<string>;
  getState: (playedNotes?: Set<string>) => CheckerState;
};

export type TaskChecker = SequenceChecker | SetChecker;

// Add helper functions to implement the getState methods
export const createSequenceChecker = (
  sequence: NoteInSequence[]
): SequenceChecker => ({
  type: "sequence",
  sequence,
  currentIndex: 0,
  getState: function () {
    return {
      completedNotes: this.sequence.slice(0, this.currentIndex),
      activeTargets: this.sequence.slice(
        this.currentIndex,
        this.currentIndex + 1
      ),
    };
  },
});

export const createSetChecker = (targetNotes: Set<string>): SetChecker => ({
  type: "set",
  targetNotes,
  getState: function (playedNotes: Set<string> = new Set()) {
    const completed: Array<{ note: number; octave: number }> = [];
    const active: Array<{ note: number; octave: number }> = [];

    Array.from(this.targetNotes).forEach((noteKey) => {
      const [note, octave] = noteKey.split("-").map(Number);
      if (playedNotes.has(noteKey)) {
        completed.push({ note, octave });
      } else {
        active.push({ note, octave });
      }
    });

    return {
      completedNotes: completed,
      activeTargets: active,
    };
  },
});

// Create the ascending sequence starting from A0
const createAscendingChromaticSequence = (): NoteInSequence[] => {
  const sequence: NoteInSequence[] = [];
  let currentNote = 9 as ChromaticNote; // A
  let currentOctave = 0;

  while (!(currentNote === 0 && currentOctave === 8)) {
    sequence.push({ note: currentNote, octave: currentOctave });

    // Move to next note
    const nextNote = (currentNote + 1) % 12;
    currentNote = nextNote as ChromaticNote;
    if (nextNote === 0) {
      currentOctave++;
    }
  }

  // Add final C8
  sequence.push({ note: 0 as ChromaticNote, octave: 8 });

  return sequence;
};

// Create the descending sequence starting from C8
const createDescendingChromaticSequence = (): NoteInSequence[] => {
  const sequence: NoteInSequence[] = [];
  let currentNote = 0 as ChromaticNote; // C
  let currentOctave = 8;

  while (!(currentNote === 9 && currentOctave === 0)) {
    sequence.push({ note: currentNote, octave: currentOctave });

    // Move to previous note
    let nextNote = currentNote - 1;
    if (nextNote < 0) {
      nextNote = 11;
      currentOctave--;
    }
    currentNote = nextNote as ChromaticNote;
  }

  // Add final A0
  sequence.push({ note: 9 as ChromaticNote, octave: 0 });

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

// Update createTaskConfig to use the new checker creators
const createTaskConfig = (
  index: number,
  targetNote: NoteMapping,
  description: string,
  chromaticNotes: number[],
  lessonNumber: number
): TaskConfig => {
  // Create a set of target notes for just this task
  const targetNotes = new Set<string>();
  [2, 3, 4, 5].forEach((octave) => {
    targetNotes.add(`${targetNote.note}-${octave}`);
  });

  // Create the checker using the new creator function
  const checker = createSetChecker(targetNotes);

  // Create the full keyboard mapping that includes all previous notes
  const fullMapping: KeyboardMapping = {};

  if (lessonNumber === 1) {
    // Lesson 1: Progressive mapping from C to B
    const relevantMappings = [
      NOTE_MAPPINGS.C,
      NOTE_MAPPINGS.D,
      NOTE_MAPPINGS.E,
      NOTE_MAPPINGS.F,
      NOTE_MAPPINGS.G,
      NOTE_MAPPINGS.A,
      NOTE_MAPPINGS.B,
    ].slice(0, index + 1);

    relevantMappings.forEach((noteMapping) => {
      if (noteMapping) {
        noteMapping.keys.forEach((key, octaveOffset) => {
          fullMapping[key] = {
            note: noteMapping.note,
            octave: octaveOffset + 2,
          };
        });
      }
    });
  } else if (lessonNumber === 2) {
    // Lesson 2: Progressive mapping for black keys
    const lesson2Mappings = [
      NOTE_MAPPINGS.D,
      NOTE_MAPPINGS["C#"],
      NOTE_MAPPINGS["E-again"],
      NOTE_MAPPINGS["D#"],
      NOTE_MAPPINGS["A-again"],
      NOTE_MAPPINGS["G#"],
      NOTE_MAPPINGS["B-again"],
      NOTE_MAPPINGS["A#"],
      NOTE_MAPPINGS["F-again"],
      NOTE_MAPPINGS["F#"],
    ];

    // Calculate the index within lesson 2
    const lesson2Index = index - 7; // Since lesson 2 starts at index 7
    const relevantMappings = lesson2Mappings.slice(0, lesson2Index + 1);

    relevantMappings.forEach((noteMapping) => {
      if (noteMapping) {
        noteMapping.keys.forEach((key, octaveOffset) => {
          fullMapping[key] = {
            note: noteMapping.note,
            octave: octaveOffset + 2,
          };
        });
      }
    });
  }

  return {
    id: TASK_SEQUENCE[index],
    description: `Play ${description}`,
    total: 4,
    requiredProgress: 4,
    previousTaskId: index > 0 ? TASK_SEQUENCE[index - 1] : null,
    chromaticNotes,
    keyboardMapping: fullMapping,
    checker,
  };
};

// Add helper function to create sequences with intervals
const createIntervalSequence = (
  startNote: ChromaticNote,
  startOctave: number,
  interval: number
): NoteInSequence[] => {
  const sequence: NoteInSequence[] = [];
  let currentNote = startNote;
  let currentOctave = startOctave;

  // Add safety limit to prevent infinite loops
  const maxLength = 100; // Reasonable maximum length

  while (sequence.length < maxLength && currentOctave < 8) {
    sequence.push({ note: currentNote, octave: currentOctave });

    // Calculate next note and octave
    let nextNote = currentNote + interval;
    let nextOctave = currentOctave;

    // If we cross over 11, we need to adjust both note and octave
    if (nextNote > 11) {
      nextNote = nextNote % 12;
      nextOctave++;
    }

    currentNote = nextNote as ChromaticNote;
    currentOctave = nextOctave;

    // Break if we reach or exceed C8
    if (currentOctave >= 8) {
      break;
    }
  }

  return sequence;
};

// Create sequences for major second tasks
const majorSecondFromA0Sequence = createIntervalSequence(
  9 as ChromaticNote,
  0,
  2
); // Start from A0
const majorSecondFromASharp0Sequence = createIntervalSequence(
  10 as ChromaticNote,
  0,
  2
); // Start from A#0

// Create keyboard mappings for the sequences
const createFlatChromaticMapping = (
  sequence: Array<{ note: number; octave: number }>
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  const keySequence = [
    // Bottom row
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
    // Middle row
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
    // Top row
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
    // Number row
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

  sequence.forEach(({ note, octave }, index) => {
    if (index < keySequence.length) {
      mapping[keySequence[index]] = { note, octave };
    }
  });

  return mapping;
};

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  // Lesson 1 tasks
  "play-c-across-octaves": createTaskConfig(
    0,
    NOTE_MAPPINGS.C,
    "C notes across different octaves",
    [0],
    1
  ),
  "play-d-across-octaves": createTaskConfig(
    1,
    NOTE_MAPPINGS.D,
    "D notes across different octaves",
    [0, 2],
    1
  ),
  "play-e-across-octaves": createTaskConfig(
    2,
    NOTE_MAPPINGS.E,
    "E notes across different octaves",
    [0, 2, 4],
    1
  ),
  "play-f-across-octaves": createTaskConfig(
    3,
    NOTE_MAPPINGS.F,
    "F notes across different octaves",
    [0, 2, 4, 5],
    1
  ),
  "play-g-across-octaves": createTaskConfig(
    4,
    NOTE_MAPPINGS.G,
    "G notes across different octaves",
    [0, 2, 4, 5, 7],
    1
  ),
  "play-a-across-octaves": createTaskConfig(
    5,
    NOTE_MAPPINGS.A,
    "A notes across different octaves",
    [0, 2, 4, 5, 7, 9],
    1
  ),
  "play-b-across-octaves": createTaskConfig(
    6,
    NOTE_MAPPINGS.B,
    "B notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11],
    1
  ),
  "play-d-again": createTaskConfig(
    7,
    NOTE_MAPPINGS.D,
    "D notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11],
    2
  ),
  "play-c-sharp": createTaskConfig(
    8,
    NOTE_MAPPINGS["C#"],
    "D♭ notes across different octaves",
    [0, 1, 2, 4, 5, 7, 9, 11],
    2
  ),
  "play-e-again": createTaskConfig(
    9,
    NOTE_MAPPINGS["E-again"],
    "E notes across different octaves",
    [0, 1, 2, 4, 5, 7, 9, 11],
    2
  ),
  "play-d-sharp": createTaskConfig(
    10,
    NOTE_MAPPINGS["D#"],
    "E♭ notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 9, 11],
    2
  ),
  "play-a-again": createTaskConfig(
    11,
    NOTE_MAPPINGS["A-again"],
    "A notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 9, 11],
    2
  ),
  "play-g-sharp": createTaskConfig(
    12,
    NOTE_MAPPINGS["G#"],
    "A♭ notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 11],
    2
  ),
  "play-b-again": createTaskConfig(
    13,
    NOTE_MAPPINGS["B-again"],
    "B notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 11],
    2
  ),
  "play-a-sharp": createTaskConfig(
    14,
    NOTE_MAPPINGS["A#"],
    "B♭ notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
    2
  ),
  "play-f-again": createTaskConfig(
    15,
    NOTE_MAPPINGS["F-again"],
    "F notes across different octaves",
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11],
    2
  ),
  "play-f-sharp": createTaskConfig(
    16,
    NOTE_MAPPINGS["F#"],
    "F# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    2
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
    checker: createSequenceChecker(ascendingSequence),
    previousTaskId: "play-f-sharp",
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
    checker: createSequenceChecker(descendingSequence),
    previousTaskId: "play-chromatic-ascending",
  },

  "play-chromatic-ascending-flat": {
    id: "play-chromatic-ascending-flat",
    description:
      "Play notes in ascending chromatic order using flat keyboard layout",
    total: ASCENDING_KEY_SEQUENCE.length,
    requiredProgress: ASCENDING_KEY_SEQUENCE.length,
    keyboardMapping: createSequenceKeyboardMapping(
      ascendingSequence,
      ASCENDING_KEY_SEQUENCE
    ),
    colorMode: "flat-chromatic",
    chromaticNotes: Array.from(new Set(ascendingSequence.map((n) => n.note))),
    checker: createSequenceChecker(ascendingSequence),
    previousTaskId: "play-chromatic-descending",
  },

  "play-major-seconds-from-a0": {
    id: "play-major-seconds-from-a0",
    description: "Play notes separated by major seconds, starting from A0",
    total: majorSecondFromA0Sequence.length,
    requiredProgress: majorSecondFromA0Sequence.length,
    keyboardMapping: createFlatChromaticMapping(majorSecondFromA0Sequence),
    colorMode: "flat-chromatic",
    chromaticNotes: Array.from(
      new Set(majorSecondFromA0Sequence.map((n) => n.note))
    ),
    checker: createSequenceChecker(majorSecondFromA0Sequence),
    previousTaskId: "play-chromatic-ascending-flat",
  },

  "play-major-seconds-from-asharp0": {
    id: "play-major-seconds-from-asharp0",
    description: "Play notes separated by major seconds, starting from A#0",
    total: majorSecondFromASharp0Sequence.length,
    requiredProgress: majorSecondFromASharp0Sequence.length,
    keyboardMapping: createFlatChromaticMapping(majorSecondFromASharp0Sequence),
    colorMode: "flat-chromatic",
    chromaticNotes: Array.from(
      new Set(majorSecondFromASharp0Sequence.map((n) => n.note))
    ),
    checker: createSequenceChecker(majorSecondFromASharp0Sequence),
    previousTaskId: "play-major-seconds-from-a0",
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
  // Find which lesson contains this task
  const lesson = LESSONS.find((lesson) =>
    lesson.taskIds.includes(currentTaskId)
  );
  if (!lesson) return null;

  // Find the index of current task in the lesson
  const currentIndex = lesson.taskIds.indexOf(currentTaskId);
  if (currentIndex === -1 || currentIndex === lesson.taskIds.length - 1)
    return null;

  // Return the next task in the lesson
  return lesson.taskIds[currentIndex + 1];
};

export const getPreviousTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.previousTaskId || null;
};

// Update the checkTaskProgress function to handle both types properly
export const checkTaskProgress = (
  checker: TaskChecker,
  note: number,
  octave: number
): boolean => {
  console.log("[checkTaskProgress] Called with:", { checker, note, octave });

  if (checker.type === "sequence") {
    const result = checkSequenceProgress(checker, note, octave);
    console.log("[checkTaskProgress] Sequence check result:", result);
    return result;
  } else {
    // Set checker
    const noteKey = `${note}-${octave}`;
    const result = checker.targetNotes.has(noteKey);
    console.log("[checkTaskProgress] Set check result:", { noteKey, result });
    return result;
  }
};

// Update checkSequenceProgress to be more robust
export const checkSequenceProgress = (
  checker: SequenceChecker,
  note: number,
  octave: number
): boolean => {
  const target = checker.sequence[checker.currentIndex];
  if (!target) return false;

  const matches = target.note === note && target.octave === octave;
  console.log("[checkSequenceProgress]", {
    currentIndex: checker.currentIndex,
    target,
    played: { note, octave },
    matches,
    sequenceLength: checker.sequence.length,
  });
  return matches;
};
