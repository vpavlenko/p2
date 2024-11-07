import * as React from "react";
import * as Tone from "tone";
import { useState, useEffect, useCallback } from "react";
import { VoicingSidebar } from "./VoicingSidebar";
import { Voicing, VOICINGS } from "../constants/voicings";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_LABELS = ["♭2", "♭3", "", "♯4", "♭6", "♭7", ""];
const NUM_OCTAVES = 6;

const KEY_WIDTH = 28;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

// Modified colors type definition
const getColors = (tonic: number): { [key: number]: string } => {
  const colors: { [key: number]: string } = {
    0: "white",
    1: "rgb(130, 0, 0)",
    2: "red",
    3: "#007000",
    4: "#00fb47",
    5: "#9500b3",
    6: "#ea7eff",
    7: "rgb(120, 120, 120)",
    8: "rgb(0, 0, 255)",
    9: "#03b9d5",
    10: "#ff7328",
    11: "#ff0",
  };

  // Rotate colors based on tonic
  const rotatedColors: { [key: number]: string } = {};
  for (let i = 0; i < 12; i++) {
    rotatedColors[i] = colors[(i - tonic + 12) % 12];
  }
  return rotatedColors;
};

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

interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
  left: number;
}

const PIXELS_PER_SECOND = 100;
const NOTE_DURATION_MS = 500;

const KEYBOARD_MAP = {
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

const KEY_DISPLAY_LABELS: { [key: string]: string } = {
  KeyZ: "z",
  KeyS: "s",
  KeyX: "x",
  KeyD: "d",
  KeyC: "c",
  KeyV: "v",
  KeyG: "g",
  KeyB: "b",
  KeyH: "h",
  KeyN: "n",
  KeyJ: "j",
  KeyM: "m",
  Comma: ",",
  KeyL: "l",
  Period: ".",
  Semicolon: ";",
  Slash: "/",
  KeyQ: "q",
  Digit2: "2",
  KeyW: "w",
  Digit3: "3",
  KeyE: "e",
  Digit4: "4",
  KeyR: "r",
  KeyT: "t",
  Digit6: "6",
  KeyY: "y",
  Digit7: "7",
  KeyU: "u",
  KeyI: "i",
  Digit9: "9",
  KeyO: "o",
  Digit0: "0",
  KeyP: "p",
  Minus: "-",
  BracketLeft: "[",
  BracketRight: "]",
} as const;

const OCTAVE_WIDTH = KEY_WIDTH * 7; // Width of one octave
const FALLING_NOTE_WIDTH = OCTAVE_WIDTH / 6; // Width of each falling note column

const getFallingNotePosition = (
  note: number,
  octave: number,
  startOctave: number
) => {
  const semitonesFromC0 = (octave - startOctave) * 12 + note;
  return (semitonesFromC0 * FALLING_NOTE_WIDTH) / 2;
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
}

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  octave,
  style,
  keyboardKey,
  shiftedKeyboardKey,
  onNoteStart,
  onNoteEnd,
  tonic,
  isShiftPressed,
  scaleMode,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const colors = getColors(tonic);
  const relativeNote = (note - tonic + 12) % 12;
  const isInScale = isNoteInScale(note, tonic, scaleMode);

  const getNoteString = (noteNum: number, octave: number) => {
    const notes = [
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
    ];
    return `${notes[noteNum]}${octave}`;
  };

  const handleClick = async () => {
    await Tone.start();
    const noteString = getNoteString(note, octave);
    sampler.triggerAttackRelease(noteString, NOTE_DURATION_MS / 1000);
    onNoteStart(note, octave);
    setTimeout(() => {
      onNoteEnd(note, octave);
    }, NOTE_DURATION_MS);
  };

  const keyStyle = {
    ...style,
    backgroundColor: colors[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: SPECIAL_NOTE_COLORS.includes(
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
    margin: !isInScale ? `${NOTE_SHRINK_AMOUNT}px` : "0",
  };

  return (
    <div
      style={keyStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
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

const FallingNotes: React.FC<{ notes: FallingNote[]; tonic: number }> = ({
  notes,
  tonic,
}) => {
  const [time, setTime] = useState(Date.now());
  const colors = getColors(tonic);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTime(Date.now());
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: KEY_HEIGHT + ROW_DISTANCE,
        left: 0,
        right: 0,
        bottom: -2000,
      }}
    >
      {notes.map((note) => {
        const isActive = !note.endTime;
        const timeSinceEnd = note.endTime ? (time - note.endTime) / 1000 : 0;
        const top = isActive ? 0 : timeSinceEnd * PIXELS_PER_SECOND;

        const duration = isActive
          ? time - note.startTime
          : note.endTime! - note.startTime;
        const height = duration * (PIXELS_PER_SECOND / 1000);

        return (
          <div
            key={note.id}
            style={{
              position: "absolute",
              left: note.left,
              top: top,
              width: FALLING_NOTE_WIDTH,
              height: height,
              backgroundColor: colors[note.note],
              borderRadius: "3px",
              willChange: "transform, height",
            }}
          />
        );
      })}
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
      left: totalWidth / 2, // Start from the middle
      width: totalWidth / 2, // Only cover right half
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
const NOTE_SHRINK_AMOUNT = 7; // Amount to shrink on each side

export const PianoUI: React.FC = () => {
  const startOctave = 2;
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [tonic, setTonic] = useState<number>(0); // Default tonic is C (0)

  const [voicing, setVoicing] = useState<Voicing>("single");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");

  const handleNoteStart = useCallback(
    (note: number, octave: number) => {
      // Calculate note relative to tonic
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      notesToPlay.forEach(({ note: n, octave: o }) => {
        // Convert back to absolute note
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

        // Play the note with sampler
        const noteString = `${
          ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
            absoluteNote
          ]
        }${o}`;
        sampler.triggerAttack(noteString);
      });
    },
    [voicing, startOctave, scaleMode, tonic] // Add tonic to dependencies
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

        await Tone.start();

        // Calculate note relative to tonic
        const relativeNote = (note - tonic + 12) % 12;
        const notesToPlay = VOICINGS[voicing].getNotes(
          relativeNote,
          actualOctave,
          scaleMode
        );

        // Play all notes for the current mode
        notesToPlay.forEach(({ note: n, octave: o }) => {
          const absoluteNote = (n + tonic) % 12;
          const noteString = `${
            ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
              absoluteNote
            ]
          }${o}`;
          sampler.triggerAttack(noteString);
        });

        setActiveKeys((prev) => new Set([...prev, event.code]));
        handleNoteStart(note, actualOctave);
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
          // Calculate note relative to tonic, just like in handleKeyDown
          const relativeNote = (note - tonic + 12) % 12;
          const notesToRelease = VOICINGS[voicing].getNotes(
            relativeNote,
            currentOctave,
            scaleMode // Pass the scale mode
          );

          notesToRelease.forEach(({ note: n, octave: o }) => {
            // Convert back to absolute note
            const absoluteNote = (n + tonic) % 12;
            const noteString = `${
              ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
                absoluteNote
              ]
            }${o}`;
            sampler.triggerRelease(noteString);
            handleNoteEnd(absoluteNote, o); // Use absolute note here too
          });
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

  const totalWidth = WHITE_KEYS.length * KEY_WIDTH * NUM_OCTAVES;

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
      <div
        style={{
          position: "relative",
          width: totalWidth,
          marginTop: "40px",
        }}
      >
        <ShiftIndicator totalWidth={totalWidth} />
        <TonicLegend />
        {Array.from({ length: WHITE_KEYS.length * NUM_OCTAVES }, (_, i) => {
          const currentOctave = startOctave + Math.floor(i / 7);
          const keyIndex = i % 7;
          const whiteNote = WHITE_KEYS[keyIndex];
          const blackNote = BLACK_KEYS[keyIndex];

          // Find normal key mapping
          const whiteKeyMapping = Object.entries(KEYBOARD_MAP).find(
            ([, value]) =>
              value.note === whiteNote && value.octave === currentOctave
          )?.[0];

          const blackKeyMapping =
            blackNote !== -1
              ? Object.entries(KEYBOARD_MAP).find(
                  ([, value]) =>
                    value.note === blackNote && value.octave === currentOctave
                )?.[0]
              : undefined;

          // Find shifted key mappings (3 octaves LOWER to trigger HIGHER notes)
          const shiftedWhiteKeyMapping = Object.entries(KEYBOARD_MAP).find(
            ([, value]) =>
              value.note === whiteNote &&
              value.octave === getShiftedOctave(currentOctave, true)
          )?.[0];

          const shiftedBlackKeyMapping =
            blackNote !== -1
              ? Object.entries(KEYBOARD_MAP).find(
                  ([, value]) =>
                    value.note === blackNote &&
                    value.octave === getShiftedOctave(currentOctave, true)
                )?.[0]
              : undefined;

          return (
            <React.Fragment key={i}>
              <PianoKey
                note={whiteNote}
                octave={currentOctave}
                label={(keyIndex + 1).toString()}
                keyboardKey={
                  whiteKeyMapping
                    ? KEY_DISPLAY_LABELS[whiteKeyMapping]
                    : undefined
                }
                shiftedKeyboardKey={
                  shiftedWhiteKeyMapping
                    ? KEY_DISPLAY_LABELS[shiftedWhiteKeyMapping]
                    : undefined
                }
                onNoteStart={handleNoteStart}
                onNoteEnd={handleNoteEnd}
                tonic={tonic}
                style={{
                  top: ROW_DISTANCE,
                  left: KEY_WIDTH * i,
                  width: KEY_WIDTH,
                  height: KEY_HEIGHT,
                  borderRadius: "3px",
                }}
                isShiftPressed={isShiftPressed}
                scaleMode={scaleMode}
              />
              {blackNote !== -1 && (
                <PianoKey
                  note={blackNote}
                  octave={currentOctave}
                  label={BLACK_KEY_LABELS[keyIndex]}
                  keyboardKey={
                    blackKeyMapping
                      ? KEY_DISPLAY_LABELS[blackKeyMapping]
                      : undefined
                  }
                  shiftedKeyboardKey={
                    shiftedBlackKeyMapping
                      ? KEY_DISPLAY_LABELS[shiftedBlackKeyMapping]
                      : undefined
                  }
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                  tonic={tonic}
                  style={{
                    top: 0,
                    left: KEY_WIDTH * (i + 0.5),
                    zIndex: 2,
                    width: KEY_WIDTH,
                    height: KEY_HEIGHT,
                    borderRadius: "3px",
                  }}
                  isShiftPressed={isShiftPressed}
                  scaleMode={scaleMode}
                />
              )}
            </React.Fragment>
          );
        })}
        <FallingNotes notes={fallingNotes} tonic={tonic} />
      </div>
    </div>
  );
};
