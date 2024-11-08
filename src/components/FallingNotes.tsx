import React, { useState, useEffect } from "react";
import { ColorMode } from "./types";
import { getColors } from "../utils/colors";

const PIXELS_PER_SECOND = 100;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

export interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
  left: number;
}

interface FallingNotesProps {
  notes: FallingNote[];
  tonic: number;
  colorMode: ColorMode;
  fallingNoteWidth: number;
}

export const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  tonic,
  colorMode,
  fallingNoteWidth,
}) => {
  const [time, setTime] = useState(Date.now());
  const colors = getColors(tonic, colorMode);

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

        // In traditional mode, all falling notes are white
        const noteColor =
          colorMode === "traditional" ? "white" : colors[note.note];

        return (
          <div
            key={note.id}
            style={{
              position: "absolute",
              left: note.left,
              top: top,
              width: fallingNoteWidth,
              height: height,
              backgroundColor: noteColor,
              borderRadius: "3px",
              willChange: "transform, height",
            }}
          />
        );
      })}
    </div>
  );
};
