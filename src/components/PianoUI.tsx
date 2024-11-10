import * as React from "react";
import { useState, useEffect } from "react";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode } from "./types";
import { getColors } from "../utils/colors";
import { KEYBOARD_MAP, KEY_DISPLAY_LABELS } from "../constants/keyboard";
import { isNoteInScale, ScaleMode } from "../constants/scales";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const KEY_WIDTH = 25;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

const OCTAVE_WIDTH = KEY_WIDTH * 7; // Width of one octave
const FALLING_NOTE_WIDTH = OCTAVE_WIDTH / 6; // Width of each falling note column

const SPECIAL_NOTE_COLORS = [0, 4, 6, 9, 11] as const;

interface PianoKeyProps {
  note: number;
  octave: number;
  style: React.CSSProperties;
  keyboardKey?: string;
  shiftedKeyboardKey?: string;
  onNoteStart: (note: number, octave: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
  tonic: number;
  isShiftPressed: boolean;
  scaleMode: ScaleMode;
  colorMode: ColorMode;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  isActive: boolean;
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
  isActive,
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

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isPressed) {
      handleMouseUp();
    }
  };

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
    transform:
      isActive || isPressed
        ? "scale(0.95)"
        : isHovered
        ? "scale(1.1)"
        : "scale(1)",
    boxShadow:
      isActive || isPressed
        ? `0 0 10px ${
            colors[note] === "white"
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(255, 255, 255, 0.5)"
          }`
        : "none",
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

const getShiftedOctave = (octave: number, down: boolean = false): number => {
  return down ? octave - 3 : octave + 3;
};

const TonicLegend: React.FC<{ totalWidth: number }> = () => (
  <div
    style={{
      position: "absolute",
      top: -30,
      left: 0,
      textAlign: "center",
      color: "white",
      fontSize: "14px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <div>Press Ctrl + key to change tonic</div>
  </div>
);

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

// Add this constant near the top of the file with other constants
const NOTE_SHRINK_AMOUNT = 5; // Amount to shrink on each side

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

interface PianoUIProps {
  tonic: number;
  setTonic: (tonic: number) => void;
  scaleMode: ScaleMode;
  colorMode: ColorMode;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  fallingNotes: FallingNote[];
}

export const PianoUI: React.FC<PianoUIProps> = ({
  tonic,
  setTonic,
  scaleMode,
  colorMode,
  playNotes,
  releaseNotes,
  fallingNotes,
}) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [activeNotes, setActiveNotes] = useState<
    Array<{ note: number; octave: number }>
  >([]);

  const isNoteActive = (note: number, octave: number) => {
    return activeNotes.some(
      (activeNote) => activeNote.note === note && activeNote.octave === octave
    );
  };

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
  }, [activeKeys, playNotes, releaseNotes, setTonic]);

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

  useEffect(() => {
    const currentlyPlaying = fallingNotes
      .filter((note) => !note.endTime)
      .map((note) => ({
        note: note.note,
        octave: note.octave,
      }));
    setActiveNotes(currentlyPlaying);
  }, [fallingNotes]);

  const totalWidth =
    Object.values(OCTAVE_RANGES).reduce(
      (total, range) =>
        total + countWhiteKeysInRange(range.start, range.length),
      0
    ) * KEY_WIDTH;

  const commonKeyProps: Omit<
    PianoKeyProps,
    | "note"
    | "octave"
    | "style"
    | "keyboardKey"
    | "shiftedKeyboardKey"
    | "isActive"
  > = {
    onNoteStart: playNotes,
    onNoteEnd: releaseNotes,
    tonic,
    isShiftPressed,
    scaleMode,
    colorMode,
    playNotes,
    releaseNotes,
  };

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
      <div
        style={{
          position: "relative",
          width: totalWidth,
          marginTop: "40px",
        }}
      >
        <ShiftIndicator totalWidth={totalWidth} />
        <TonicLegend totalWidth={totalWidth} />

        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);
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

            const commonStyleProps = {
              width: KEY_WIDTH,
              height: KEY_HEIGHT,
              borderRadius: "3px",
            };

            if (isWhiteKey) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  {...commonKeyProps}
                  note={noteNum}
                  octave={octaveNum}
                  isActive={isNoteActive(noteNum, octaveNum)}
                  keyboardKey={
                    keyMapping ? KEY_DISPLAY_LABELS[keyMapping] : undefined
                  }
                  shiftedKeyboardKey={
                    shiftedKeyMapping
                      ? KEY_DISPLAY_LABELS[shiftedKeyMapping]
                      : undefined
                  }
                  style={{
                    ...commonStyleProps,
                    top: ROW_DISTANCE,
                    left: KEY_WIDTH * whiteKeyCount,
                  }}
                />
              );
            } else if (blackKeyIndex !== -1) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  {...commonKeyProps}
                  note={noteNum}
                  octave={octaveNum}
                  isActive={isNoteActive(noteNum, octaveNum)}
                  keyboardKey={
                    keyMapping ? KEY_DISPLAY_LABELS[keyMapping] : undefined
                  }
                  shiftedKeyboardKey={
                    shiftedKeyMapping
                      ? KEY_DISPLAY_LABELS[shiftedKeyMapping]
                      : undefined
                  }
                  style={{
                    ...commonStyleProps,
                    top: 0,
                    left: KEY_WIDTH * (whiteKeyCount - 0.5),
                    zIndex: 2,
                  }}
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
