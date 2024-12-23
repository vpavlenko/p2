import { ColorMode } from "../components/types";

export interface NoteMapping {
  note: number;
  octave: number;
}

export type KeyboardMapping = {
  [key: string]: NoteMapping;
};

// Traditional keyboard mapping (used for traditional and chromatic modes)
export const TRADITIONAL_KEYBOARD_MAP: KeyboardMapping = {
  KeyZ: { note: 0, octave: 2 },
  KeyS: { note: 1, octave: 2 },
  KeyX: { note: 2, octave: 2 },
  KeyD: { note: 3, octave: 2 },
  KeyC: { note: 4, octave: 2 },
  KeyV: { note: 5, octave: 2 },
  KeyG: { note: 6, octave: 2 },
  KeyB: { note: 7, octave: 2 },
  KeyH: { note: 8, octave: 2 },
  KeyN: { note: 9, octave: 2 },
  KeyJ: { note: 10, octave: 2 },
  KeyM: { note: 11, octave: 2 },
  Comma: { note: 0, octave: 3 },
  KeyL: { note: 1, octave: 3 },
  Period: { note: 2, octave: 3 },
  Semicolon: { note: 3, octave: 3 },
  Slash: { note: 4, octave: 3 },
  KeyQ: { note: 5, octave: 3 },
  Digit2: { note: 6, octave: 3 },
  KeyW: { note: 7, octave: 3 },
  Digit3: { note: 8, octave: 3 },
  KeyE: { note: 9, octave: 3 },
  Digit4: { note: 10, octave: 3 },
  KeyR: { note: 11, octave: 3 },
  KeyT: { note: 0, octave: 4 },
  Digit6: { note: 1, octave: 4 },
  KeyY: { note: 2, octave: 4 },
  Digit7: { note: 3, octave: 4 },
  KeyU: { note: 4, octave: 4 },
  KeyI: { note: 5, octave: 4 },
  Digit9: { note: 6, octave: 4 },
  KeyO: { note: 7, octave: 4 },
  Digit0: { note: 8, octave: 4 },
  KeyP: { note: 9, octave: 4 },
  Minus: { note: 10, octave: 4 },
  BracketLeft: { note: 11, octave: 4 },
  BracketRight: { note: 0, octave: 5 },
} as const;

// Flat-chromatic keyboard mapping
export const FLAT_CHROMATIC_KEYBOARD_MAP: KeyboardMapping = {
  // Bottom row (Z to /) - Octave 2
  KeyZ: { note: 0, octave: 2 },
  KeyX: { note: 1, octave: 2 },
  KeyC: { note: 2, octave: 2 },
  KeyV: { note: 3, octave: 2 },
  KeyB: { note: 4, octave: 2 },
  KeyN: { note: 5, octave: 2 },
  KeyM: { note: 6, octave: 2 },
  Comma: { note: 7, octave: 2 },
  Period: { note: 8, octave: 2 },
  Slash: { note: 9, octave: 2 },

  // Middle row (A to ') - Octave 3 start
  KeyA: { note: 10, octave: 2 },
  KeyS: { note: 11, octave: 2 },
  KeyD: { note: 0, octave: 3 },
  KeyF: { note: 1, octave: 3 },
  KeyG: { note: 2, octave: 3 },
  KeyH: { note: 3, octave: 3 },
  KeyJ: { note: 4, octave: 3 },
  KeyK: { note: 5, octave: 3 },
  KeyL: { note: 6, octave: 3 },
  Semicolon: { note: 7, octave: 3 },
  Quote: { note: 8, octave: 3 },

  // Top row (Q to ]) - Octave 3/4
  KeyQ: { note: 9, octave: 3 },
  KeyW: { note: 10, octave: 3 },
  KeyE: { note: 11, octave: 3 },
  KeyR: { note: 0, octave: 4 },
  KeyT: { note: 1, octave: 4 },
  KeyY: { note: 2, octave: 4 },
  KeyU: { note: 3, octave: 4 },
  KeyI: { note: 4, octave: 4 },
  KeyO: { note: 5, octave: 4 },
  KeyP: { note: 6, octave: 4 },
  BracketLeft: { note: 7, octave: 4 },
  BracketRight: { note: 8, octave: 4 },

  // Number row (1 to =) - Octave 4/5
  Digit1: { note: 9, octave: 4 },
  Digit2: { note: 10, octave: 4 },
  Digit3: { note: 11, octave: 4 },
  Digit4: { note: 0, octave: 5 },
  Digit5: { note: 1, octave: 5 },
  Digit6: { note: 2, octave: 5 },
  Digit7: { note: 3, octave: 5 },
  Digit8: { note: 4, octave: 5 },
  Digit9: { note: 5, octave: 5 },
  Digit0: { note: 6, octave: 5 },
  Minus: { note: 7, octave: 5 },
  Equal: { note: 8, octave: 5 },
} as const;

export const getKeyboardMap = (
  colorMode: ColorMode,
  taskMapping?: KeyboardMapping
): KeyboardMapping => {
  if (taskMapping) {
    return taskMapping;
  }
  return colorMode === "flat-chromatic"
    ? FLAT_CHROMATIC_KEYBOARD_MAP
    : TRADITIONAL_KEYBOARD_MAP;
};

// Key display labels remain the same
export const KEY_DISPLAY_LABELS: { [key: string]: string } = {
  KeyZ: "z",
  KeyX: "x",
  KeyC: "c",
  KeyV: "v",
  KeyB: "b",
  KeyN: "n",
  KeyM: "m",
  Comma: ",",
  Period: ".",
  Slash: "/",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  Semicolon: ";",
  Quote: "'",
  KeyQ: "q",
  KeyW: "w",
  KeyE: "e",
  KeyR: "r",
  KeyT: "t",
  KeyY: "y",
  KeyU: "u",
  KeyI: "i",
  KeyO: "o",
  KeyP: "p",
  BracketLeft: "[",
  BracketRight: "]",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
} as const;
