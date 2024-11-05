import * as React from "react";
import * as Tone from "tone";

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
}).toDestination();

const PianoKey: React.FC<{
  note: number;
  octave: number;
  label: string;
  style: React.CSSProperties;
}> = ({ note, octave, style }) => {
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
    sampler.triggerAttackRelease(noteString, "8n");
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

export const PianoUI: React.FC = () => {
  const startOctave = 1;

  return (
    <div style={{ backgroundColor: "black", padding: "5px" }}>
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
      </div>
    </div>
  );
};
