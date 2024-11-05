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
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  release: 1,
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
const FALLING_SPEED = 0.1; // pixels per millisecond
const VISUALIZATION_HEIGHT = 1000;

// Add this constant with the others
const PIXELS_PER_SECOND = 100; // Adjust this to control falling speed

const PianoKey: React.FC<{
  note: number;
  octave: number;
  label: string;
  style: React.CSSProperties;
  onNoteStart: (note: number, octave: number, left: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
}> = ({ note, octave, style, onNoteStart, onNoteEnd }) => {
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
    sampler.triggerAttackRelease(noteString, "1n");
    onNoteStart(note, octave, parseFloat(style.left as string));
    setTimeout(() => {
      onNoteEnd(note, octave);
    }, 2000); // Match this with the note duration
  };

  const keyStyle = {
    ...style,
    backgroundColor: COLORS[note],
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: "white",
    textShadow: "0px 0px 3px black, 0px 0px 2px black",
    display: "grid",
    alignContent: "end",
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

        // Calculate height starting from 0, growing as time passes
        const duration = time - note.startTime;
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
              opacity: 0.7,
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
  const startOctave = 1;
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);

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

          return (
            <React.Fragment key={i}>
              <PianoKey
                note={WHITE_KEYS[i % 7]}
                octave={currentOctave}
                label={((i % 7) + 1).toString()}
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
              {BLACK_KEYS[i % 7] !== -1 && (
                <PianoKey
                  note={BLACK_KEYS[i % 7]}
                  octave={currentOctave}
                  label={BLACK_KEY_LABELS[i % 7]}
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
