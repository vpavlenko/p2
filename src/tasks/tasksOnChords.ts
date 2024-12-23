import { KeyboardMapping } from "../constants/keyboard";
import { TaskConfig } from "./tasks";
import { createSetChecker } from "./checkers";

// First combine major and minor chord mappings
const CHORD_MAPPINGS = {
  // Major chords
  "C-major": {
    notes: [
      { note: 0, octave: 2 }, // C2
      { note: 4, octave: 2 }, // E2
      { note: 7, octave: 2 }, // G2
    ],
    keys: ["KeyZ", "KeyX", "KeyC"],
  },
  "C#-major": {
    notes: [
      { note: 1, octave: 2 }, // C#2
      { note: 5, octave: 2 }, // F2
      { note: 8, octave: 2 }, // G#2
    ],
    keys: ["KeyV", "KeyB", "KeyN"],
  },
  "D-major": {
    notes: [
      { note: 2, octave: 2 }, // D2
      { note: 6, octave: 2 }, // F#2
      { note: 9, octave: 2 }, // A2
    ],
    keys: ["KeyM", "Comma", "Period"],
  },
  "Eb-major": {
    notes: [
      { note: 3, octave: 3 }, // Eb3
      { note: 7, octave: 3 }, // G3
      { note: 10, octave: 3 }, // Bb3
    ],
    keys: ["KeyA", "KeyS", "KeyD"],
  },
  "E-major": {
    notes: [
      { note: 4, octave: 3 }, // E3
      { note: 8, octave: 3 }, // G#3
      { note: 11, octave: 3 }, // B3
    ],
    keys: ["KeyF", "KeyG", "KeyH"],
  },
  "F-major": {
    notes: [
      { note: 5, octave: 3 }, // F3
      { note: 9, octave: 3 }, // A3
      { note: 0, octave: 4 }, // C4
    ],
    keys: ["KeyJ", "KeyK", "KeyL"],
  },
  "F#-major": {
    notes: [
      { note: 6, octave: 4 }, // F#4
      { note: 10, octave: 4 }, // A#4
      { note: 1, octave: 5 }, // C#5
    ],
    keys: ["KeyQ", "KeyW", "KeyE"],
  },
  "G-major": {
    notes: [
      { note: 7, octave: 4 }, // G4
      { note: 11, octave: 4 }, // B4
      { note: 2, octave: 5 }, // D5
    ],
    keys: ["KeyR", "KeyT", "KeyY"],
  },
  "G#-major": {
    notes: [
      { note: 8, octave: 4 }, // G#4
      { note: 0, octave: 5 }, // C5
      { note: 3, octave: 5 }, // Eb5
    ],
    keys: ["KeyU", "KeyI", "KeyO"],
  },
  "A-major": {
    notes: [
      { note: 9, octave: 4 }, // A4
      { note: 1, octave: 5 }, // C#5
      { note: 4, octave: 5 }, // E5
    ],
    keys: ["Digit1", "Digit2", "Digit3"],
  },
  "Bb-major": {
    notes: [
      { note: 10, octave: 4 }, // Bb4
      { note: 2, octave: 5 }, // D5
      { note: 5, octave: 5 }, // F5
    ],
    keys: ["Digit4", "Digit5", "Digit6"],
  },
  "B-major": {
    notes: [
      { note: 11, octave: 4 }, // B4
      { note: 3, octave: 5 }, // Eb5
      { note: 6, octave: 5 }, // F#5
    ],
    keys: ["Digit7", "Digit8", "Digit9"],
  },
  // Minor chords
  "C-minor": {
    notes: [
      { note: 0, octave: 2 }, // C2
      { note: 3, octave: 2 }, // Eb2 (minor third)
      { note: 7, octave: 2 }, // G2 (perfect fifth)
    ],
    keys: ["KeyZ", "KeyX", "KeyC"],
  },
  "C#-minor": {
    notes: [
      { note: 1, octave: 2 }, // C#2
      { note: 4, octave: 2 }, // E2 (minor third)
      { note: 8, octave: 2 }, // G#2 (perfect fifth)
    ],
    keys: ["KeyV", "KeyB", "KeyN"],
  },
  "D-minor": {
    notes: [
      { note: 2, octave: 2 }, // D2
      { note: 5, octave: 2 }, // F2 (minor third)
      { note: 9, octave: 2 }, // A2 (perfect fifth)
    ],
    keys: ["KeyM", "Comma", "Period"],
  },
  "Eb-minor": {
    notes: [
      { note: 3, octave: 3 }, // Eb3
      { note: 6, octave: 3 }, // Gb3 (minor third)
      { note: 10, octave: 3 }, // Bb3 (perfect fifth)
    ],
    keys: ["KeyA", "KeyS", "KeyD"],
  },
  "E-minor": {
    notes: [
      { note: 4, octave: 3 }, // E3
      { note: 7, octave: 3 }, // G3 (minor third)
      { note: 11, octave: 3 }, // B3 (perfect fifth)
    ],
    keys: ["KeyF", "KeyG", "KeyH"],
  },
  "F-minor": {
    notes: [
      { note: 5, octave: 3 }, // F3
      { note: 8, octave: 3 }, // Ab3 (minor third)
      { note: 0, octave: 4 }, // C4 (perfect fifth)
    ],
    keys: ["KeyJ", "KeyK", "KeyL"],
  },
  "F#-minor": {
    notes: [
      { note: 6, octave: 4 }, // F#4
      { note: 9, octave: 4 }, // A4 (minor third)
      { note: 1, octave: 5 }, // C#5 (perfect fifth)
    ],
    keys: ["KeyQ", "KeyW", "KeyE"],
  },
  "G-minor": {
    notes: [
      { note: 7, octave: 4 }, // G4
      { note: 10, octave: 4 }, // Bb4 (minor third)
      { note: 2, octave: 5 }, // D5 (perfect fifth)
    ],
    keys: ["KeyR", "KeyT", "KeyY"],
  },
  "G#-minor": {
    notes: [
      { note: 8, octave: 4 }, // G#4
      { note: 11, octave: 4 }, // B4 (minor third)
      { note: 3, octave: 5 }, // Eb5 (perfect fifth)
    ],
    keys: ["KeyU", "KeyI", "KeyO"],
  },
  "A-minor": {
    notes: [
      { note: 9, octave: 4 }, // A4
      { note: 0, octave: 5 }, // C5 (minor third)
      { note: 4, octave: 5 }, // E5 (perfect fifth)
    ],
    keys: ["Digit1", "Digit2", "Digit3"],
  },
  "Bb-minor": {
    notes: [
      { note: 10, octave: 4 }, // Bb4
      { note: 1, octave: 5 }, // C#5/Db5 (minor third)
      { note: 5, octave: 5 }, // F5 (perfect fifth)
    ],
    keys: ["Digit4", "Digit5", "Digit6"],
  },
  "B-minor": {
    notes: [
      { note: 11, octave: 4 }, // B4
      { note: 2, octave: 5 }, // D5 (minor third)
      { note: 6, octave: 5 }, // F#5 (perfect fifth)
    ],
    keys: ["Digit7", "Digit8", "Digit9"],
  },
} as const;

// Update the type for chord names to include both major and minor
type ChordName = keyof typeof CHORD_MAPPINGS;

// Update createChordTaskConfig to include colorMode parameter
const createChordTaskConfig = (
  index: number,
  chordName: ChordName,
  previousChords: ChordName[] = []
): TaskConfig => {
  const mapping: KeyboardMapping = {};

  // Add mappings from previous chords
  previousChords.forEach((prevChord) => {
    CHORD_MAPPINGS[prevChord].notes.forEach((note, i) => {
      mapping[CHORD_MAPPINGS[prevChord].keys[i]] = note;
    });
  });

  // Add current chord mapping
  CHORD_MAPPINGS[chordName].notes.forEach((note, i) => {
    mapping[CHORD_MAPPINGS[chordName].keys[i]] = note;
  });

  const targetNotes = new Set(
    CHORD_MAPPINGS[chordName].notes.map((n) => `${n.note}-${n.octave}`)
  );

  // Use flat-chromatic for tasks after first two major chords and all minor chords
  const isMinorChord = chordName.includes("minor");
  const useFlat = isMinorChord || index > 2;

  return {
    id: `play-${chordName.toLowerCase()}-chord`,
    description: `Play ${chordName.replace("-", " ")} chord`,
    total: 3,
    requiredProgress: 3,
    keyboardMapping: mapping,
    colorMode: useFlat ? "flat-chromatic" : "chromatic",
    chromaticNotes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    checker: createSetChecker(targetNotes),
    previousTaskId:
      index > 0
        ? `play-${previousChords[
            previousChords.length - 1
          ].toLowerCase()}-chord`
        : null,
  };
};

export const TASKS_ON_MAJOR_CHORDS = {
  "play-c-major-chord": createChordTaskConfig(0, "C-major"),
  "play-c-sharp-major-chord": createChordTaskConfig(1, "C#-major", ["C-major"]),
  "play-d-major-chord": createChordTaskConfig(2, "D-major", [
    "C-major",
    "C#-major",
  ]),
  "play-eb-major-chord": createChordTaskConfig(3, "Eb-major", [
    "C-major",
    "C#-major",
    "D-major",
  ]),
  "play-e-major-chord": createChordTaskConfig(4, "E-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
  ]),
  "play-f-major-chord": createChordTaskConfig(5, "F-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
  ]),
  "play-f-sharp-major-chord": createChordTaskConfig(6, "F#-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
  ]),
  "play-g-major-chord": createChordTaskConfig(7, "G-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
    "F#-major",
  ]),
  "play-g-sharp-major-chord": createChordTaskConfig(8, "G#-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
    "F#-major",
    "G-major",
  ]),
  "play-a-major-chord": createChordTaskConfig(9, "A-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
    "F#-major",
    "G-major",
    "G#-major",
  ]),
  "play-bb-major-chord": createChordTaskConfig(10, "Bb-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
    "F#-major",
    "G-major",
    "G#-major",
    "A-major",
  ]),
  "play-b-major-chord": createChordTaskConfig(11, "B-major", [
    "C-major",
    "C#-major",
    "D-major",
    "Eb-major",
    "E-major",
    "F-major",
    "F#-major",
    "G-major",
    "G#-major",
    "A-major",
    "Bb-major",
  ]),
};

export const TASKS_ON_MINOR_CHORDS = {
  "play-c-minor-chord": createChordTaskConfig(0, "C-minor"),
  "play-c-sharp-minor-chord": createChordTaskConfig(1, "C#-minor", ["C-minor"]),
  "play-d-minor-chord": createChordTaskConfig(2, "D-minor", [
    "C-minor",
    "C#-minor",
  ]),
  "play-eb-minor-chord": createChordTaskConfig(3, "Eb-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
  ]),
  "play-e-minor-chord": createChordTaskConfig(4, "E-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
  ]),
  "play-f-minor-chord": createChordTaskConfig(5, "F-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
  ]),
  "play-f-sharp-minor-chord": createChordTaskConfig(6, "F#-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
  ]),
  "play-g-minor-chord": createChordTaskConfig(7, "G-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
    "F#-minor",
  ]),
  "play-g-sharp-minor-chord": createChordTaskConfig(8, "G#-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
    "F#-minor",
    "G-minor",
  ]),
  "play-a-minor-chord": createChordTaskConfig(9, "A-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
    "F#-minor",
    "G-minor",
  ]),
  "play-bb-minor-chord": createChordTaskConfig(10, "Bb-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
    "F#-minor",
    "G-minor",
    "G#-minor",
  ]),
  "play-b-minor-chord": createChordTaskConfig(11, "B-minor", [
    "C-minor",
    "C#-minor",
    "D-minor",
    "Eb-minor",
    "E-minor",
    "F-minor",
    "F#-minor",
    "G-minor",
    "G#-minor",
    "A-minor",
  ]),
};
