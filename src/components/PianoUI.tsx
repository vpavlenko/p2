import * as React from "react";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_LABELS = ["♭2", "♭3", "", "♯4", "♭6", "♭7", ""];
const NUM_OCTAVES = 7;

const KEY_WIDTH = 14;
const KEY_HEIGHT = 40;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;
const PADDING = 0;

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

const PianoKey: React.FC<{
  note: number;
  label: string;
  style: React.CSSProperties;
}> = ({ note, label, style }) => {
  const backgroundColor = COLORS[note];
  const keyStyle = {
    ...style,
    backgroundColor,
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: "white",
    textShadow: "0px 0px 3px black, 0px 0px 2px black",
    display: "grid",
    alignContent: "end",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={keyStyle}>
      {/* {label} */}
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
  return (
    <div style={{ backgroundColor: "black", padding: "5px" }}>
      <div
        style={{
          position: "relative",
          width: WHITE_KEYS.length * KEY_WIDTH * NUM_OCTAVES,
          height: KEY_HEIGHT + ROW_DISTANCE,
        }}
      >
        {Array.from({ length: WHITE_KEYS.length * NUM_OCTAVES }, (_, i) => (
          <React.Fragment key={i}>
            <PianoKey
              note={WHITE_KEYS[i % 7]}
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
        ))}
      </div>
    </div>
  );
};
