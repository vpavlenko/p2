import * as React from "react";
import { useState, useEffect } from "react";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode } from "./types";
import { getColors, getLabelColorForNote } from "../utils/colors";
import {
  getKeyboardMap,
  KEY_DISPLAY_LABELS,
  KeyboardMapping,
} from "../constants/keyboard";
import { PianoControls } from "./PianoControls";
import { Voicing } from "../constants/voicings";
import { StopIcon } from "@heroicons/react/24/solid";
import { TASK_CONFIGS, TaskConfig } from "../types/tasks";
import type { TaskProgress } from "../types/tasks";
import { PianoControllerState } from "./PianoController";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_HEIGHT_MULTIPLIER = 0.65; // Black keys are 60% of total height
export const PIANO_HEIGHT = 80; // Total piano height in pixels

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
  activeTaskId: string | null;
  keyboardMapping?: KeyboardMapping;
}

// Add helper to check if a note is part of scale task mapping
const isNoteInScaleMapping = (
  note: number,
  octave: number,
  taskId: string | null,
  keyboardMapping?: KeyboardMapping
): boolean => {
  if (!taskId || !keyboardMapping || !taskId.includes("scale")) return true;

  // Check if this note/octave combination exists in the mapping
  return Object.values(keyboardMapping).some(
    (mapping) => mapping.note === note && mapping.octave === octave
  );
};

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
  activeTaskId,
  keyboardMapping,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // Get the current task's chromatic notes
  const chromaticNotes = activeTaskId
    ? TASK_CONFIGS[activeTaskId]?.chromaticNotes
    : undefined;

  // Check if this note should be colored based on scale mapping
  const shouldColorNote = isNoteInScaleMapping(
    note,
    octave,
    activeTaskId,
    keyboardMapping
  );

  // Determine which color mode to use for this note
  const effectiveColorMode = (() => {
    if (colorMode === "flat-chromatic") return "flat-chromatic";

    // For scale tasks, only color mapped notes
    if (activeTaskId?.includes("scale")) {
      return shouldColorNote && chromaticNotes?.includes(note)
        ? "chromatic"
        : "traditional";
    }

    // For other tasks, use previous logic
    return chromaticNotes?.includes(note) ? "chromatic" : "traditional";
  })();

  const colors = getColors(tonic, effectiveColorMode);
  const relativeNote = (note - tonic + 12) % 12;
  const isWhiteKey = WHITE_KEYS.includes(note);

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
    color: getLabelColorForNote(relativeNote),
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
      activeTaskId || isPressed || isHovered
        ? "transform 0.1s ease-in-out, background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out"
        : "transform 1s ease-in-out, background-color 1s ease-in-out, box-shadow 1s ease-in-out",
    cursor: "pointer",
    zIndex: isHovered ? 3 : style.zIndex || 1,
    border: effectiveColorMode === "traditional" ? "1px solid #333" : "none",
    height: (() => {
      if (effectiveColorMode === "flat-chromatic") {
        return PIANO_HEIGHT;
      }
      // For both traditional and chromatic modes
      if (effectiveColorMode === "chromatic") {
        return isWhiteKey
          ? PIANO_HEIGHT - 2
          : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER - 2;
      }
      return isWhiteKey
        ? PIANO_HEIGHT
        : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER;
    })(),
    top: (() => {
      if (effectiveColorMode === "flat-chromatic") {
        return 0;
      }
      if (effectiveColorMode === "chromatic") {
        return 1;
      }
      return 0;
      // For both traditional and chromatic modes
    })(),
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
            // fontFamily: "monospace",
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

// Update TaskIndicator component to add debug output
const TaskIndicator: React.FC<{
  noteKey?: string;
  note: number;
  octave: number;
  keyWidth: number;
  isPlayed?: boolean;
  isCurrent?: boolean;
  isSetMode?: boolean;
  colorMode: ColorMode;
}> = ({
  note,
  octave,
  keyWidth,
  isPlayed,
  isCurrent,
  isSetMode,
  colorMode,
}) => {
  const left = calculateKeyLeftPosition(note, octave, keyWidth, colorMode);

  console.log("[TaskIndicator] Rendering:", {
    note,
    octave,
    isPlayed,
    isCurrent,
    isSetMode,
    left,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: left,
        bottom: 0,
        color: isPlayed ? "#4ade80" : "white",
        fontSize: "20px",
        transform: isCurrent ? "translateY(-5px)" : "none",
        transition: "transform 0.2s ease-in-out",
        width: colorMode === "flat-chromatic" ? keyWidth * (7 / 12) : keyWidth,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isPlayed ? "✓" : isCurrent ? "↓" : ""}
    </div>
  );
};

// Update TaskIndicators to properly handle both checker types
interface TaskIndicatorsProps {
  taskConfig: TaskConfig;
  totalWidth: number;
  keyWidth: number;
  activeKeysCount: number;
  isCompleting: boolean;
  colorMode: ColorMode;
  currentIndex: number;
  playedNotes: Set<string>;
}

const TaskIndicators: React.FC<TaskIndicatorsProps> = ({
  taskConfig,
  totalWidth,
  keyWidth,
  activeKeysCount,
  isCompleting,
  colorMode,
  currentIndex,
  playedNotes,
}) => {
  // Get the current state from the checker
  const checkerState =
    taskConfig.checker.type === "sequence"
      ? taskConfig.checker.getState(currentIndex)
      : taskConfig.checker.getState(playedNotes);

  console.log("[TaskIndicators] Checker state:", {
    type: taskConfig.checker.type,
    state: checkerState,
    currentIndex,
    playedNotes,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: -30,
        left: 0,
        width: totalWidth,
        height: "30px",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {/* Release keys message */}
      {isCompleting && activeKeysCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
            whiteSpace: "nowrap",
            padding: "4px 12px",
            borderRadius: "4px",
            background: "rgba(0, 0, 0, 0.6)",
          }}
        >
          Release all keys to continue
        </div>
      )}

      {/* Only show indicators if not completing */}
      {!isCompleting && (
        <>
          {/* Show completed notes */}
          {checkerState.completedNotes.map(({ note, octave }) => {
            console.log("[TaskIndicator] Rendering completed note:", {
              note,
              octave,
            });
            return (
              <TaskIndicator
                key={`completed-${note}-${octave}`}
                note={note}
                octave={octave}
                keyWidth={keyWidth}
                isPlayed={true}
                colorMode={colorMode}
              />
            );
          })}

          {/* Show active targets */}
          {checkerState.activeTargets.map(({ note, octave }) => {
            console.log("[TaskIndicator] Rendering active target:", {
              note,
              octave,
            });
            return (
              <TaskIndicator
                key={`active-${note}-${octave}`}
                note={note}
                octave={octave}
                keyWidth={keyWidth}
                isCurrent={true}
                colorMode={colorMode}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

// Update the helper function to include white key counting logic
const calculateKeyLeftPosition = (
  noteNum: number,
  octaveNum: number,
  keyWidth: number,
  colorMode: ColorMode
): number => {
  if (colorMode === "flat-chromatic") {
    // Calculate total key count inside the function
    let keyCount = 0;
    for (let o = 0; o < octaveNum; o++) {
      keyCount += OCTAVE_RANGES[o].length;
    }
    // Add keys in current octave up to this note
    const currentOctave = OCTAVE_RANGES[octaveNum];
    keyCount += noteNum - currentOctave.start;

    return keyWidth * (7 / 12) * (keyCount + 0.5);
  }

  const isWhiteKey = WHITE_KEYS.includes(noteNum);

  // Calculate white key count
  let whiteKeyCount = 0;

  // Count white keys in previous octaves
  for (let o = 0; o < octaveNum; o++) {
    whiteKeyCount += countWhiteKeysInRange(
      OCTAVE_RANGES[o].start,
      OCTAVE_RANGES[o].length
    );
  }

  // Count white keys in current octave up to this note
  const currentOctave = OCTAVE_RANGES[octaveNum];
  const notesBeforeCurrent = noteNum - currentOctave.start;
  whiteKeyCount += countWhiteKeysInRange(
    currentOctave.start,
    notesBeforeCurrent
  );

  return keyWidth * (isWhiteKey ? whiteKeyCount : whiteKeyCount - 0.5);
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
  taskKeyboardMapping?: KeyboardMapping;
  activeTaskId: string | null;
  taskProgress: TaskProgress[];
  taskPlayedNotes: Record<string, Set<string>>;
  state: PianoControllerState;
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
  taskKeyboardMapping,
  activeTaskId,
  taskProgress,
  taskPlayedNotes,
  state,
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
      const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

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
      const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

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
  }, [
    activeKeys,
    playNotes,
    releaseNotes,
    setTonic,
    colorMode,
    taskKeyboardMapping,
  ]);

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
    activeTaskId,
  };

  const c1Left = calculateKeyLeftPosition(0, 1, keyWidth, "traditional");
  const c2Left = calculateKeyLeftPosition(0, 2, keyWidth, "traditional");

  // Modify the key rendering logic to only show relevant keys
  const getKeyboardKey = (noteNum: number, octaveNum: number) => {
    const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

    // Find the matching key for this note/octave combination
    const matchingKey = Object.entries(currentKeyboardMap).find(
      ([, value]) => value.note === noteNum && value.octave === octaveNum
    )?.[0];

    if (matchingKey) {
      return KEY_DISPLAY_LABELS[matchingKey as keyof typeof KEY_DISPLAY_LABELS];
    }
    return undefined;
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
        {activeTaskId === null && taskKeyboardMapping === undefined && (
          <ShiftIndicator totalWidth={totalWidth} />
        )}
        {activeTaskId === null && taskKeyboardMapping === undefined ? (
          <>
            <ShiftIndicator totalWidth={totalWidth} />
            <PianoControls
              tonic={tonic}
              onTonicChange={setTonic}
              colorMode={colorMode}
              onColorModeChange={onColorModeChange}
              currentVoicing={currentVoicing}
              onVoicingChange={onVoicingChange}
            />
          </>
        ) : (
          // Keep space for future UI elements
          <div style={{ height: "40px" }} />
        )}

        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);

            const commonStyleProps = {
              width:
                colorMode === "flat-chromatic" ? keyWidth * (7 / 12) : keyWidth,
              height: PIANO_HEIGHT,
              borderRadius: "0 0 5px 5px",
            };

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
                  keyboardKey={getKeyboardKey(noteNum, octaveNum)}
                  shiftedKeyboardKey={getKeyboardKey(noteNum, octaveNum)}
                  style={{
                    ...commonStyleProps,
                    width:
                      colorMode === "flat-chromatic"
                        ? keyWidth * (7 / 12)
                        : isWhiteKey
                        ? keyWidth
                        : keyWidth - 3,
                    left: calculateKeyLeftPosition(
                      noteNum,
                      octaveNum,
                      keyWidth,
                      colorMode
                    ),
                    zIndex:
                      colorMode === "flat-chromatic" ? 1 : isWhiteKey ? 1 : 2,
                  }}
                  activeTaskId={activeTaskId}
                  keyboardMapping={taskKeyboardMapping}
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
        {activeTaskId &&
          TASK_CONFIGS[activeTaskId] &&
          (() => {
            const taskConfig = {
              ...TASK_CONFIGS[activeTaskId],
              playedNotes: taskPlayedNotes[activeTaskId] || new Set(),
            };
            const isCompleting = taskProgress.some(
              (t) => t.taskId === activeTaskId && t.status === "completing"
            );

            return (
              <TaskIndicators
                taskConfig={taskConfig}
                totalWidth={totalWidth}
                keyWidth={keyWidth}
                activeKeysCount={activeKeys.size}
                isCompleting={isCompleting}
                colorMode={colorMode}
                currentIndex={state.sequenceIndices[activeTaskId] || 0}
                playedNotes={taskPlayedNotes[activeTaskId] || new Set()}
              />
            );
          })()}
      </div>
    </div>
  );
};
