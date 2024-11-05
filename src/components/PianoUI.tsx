import * as React from "react";
import * as Tone from "tone";
import { useState, useEffect, useCallback } from "react";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_LABELS = ["♭2", "♭3", "", "♯4", "♭6", "♭7", ""];
const NUM_OCTAVES = 7;

const KEY_WIDTH = 14;
const KEY_HEIGHT = 40;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

const COLORS: { [key: number]: string } = {
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

// Add these interfaces after the existing constants
interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
  left: number;
}

// Add these constants near the other ones
const VISUALIZATION_HEIGHT = 1000;

// Add this constant with the others
const PIXELS_PER_SECOND = 100; // Adjust this to control falling speed

// Add this constant near the other ones
const NOTE_DURATION_MS = 500; // 2 seconds note duration

// Modify the KEYBOARD_MAP to start from C2 (octave 2)
const KEYBOARD_MAP = {
  // Bottom row - octave 2
  z: { note: 0, octave: 2 }, // C2
  s: { note: 1, octave: 2 }, // C#2
  x: { note: 2, octave: 2 }, // D2
  d: { note: 3, octave: 2 }, // D#2
  c: { note: 4, octave: 2 }, // E2
  v: { note: 5, octave: 2 }, // F2
  g: { note: 6, octave: 2 }, // F#2
  b: { note: 7, octave: 2 }, // G2
  h: { note: 8, octave: 2 }, // G#2
  n: { note: 9, octave: 2 }, // A2
  j: { note: 10, octave: 2 }, // A#2
  m: { note: 11, octave: 2 }, // B2

  // Middle row - octave 3
  q: { note: 0, octave: 3 }, // C3
  "2": { note: 1, octave: 3 }, // C#3
  w: { note: 2, octave: 3 }, // D3
  "3": { note: 3, octave: 3 }, // D#3
  e: { note: 4, octave: 3 }, // E3
  r: { note: 5, octave: 3 }, // F3
  "5": { note: 6, octave: 3 }, // F#3
  t: { note: 7, octave: 3 }, // G3
  "6": { note: 8, octave: 3 }, // G#3
  y: { note: 9, octave: 3 }, // A3
  "7": { note: 10, octave: 3 }, // A#3
  u: { note: 11, octave: 3 }, // B3

  // Top row - octave 4
  i: { note: 0, octave: 4 }, // C4
  "9": { note: 1, octave: 4 }, // C#4
  o: { note: 2, octave: 4 }, // D4
  "0": { note: 3, octave: 4 }, // D#4
  p: { note: 4, octave: 4 }, // E4
  "[": { note: 5, octave: 4 }, // F4
  "=": { note: 6, octave: 4 }, // F#4
  "]": { note: 7, octave: 4 }, // G4
} as const;

// Add these arrays after KEYBOARD_MAP definition
const getKeyboardMappings = () => {
  const whiteKeys: string[] = [];
  const blackKeys: string[] = [];

  Object.entries(KEYBOARD_MAP).forEach(([key, value]) => {
    const isBlack = [1, 3, 6, 8, 10].includes(value.note);
    if (isBlack) {
      blackKeys[value.octave * 7 + Math.floor(value.note / 2)] = key;
    } else {
      whiteKeys[value.octave * 7 + Math.floor(value.note / 2)] = key;
    }
  });

  return { whiteKeys, blackKeys };
};

const { whiteKeys: WHITE_KEY_MAPPING, blackKeys: BLACK_KEY_MAPPING } =
  getKeyboardMappings();

// Add this type for tracking active keys
interface ActiveKey {
  note: number;
  octave: number;
  left: number;
}

const PianoKey: React.FC<{
  note: number;
  octave: number;
  label: string;
  style: React.CSSProperties;
  keyboardKey?: string;
  onNoteStart: (note: number, octave: number, left: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
}> = ({ note, octave, style, keyboardKey, onNoteStart, onNoteEnd }) => {
  const [isHovered, setIsHovered] = React.useState(false);

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
    onNoteStart(note, octave, parseFloat(style.left as string));
    setTimeout(() => {
      onNoteEnd(note, octave);
    }, NOTE_DURATION_MS);
  };

  const keyStyle = {
    ...style,
    backgroundColor: COLORS[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: note === 0 ? "black" : "white", // Make text black on white keys
    textShadow: note === 0 ? "none" : "0px 0px 3px black, 0px 0px 2px black",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center",
    paddingBottom: "3px",
    boxSizing: "border-box" as const,
    transform: isHovered ? "scale(1.1)" : "scale(1)",
    transition: "transform 0.1s ease-in-out",
    cursor: "pointer",
    zIndex: isHovered ? 3 : style.zIndex || 1,
  };

  return (
    <div
      style={keyStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {keyboardKey && (
        <div
          style={{
            fontSize: "8px",
            fontWeight: "bold",
            marginBottom: "2px",
            fontFamily: "monospace",
          }}
        >
          {keyboardKey}
        </div>
      )}
      {note === 1 && (
        <div
          style={{
            content: "''",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "1px",
            height: "1px",
            backgroundColor: "white",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      {note === 6 && (
        <div
          style={{
            content: "''",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "2px",
            height: "2px",
            backgroundColor: "black",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};

// Update the FallingNotes component
const FallingNotes: React.FC<{ notes: FallingNote[] }> = ({ notes }) => {
  const [time, setTime] = useState(Date.now());

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
        height: VISUALIZATION_HEIGHT,
        overflow: "hidden",
      }}
    >
      {notes.map((note) => {
        const isActive = !note.endTime;
        const timeSinceEnd = note.endTime ? (time - note.endTime) / 1000 : 0;
        const top = isActive ? 0 : timeSinceEnd * PIXELS_PER_SECOND;

        // Calculate height based on whether the note is active or finished
        const duration = isActive
          ? time - note.startTime // Growing height while active
          : note.endTime! - note.startTime; // Fixed height after end
        const height = duration * (PIXELS_PER_SECOND / 1000);

        return (
          <div
            key={note.id}
            style={{
              position: "absolute",
              left: note.left,
              top: top,
              width: KEY_WIDTH,
              height: height,
              backgroundColor: COLORS[note.note],
              borderRadius: "3px",
              willChange: "transform, height",
            }}
          />
        );
      })}
    </div>
  );
};

// Helper function to get key position
const getNotePosition = (note: number, octave: number, startOctave: number) => {
  const isBlack = [1, 3, 6, 8, 10].includes(note);
  const whiteKeysBeforeOctave = (octave - startOctave) * 7;

  // Count white keys before this note in the current octave
  const whiteKeysBefore = WHITE_KEYS.findIndex((n) => n === note);
  const totalWhiteKeys =
    whiteKeysBeforeOctave +
    (whiteKeysBefore >= 0
      ? whiteKeysBefore
      : WHITE_KEYS.filter((n) => n < note).length);

  return KEY_WIDTH * totalWhiteKeys + (isBlack ? KEY_WIDTH * 0.5 : 0);
};

// Simplified PianoUI component
export const PianoUI: React.FC = () => {
  const startOctave = 2; // Start from C2
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleNoteStart = useCallback(
    (note: number, octave: number, left: number) => {
      const newNote: FallingNote = {
        id: `${note}-${octave}-${Date.now()}`,
        note,
        octave,
        startTime: Date.now(),
        endTime: null,
        left,
      };
      setFallingNotes((prev) => [...prev, newNote]);
    },
    []
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

  // Updated keyboard event handlers
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in KEYBOARD_MAP && !activeKeys.has(key)) {
        const { note, octave } = KEYBOARD_MAP[key as keyof typeof KEYBOARD_MAP];
        const left = getNotePosition(note, octave, startOctave);

        await Tone.start();
        const noteString = `${
          ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
            note
          ]
        }${octave}`;

        // Only trigger attack on key down
        sampler.triggerAttack(noteString);

        setActiveKeys((prev) => new Set([...prev, key]));
        handleNoteStart(note, octave, left);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in KEYBOARD_MAP) {
        const { note, octave } = KEYBOARD_MAP[key as keyof typeof KEYBOARD_MAP];

        // Trigger release on key up
        const noteString = `${
          ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
            note
          ]
        }${octave}`;
        sampler.triggerRelease(noteString);

        handleNoteEnd(note, octave);
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
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
  }, [activeKeys, handleNoteStart, handleNoteEnd, startOctave]);

  // Update the cleanup interval in PianoUI component
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFallingNotes((prev) =>
        prev.filter(
          (note) =>
            now - note.startTime <
            (VISUALIZATION_HEIGHT * 1000) / PIXELS_PER_SECOND
        )
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "black",
        padding: "5px",
        height: VISUALIZATION_HEIGHT + KEY_HEIGHT + ROW_DISTANCE,
      }}
    >
      <div
        style={{
          position: "relative",
          width: WHITE_KEYS.length * KEY_WIDTH * NUM_OCTAVES,
          height: KEY_HEIGHT + ROW_DISTANCE,
        }}
      >
        {Array.from({ length: WHITE_KEYS.length * NUM_OCTAVES }, (_, i) => {
          const currentOctave = startOctave + Math.floor(i / 7);
          const keyIndex = i % 7;
          const whiteNote = WHITE_KEYS[keyIndex];
          const blackNote = BLACK_KEYS[keyIndex];

          // Find keyboard mapping for this note
          const whiteKeyMapping = Object.entries(KEYBOARD_MAP).find(
            ([_, value]) =>
              value.note === whiteNote && value.octave === currentOctave
          )?.[0];

          const blackKeyMapping =
            blackNote !== -1
              ? Object.entries(KEYBOARD_MAP).find(
                  ([_, value]) =>
                    value.note === blackNote && value.octave === currentOctave
                )?.[0]
              : undefined;

          return (
            <React.Fragment key={i}>
              <PianoKey
                note={whiteNote}
                octave={currentOctave}
                label={(keyIndex + 1).toString()}
                keyboardKey={whiteKeyMapping}
                onNoteStart={handleNoteStart}
                onNoteEnd={handleNoteEnd}
                style={{
                  top: ROW_DISTANCE,
                  left: KEY_WIDTH * i,
                  width: KEY_WIDTH,
                  height: KEY_HEIGHT,
                  borderRadius: "3px",
                }}
              />
              {blackNote !== -1 && (
                <PianoKey
                  note={blackNote}
                  octave={currentOctave}
                  label={BLACK_KEY_LABELS[keyIndex]}
                  keyboardKey={blackKeyMapping}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                  style={{
                    top: 0,
                    left: KEY_WIDTH * (i + 0.5),
                    zIndex: 2,
                    width: KEY_WIDTH,
                    height: KEY_HEIGHT,
                    borderRadius: "3px",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
        <FallingNotes notes={fallingNotes} />
      </div>
    </div>
  );
};
