import * as React from "react";
import { useState, useEffect } from "react";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode } from "./types";
import { getColors } from "../utils/colors";
import {
  getKeyboardMap,
  KEY_DISPLAY_LABELS,
  C_NOTES_KEYBOARD_MAP,
} from "../constants/keyboard";
import { PianoControls } from "./PianoControls";
import { Voicing } from "../constants/voicings";
import { StopIcon } from "@heroicons/react/24/solid";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const SPECIAL_NOTE_COLORS = [0, 4, 6, 9, 11] as const;

const BLACK_KEY_HEIGHT_MULTIPLIER = 0.65; // Black keys are 60% of total height
export const PIANO_HEIGHT = 80; // Total piano height in pixels
const WHITE_KEY_TOP_OFFSET = PIANO_HEIGHT * (1 - BLACK_KEY_HEIGHT_MULTIPLIER); // White keys start 20px from top in chromatic mode

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
  colorMode,
  playNotes,
  releaseNotes,
  isActive,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const colors = getColors(tonic, colorMode);
  const relativeNote = (note - tonic + 12) % 12;

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

  const isWhiteKey = WHITE_KEYS.includes(note);

  const keyStyle = {
    ...style,
    backgroundColor: colors[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color:
      colorMode === "traditional"
        ? isWhiteKey
          ? "black"
          : "white"
        : SPECIAL_NOTE_COLORS.includes(
            relativeNote as (typeof SPECIAL_NOTE_COLORS)[number]
          )
        ? "black"
        : "white",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center",
    paddingBottom: "3px",
    boxSizing: "border-box" as const,
    transform:
      isActive || isPressed
        ? "scale(0.9)"
        : isHovered
        ? "scale(1.1)"
        : "scale(1)",
    boxShadow:
      isActive || isPressed
        ? `0 0 10px ${
            isWhiteKey ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)"
          }`
        : "none",
    transition:
      isActive || isPressed || isHovered
        ? "all 0.1s ease-in-out" // Fast transition for interactions
        : "all 1s ease-in-out", // Slow transition for color mode changes
    cursor: "pointer",
    zIndex: isHovered ? 3 : style.zIndex || 1,
    border: colorMode === "traditional" ? "1px solid #333" : "none",
    height:
      colorMode === "flat-chromatic"
        ? PIANO_HEIGHT
        : isWhiteKey
        ? colorMode === "traditional"
          ? PIANO_HEIGHT
          : PIANO_HEIGHT - WHITE_KEY_TOP_OFFSET
        : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER,
    top:
      colorMode === "flat-chromatic"
        ? 0
        : isWhiteKey
        ? colorMode === "traditional"
          ? 0
          : WHITE_KEY_TOP_OFFSET
        : 0,
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

// Add this component definition before the Controls component
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
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  fallingNotes: FallingNote[];
  currentlyPlayingId: string | null;
  onStopPlaying: () => void;
  activeTaskId: string | null;
}

export const PianoUI: React.FC<PianoUIProps> = ({
  tonic,
  setTonic,
  colorMode,
  onColorModeChange,
  currentVoicing,
  onVoicingChange,
  playNotes,
  releaseNotes,
  fallingNotes,
  currentlyPlayingId,
  onStopPlaying,
  activeTaskId,
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
      const currentKeyboardMap = getKeyboardMap(colorMode, activeTaskId);

      if (event.ctrlKey && event.code in currentKeyboardMap) {
        const { note } =
          currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];
        setTonic(note % 12);
        return;
      }

      if (!activeKeys.has(event.code)) {
        setActiveKeys((prev) => new Set([...prev, event.code]));

        if (event.code in currentKeyboardMap) {
          const { note, octave } =
            currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];
          const actualOctave = event.shiftKey
            ? getShiftedOctave(octave)
            : octave;
          await playNotes(note, actualOctave);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const currentKeyboardMap = getKeyboardMap(colorMode, activeTaskId);

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      if (event.code in currentKeyboardMap) {
        const { note, octave } =
          currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];

        // Release both normal and shifted octave notes
        const normalOctave = octave;
        const shiftedOctave = getShiftedOctave(octave);

        [normalOctave, shiftedOctave].forEach((currentOctave) => {
          releaseNotes(note, currentOctave);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeKeys, playNotes, releaseNotes, setTonic, colorMode, activeTaskId]);

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

  const TOTAL_WHITE_KEYS = Object.values(OCTAVE_RANGES).reduce(
    (total, range) => total + countWhiteKeysInRange(range.start, range.length),
    0
  );

  const MARGIN_PX = 40; // Total horizontal margin (20px on each side)

  const calculateKeyWidth = (containerWidth: number): number => {
    return (containerWidth - MARGIN_PX) / TOTAL_WHITE_KEYS;
  };

  const [keyWidth, setKeyWidth] = useState(25); // Default fallback width

  useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth - 600; // Total width minus ControlPanel
      const newKeyWidth = calculateKeyWidth(availableWidth);
      setKeyWidth(newKeyWidth);
    };

    // Initial calculation
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalWidth = TOTAL_WHITE_KEYS * keyWidth;

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
    colorMode,
    playNotes,
    releaseNotes,
  };

  // Inside PianoUI component, before the return statement
  // Add these calculations for reference points
  const getWhiteKeyPosition = (targetOctave: number): number => {
    let whiteKeyCount = 0;
    for (let o = 0; o < targetOctave; o++) {
      whiteKeyCount += countWhiteKeysInRange(
        OCTAVE_RANGES[o].start,
        OCTAVE_RANGES[o].length
      );
    }
    return whiteKeyCount * keyWidth;
  };

  // Calculate reference points for C1 and C2
  const c1Left = getWhiteKeyPosition(1); // C1 position
  const c2Left = getWhiteKeyPosition(2); // C2 position

  // Modify the key rendering logic to only show relevant keys
  const getKeyboardKey = (
    noteNum: number,
    octaveNum: number,
    keyMapping: string | undefined
  ) => {
    const currentKeyboardMap = getKeyboardMap(colorMode, activeTaskId);

    if (activeTaskId === "play-all-c-notes") {
      const matchingKey = Object.entries(currentKeyboardMap).find(
        ([, value]) => value.note === noteNum && value.octave === octaveNum
      )?.[0];

      if (matchingKey) {
        return KEY_DISPLAY_LABELS[
          matchingKey as keyof typeof KEY_DISPLAY_LABELS
        ];
      }
      return undefined;
    }
    return keyMapping ? KEY_DISPLAY_LABELS[keyMapping] : undefined;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "600px",
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
      {currentlyPlayingId && (
        <StopIcon
          className="w-8 h-8 text-red-500 hover:text-red-400 cursor-pointer absolute bottom-4 left-4 z-50"
          onClick={onStopPlaying}
        />
      )}
      <div
        style={{
          position: "relative",
          width: totalWidth,
          marginTop: "40px",
          marginLeft: MARGIN_PX / 2,
          marginRight: MARGIN_PX / 2,
        }}
      >
        <ShiftIndicator totalWidth={totalWidth} />
        <PianoControls
          tonic={tonic}
          onTonicChange={setTonic}
          colorMode={colorMode}
          onColorModeChange={onColorModeChange}
          currentVoicing={currentVoicing}
          onVoicingChange={onVoicingChange}
        />

        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);

            // Calculate position based on cumulative keys before this note
            let keyCount = 0;
            let whiteKeyCount = 0;

            // Count keys in previous octaves
            for (let o = 0; o < octaveNum; o++) {
              keyCount += OCTAVE_RANGES[o].length;
              // Count white keys in previous octaves
              whiteKeyCount += countWhiteKeysInRange(
                OCTAVE_RANGES[o].start,
                OCTAVE_RANGES[o].length
              );
            }
            // Count keys in current octave up to this note
            keyCount += i;
            // Count white keys in current octave up to this note
            whiteKeyCount += countWhiteKeysInRange(range.start, i);

            // Find keyboard mappings
            const keyMapping = Object.entries(getKeyboardMap(colorMode)).find(
              ([, value]) =>
                value.note === noteNum && value.octave === octaveNum
            )?.[0];

            const shiftedKeyMapping = Object.entries(
              getKeyboardMap(colorMode)
            ).find(
              ([, value]) =>
                value.note === noteNum &&
                value.octave === getShiftedOctave(octaveNum, true)
            )?.[0];

            const commonStyleProps = {
              width:
                colorMode === "flat-chromatic"
                  ? keyWidth * (7 / 12) // Adjust width to fit 12 keys in the space of 7
                  : keyWidth,
              height: PIANO_HEIGHT,
              borderRadius: "0 0 5px 5px",
            };

            // In flat-chromatic mode, render all keys. In other modes, use existing logic
            if (
              colorMode === "flat-chromatic" ||
              isWhiteKey ||
              BLACK_KEYS.indexOf(noteNum) !== -1
            ) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  {...commonKeyProps}
                  note={noteNum}
                  octave={octaveNum}
                  isActive={isNoteActive(noteNum, octaveNum)}
                  keyboardKey={getKeyboardKey(noteNum, octaveNum, keyMapping)}
                  shiftedKeyboardKey={getKeyboardKey(
                    noteNum,
                    octaveNum,
                    shiftedKeyMapping
                  )}
                  style={{
                    ...commonStyleProps,
                    width:
                      colorMode === "flat-chromatic"
                        ? keyWidth * (7 / 12) // Slight gap between keys
                        : isWhiteKey
                        ? keyWidth
                        : keyWidth - 3,
                    left:
                      colorMode === "flat-chromatic"
                        ? keyWidth * (7 / 12) * (keyCount + 0.5)
                        : keyWidth *
                          (isWhiteKey ? whiteKeyCount : whiteKeyCount - 0.5),
                    zIndex:
                      colorMode === "flat-chromatic" ? 1 : isWhiteKey ? 1 : 2,
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
          fallingNoteWidth={(keyWidth / 6) * 7}
          referencePoints={{
            c1: { note: 12, left: c1Left },
            c2: { note: 24, left: c2Left },
          }}
        />
      </div>
    </div>
  );
};
