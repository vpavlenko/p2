import * as React from "react";
import * as Tone from "tone";
import { useState, useEffect, useCallback } from "react";
import { VoicingSidebar } from "./VoicingSidebar";
import { Voicing, VOICINGS } from "../constants/voicings";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode } from "./types";
import { getColors } from "../utils/colors";
import { KEYBOARD_MAP, KEY_DISPLAY_LABELS } from "../constants/keyboard";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_LABELS = ["♭2", "♭3", "", "♯4", "♭6", "♭7", ""];

const KEY_WIDTH = 25;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

// Create a Sampler instead of Piano
const sampler = new Tone.Sampler({
  urls: {
    A1: "A1.mp3",
    A2: "A2.mp3",
    A3: "A3.mp3",
    A4: "A4.mp3",
    A5: "A5.mp3",
    C2: "C2.mp3",
    C3: "C3.mp3",
    C4: "C4.mp3",
    C5: "C5.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  release: 0.5,
}).toDestination();

const PIXELS_PER_SECOND = 100;

const OCTAVE_WIDTH = KEY_WIDTH * 7; // Width of one octave
const FALLING_NOTE_WIDTH = OCTAVE_WIDTH / 6; // Width of each falling note column

const FALLING_NOTE_OFFSET = -125; // Adjust this value to align falling notes with keys

const getFallingNotePosition = (
  note: number,
  octave: number,
  startOctave: number
) => {
  const semitonesFromC0 = (octave - startOctave) * 12 + note;
  return (semitonesFromC0 * FALLING_NOTE_WIDTH) / 2 + FALLING_NOTE_OFFSET;
};

const SPECIAL_NOTE_COLORS = [0, 4, 6, 9, 11] as const;

interface PianoKeyProps {
  note: number;
  octave: number;
  label: string;
  style: React.CSSProperties;
  keyboardKey?: string;
  shiftedKeyboardKey?: string;
  onNoteStart: (note: number, octave: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
  tonic: number;
  isShiftPressed: boolean;
  scaleMode: ScaleMode;
  colorMode: ColorMode;
  playNotes: (note: number, octave: number) => Promise<void>;
  releaseNotes: (note: number, octave: number) => void;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  octave,
  style,
  keyboardKey,
  shiftedKeyboardKey,
  tonic,
  isShiftPressed,
  scaleMode,
  colorMode,
  playNotes,
  releaseNotes,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const colors = getColors(tonic, colorMode);
  const relativeNote = (note - tonic + 12) % 12;
  const isInScale = isNoteInScale(note, tonic, scaleMode);

  const handleMouseDown = async () => {
    await playNotes(note, octave);
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (isPressed) {
      releaseNotes(note, octave);
      setIsPressed(false);
    }
  };

  // Handle case where mouse leaves key while pressed
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isPressed) {
      handleMouseUp();
    }
  };

  // Add touch support for mobile devices
  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    await handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  const keyStyle = {
    ...style,
    backgroundColor: colors[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color:
      colorMode === "traditional"
        ? colors[note] === "white"
          ? "black"
          : "white" // Traditional: white keys get black text, black keys get white text
        : SPECIAL_NOTE_COLORS.includes(
            relativeNote as (typeof SPECIAL_NOTE_COLORS)[number]
          )
        ? "black"
        : "white", // Chromatic: use existing logic
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center",
    paddingBottom: "3px",
    boxSizing: "border-box" as const,
    transform: isHovered ? "scale(1.1)" : "scale(1)",
    transition: "all 0.1s ease-in-out",
    cursor: "pointer",
    zIndex: isHovered ? 3 : style.zIndex || 1,
    width: !isInScale
      ? `${parseInt(style.width as string) - NOTE_SHRINK_AMOUNT * 2}px`
      : style.width,
    height: !isInScale
      ? `${parseInt(style.height as string) - NOTE_SHRINK_AMOUNT * 2}px`
      : style.height,
    margin: !isInScale
      ? `0 ${NOTE_SHRINK_AMOUNT}px ${NOTE_SHRINK_AMOUNT}px ${NOTE_SHRINK_AMOUNT}px`
      : "0",
    ...(colorMode === "traditional" && {
      border:
        colors[note] === "white" ? "1px solid rgba(0, 0, 0, 0.8)" : "none",
      height:
        colors[note] === "white"
          ? `${KEY_HEIGHT + ROW_DISTANCE}px`
          : `${KEY_HEIGHT}px`,
      top: colors[note] === "white" ? "0" : "0",
    }),
  };

  return (
    <div
      style={keyStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {(keyboardKey || shiftedKeyboardKey) && (
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "2px",
            fontFamily: "monospace",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1px",
          }}
        >
          {isShiftPressed
            ? shiftedKeyboardKey && <div>{shiftedKeyboardKey}</div>
            : keyboardKey && <div>{keyboardKey}</div>}
        </div>
      )}
    </div>
  );
};

// Simplify getShiftedOctave by removing unused parameter
const getShiftedOctave = (octave: number, down: boolean = false): number => {
  return down ? octave - 3 : octave + 3;
};

// Add this new component for the Ctrl+letter legend
const TonicLegend: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: "-180px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "white",
      fontSize: "14px",
      textAlign: "left",
      padding: "10px",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "5px",
    }}
  >
    Press Ctrl + key
    <br />
    to change tonic
  </div>
);

// Update the ShiftIndicator component to only cover the right half
const ShiftIndicator: React.FC<{ totalWidth: number }> = ({ totalWidth }) => (
  <div
    style={{
      position: "absolute",
      top: -30,
      left: totalWidth * 0.58, // Start from the middle
      width: totalWidth * 0.42, // Only cover right half
      textAlign: "center",
      color: "white",
      fontSize: "14px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <div
      style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.3)" }}
    />
    <div>Shift</div>
    <div
      style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.3)" }}
    />
  </div>
);

type ScaleMode = "major" | "minor";

interface ScaleModeConfig {
  label: string;
  intervals: number[];
}

const SCALE_MODES: Record<ScaleMode, ScaleModeConfig> = {
  major: {
    label: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    label: "Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
};

// Add ScaleModePicker component
const ScaleModePicker: React.FC<{
  currentMode: ScaleMode;
  onModeChange: (mode: ScaleMode) => void;
}> = ({ currentMode, onModeChange }) => (
  <div
    style={{
      position: "fixed",
      right: "20px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "white",
      fontSize: "14px",
      padding: "15px",
      background: "rgba(0, 0, 0, 0.7)",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      zIndex: 1000,
    }}
  >
    <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Scale Mode</div>
    {Object.entries(SCALE_MODES).map(([mode, config]) => (
      <button
        key={mode}
        onClick={() => onModeChange(mode as ScaleMode)}
        style={{
          background:
            mode === currentMode
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          width: "150px",
          textAlign: "left",
        }}
      >
        {config.label}
      </button>
    ))}
  </div>
);

// Add this helper function near the top of the file, after SCALE_MODES
const isNoteInScale = (
  note: number,
  tonic: number,
  mode: ScaleMode
): boolean => {
  const relativeNote = (note - tonic + 12) % 12;
  return SCALE_MODES[mode].intervals.includes(relativeNote);
};

// Add this constant near the top of the file with other constants
const NOTE_SHRINK_AMOUNT = 5; // Amount to shrink on each side

// Update these constants near the top of the file
const START_OCTAVE = 0; // Changed from 2 to 0 to start at A0

// Replace the EXTRA_LOW_KEYS constant with a more structured octave range system
interface OctaveRange {
  start: number; // Starting note number (0-11, where 0 is C)
  length: number; // How many notes in this octave range
}

const OCTAVE_RANGES: { [key: number]: OctaveRange } = {
  0: { start: 9, length: 3 }, // A0, A#0, B0
  1: { start: 0, length: 12 }, // C1 to B1
  2: { start: 0, length: 12 }, // C2 to B2
  3: { start: 0, length: 12 }, // C3 to B3
  4: { start: 0, length: 12 }, // C4 to B4
  5: { start: 0, length: 12 }, // C5 to B5
  6: { start: 0, length: 12 }, // C6 to B6
  7: { start: 0, length: 12 }, // C7 to B7
  8: { start: 0, length: 1 }, // C8 only
};

// Add this helper function to count white keys in a range
const countWhiteKeysInRange = (start: number, length: number): number => {
  let count = 0;
  for (let i = 0; i < length; i++) {
    if (WHITE_KEYS.includes((start + i) % 12)) {
      count++;
    }
  }
  return count;
};

const ColorModePicker: React.FC<{
  currentMode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
}> = ({ currentMode, onModeChange }) => (
  <div
    style={{
      position: "fixed",
      left: "20px",
      top: "20px",
      color: "white",
      fontSize: "14px",
      padding: "15px",
      background: "rgba(0, 0, 0, 0.7)",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      zIndex: 1000,
    }}
  >
    <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Color Mode</div>
    {["chromatic", "traditional"].map((mode) => (
      <button
        key={mode}
        onClick={() => onModeChange(mode as ColorMode)}
        style={{
          background:
            mode === currentMode
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          width: "150px",
          textAlign: "left",
        }}
      >
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </button>
    ))}
  </div>
);

// Add this constant near the top with other constants
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const PianoUI: React.FC = () => {
  const startOctave = START_OCTAVE;
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [tonic, setTonic] = useState<number>(0); // Default tonic is C (0)

  const [voicing, setVoicing] = useState<Voicing>("single");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");

  // Add colorMode state
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");

  const handleNoteStart = useCallback(
    (note: number, octave: number, playSound: boolean = true) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      notesToPlay.forEach(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const newNote: FallingNote = {
          id: `${absoluteNote}-${o}-${Date.now()}`,
          note: absoluteNote,
          octave: o,
          startTime: Date.now(),
          endTime: null,
          left: getFallingNotePosition(absoluteNote, o, startOctave),
        };
        setFallingNotes((prev) => [...prev, newNote]);

        // Only play sound if playSound is true
        if (playSound) {
          const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
          sampler.triggerAttack(noteString);
        }
      });
    },
    [voicing, startOctave, scaleMode, tonic]
  );

  const handleNoteEnd = useCallback((note: number, octave: number) => {
    setFallingNotes((prev) =>
      prev.map((n) =>
        n.note === note && n.octave === octave && !n.endTime
          ? { ...n, endTime: Date.now() }
          : n
      )
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code in KEYBOARD_MAP) {
        const { note } = KEYBOARD_MAP[event.code as keyof typeof KEYBOARD_MAP];
        setTonic(note % 12);
        return;
      }

      if (event.code in KEYBOARD_MAP && !activeKeys.has(event.code)) {
        const { note, octave } =
          KEYBOARD_MAP[event.code as keyof typeof KEYBOARD_MAP];
        const actualOctave = event.shiftKey ? getShiftedOctave(octave) : octave;
        await playNotes(note, actualOctave);
        setActiveKeys((prev) => new Set([...prev, event.code]));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code in KEYBOARD_MAP) {
        const { note, octave } =
          KEYBOARD_MAP[event.code as keyof typeof KEYBOARD_MAP];

        // Release both normal and shifted octave notes
        const normalOctave = octave;
        const shiftedOctave = getShiftedOctave(octave);

        [normalOctave, shiftedOctave].forEach((currentOctave) => {
          releaseNotes(note, currentOctave);
        });

        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(event.code);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    activeKeys,
    handleNoteStart,
    handleNoteEnd,
    startOctave,
    voicing,
    scaleMode,
  ]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFallingNotes((prev) =>
        prev.filter((note) => {
          if (!note.endTime) return true;

          // Calculate how far the note has fallen
          const timeSinceEnd = (now - note.endTime) / 1000;
          const distanceFallen = timeSinceEnd * PIXELS_PER_SECOND;

          // Only remove notes that have fallen far beyond the viewport (e.g., 2000px below)
          return distanceFallen < 2000;
        })
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Add state to track shift key
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Add shift key tracking to useEffect
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, []);

  const totalWidth =
    Object.values(OCTAVE_RANGES).reduce(
      (total, range) =>
        total + countWhiteKeysInRange(range.start, range.length),
      0
    ) * KEY_WIDTH;

  const playNotes = useCallback(
    async (note: number, octave: number) => {
      await Tone.start();
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      notesToPlay.forEach(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerAttack(noteString);
      });

      handleNoteStart(note, octave, false);
    },
    [tonic, voicing, scaleMode, handleNoteStart]
  );

  // Add this new function alongside playNotes in PianoUI
  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      notesToRelease.forEach(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerRelease(noteString);
        handleNoteEnd(absoluteNote, o);
      });
    },
    [voicing, scaleMode, tonic, handleNoteEnd]
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <VoicingSidebar currentVoicing={voicing} onVoicingChange={setVoicing} />
      <ScaleModePicker currentMode={scaleMode} onModeChange={setScaleMode} />
      <ColorModePicker currentMode={colorMode} onModeChange={setColorMode} />
      <div
        style={{
          position: "relative",
          width: totalWidth,
          marginTop: "40px",
        }}
      >
        <ShiftIndicator totalWidth={totalWidth} />
        <TonicLegend />

        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);
            const keyIndex = WHITE_KEYS.indexOf(noteNum);
            const blackKeyIndex = BLACK_KEYS.indexOf(noteNum);

            // Calculate position based on cumulative white keys before this note
            let whiteKeyCount = 0;
            // Count white keys in previous octaves
            for (let o = 0; o < octaveNum; o++) {
              whiteKeyCount += countWhiteKeysInRange(
                OCTAVE_RANGES[o].start,
                OCTAVE_RANGES[o].length
              );
            }
            // Count white keys in current octave up to this note
            whiteKeyCount += countWhiteKeysInRange(range.start, i);

            // Find keyboard mappings
            const keyMapping = Object.entries(KEYBOARD_MAP).find(
              ([, value]) =>
                value.note === noteNum && value.octave === octaveNum
            )?.[0];

            const shiftedKeyMapping = Object.entries(KEYBOARD_MAP).find(
              ([, value]) =>
                value.note === noteNum &&
                value.octave === getShiftedOctave(octaveNum, true)
            )?.[0];

            if (isWhiteKey) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  note={noteNum}
                  octave={octaveNum}
                  label={keyIndex !== -1 ? (keyIndex + 1).toString() : ""}
                  keyboardKey={
                    keyMapping ? KEY_DISPLAY_LABELS[keyMapping] : undefined
                  }
                  shiftedKeyboardKey={
                    shiftedKeyMapping
                      ? KEY_DISPLAY_LABELS[shiftedKeyMapping]
                      : undefined
                  }
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                  tonic={tonic}
                  style={{
                    top: ROW_DISTANCE,
                    left: KEY_WIDTH * whiteKeyCount,
                    width: KEY_WIDTH,
                    height: KEY_HEIGHT,
                    borderRadius: "3px",
                  }}
                  isShiftPressed={isShiftPressed}
                  scaleMode={scaleMode}
                  colorMode={colorMode}
                  playNotes={playNotes}
                  releaseNotes={releaseNotes}
                />
              );
            } else if (blackKeyIndex !== -1) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  note={noteNum}
                  octave={octaveNum}
                  label={BLACK_KEY_LABELS[blackKeyIndex]}
                  keyboardKey={
                    keyMapping ? KEY_DISPLAY_LABELS[keyMapping] : undefined
                  }
                  shiftedKeyboardKey={
                    shiftedKeyMapping
                      ? KEY_DISPLAY_LABELS[shiftedKeyMapping]
                      : undefined
                  }
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                  tonic={tonic}
                  style={{
                    top: 0,
                    left: KEY_WIDTH * (whiteKeyCount - 0.5),
                    zIndex: 2,
                    width: KEY_WIDTH,
                    height: KEY_HEIGHT,
                    borderRadius: "3px",
                  }}
                  isShiftPressed={isShiftPressed}
                  scaleMode={scaleMode}
                  colorMode={colorMode}
                  playNotes={playNotes}
                  releaseNotes={releaseNotes}
                />
              );
            }
            return null;
          });
        })}
        <FallingNotes
          notes={fallingNotes}
          tonic={tonic}
          colorMode={colorMode}
          fallingNoteWidth={FALLING_NOTE_WIDTH}
        />
      </div>
    </div>
  );
};
