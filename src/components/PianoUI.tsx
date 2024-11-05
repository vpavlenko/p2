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

// Modified to be a function that takes tonic as parameter
const getColors = (tonic: number): { [key: number]: string } => {
  const colors = {
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

const VISUALIZATION_HEIGHT = 1000;
const PIXELS_PER_SECOND = 100;
const NOTE_DURATION_MS = 500;

const BLACK_KEY_OFFSETS: { [key: number]: number } = {
  1: 0.5,
  3: 1.5,
  6: 3.5,
  8: 4.5,
  10: 5.5,
};

const KEYBOARD_MAP = {
  z: { note: 0, octave: 2 },
  s: { note: 1, octave: 2 },
  x: { note: 2, octave: 2 },
  d: { note: 3, octave: 2 },
  c: { note: 4, octave: 2 },
  v: { note: 5, octave: 2 },
  g: { note: 6, octave: 2 },
  b: { note: 7, octave: 2 },
  h: { note: 8, octave: 2 },
  n: { note: 9, octave: 2 },
  j: { note: 10, octave: 2 },
  m: { note: 11, octave: 2 },
  ",": { note: 0, octave: 3 },
  l: { note: 1, octave: 3 },
  ".": { note: 2, octave: 3 },
  ";": { note: 3, octave: 3 },
  "/": { note: 4, octave: 3 },
  q: { note: 5, octave: 3 },
  "2": { note: 6, octave: 3 },
  w: { note: 7, octave: 3 },
  "3": { note: 8, octave: 3 },
  e: { note: 9, octave: 3 },
  "4": { note: 10, octave: 3 },
  r: { note: 11, octave: 3 },
  t: { note: 0, octave: 4 },
  "6": { note: 1, octave: 4 },
  y: { note: 2, octave: 4 },
  "7": { note: 3, octave: 4 },
  u: { note: 4, octave: 4 },
  i: { note: 5, octave: 4 },
  "9": { note: 6, octave: 4 },
  o: { note: 7, octave: 4 },
  "0": { note: 8, octave: 4 },
  p: { note: 9, octave: 4 },
  "-": { note: 10, octave: 4 },
  "[": { note: 11, octave: 4 },
  "]": { note: 0, octave: 5 },
} as const;

const getNotePosition = (note: number, octave: number, startOctave: number) => {
  const isBlack = [1, 3, 6, 8, 10].includes(note);
  const octaveOffset = (octave - startOctave) * 7 * KEY_WIDTH;

  if (isBlack) {
    return octaveOffset + BLACK_KEY_OFFSETS[note] * KEY_WIDTH;
  }

  const whiteKeyIndex = WHITE_KEYS.indexOf(note);
  return octaveOffset + whiteKeyIndex * KEY_WIDTH;
};

const PianoKey: React.FC<{
  note: number;
  octave: number;
  label: string;
  style: React.CSSProperties;
  keyboardKey?: string;
  onNoteStart: (note: number, octave: number, left: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
  tonic: number;
}> = ({ note, octave, style, keyboardKey, onNoteStart, onNoteEnd, tonic }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const colors = getColors(tonic);

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
    backgroundColor: colors[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: note === tonic % 12 ? "black" : "white",
    textShadow:
      note === tonic % 12 ? "none" : "0px 0px 3px black, 0px 0px 2px black",
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
        height: VISUALIZATION_HEIGHT,
        overflow: "hidden",
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
              width: KEY_WIDTH,
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

export const PianoUI: React.FC = () => {
  const startOctave = 2;
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [tonic, setTonic] = useState<number>(0); // Default tonic is C (0)

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

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Handle tonic change with Shift key
      if (event.shiftKey && key in KEYBOARD_MAP) {
        const { note } = KEYBOARD_MAP[key as keyof typeof KEYBOARD_MAP];
        setTonic(note % 12);
        return;
      }

      if (key in KEYBOARD_MAP && !activeKeys.has(key)) {
        const { note, octave } = KEYBOARD_MAP[key as keyof typeof KEYBOARD_MAP];
        const left = getNotePosition(note, octave, startOctave);

        await Tone.start();
        const noteString = `${
          ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
            note
          ]
        }${octave}`;

        sampler.triggerAttack(noteString);
        setActiveKeys((prev) => new Set([...prev, key]));
        handleNoteStart(note, octave, left);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in KEYBOARD_MAP) {
        const { note, octave } = KEYBOARD_MAP[key as keyof typeof KEYBOARD_MAP];
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

          return (
            <React.Fragment key={i}>
              <PianoKey
                note={whiteNote}
                octave={currentOctave}
                label={(keyIndex + 1).toString()}
                keyboardKey={whiteKeyMapping}
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
              />
              {blackNote !== -1 && (
                <PianoKey
                  note={blackNote}
                  octave={currentOctave}
                  label={BLACK_KEY_LABELS[keyIndex]}
                  keyboardKey={blackKeyMapping}
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
