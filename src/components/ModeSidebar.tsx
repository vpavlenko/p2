import * as React from "react";

export type PlayMode = "single" | "fifth" | "major";

export interface PlayModeConfig {
  label: string;
  getNotes: (
    baseNote: number,
    baseOctave: number
  ) => Array<{ note: number; octave: number }>;
}

export const PLAY_MODES: Record<PlayMode, PlayModeConfig> = {
  single: {
    label: "Single Note",
    getNotes: (note, octave) => [{ note, octave }],
  },
  fifth: {
    label: "With Fifth",
    getNotes: (note, octave) => [
      { note, octave },
      { note: (note + 7) % 12, octave: note + 7 >= 12 ? octave + 1 : octave },
    ],
  },
  major: {
    label: "Major Chord",
    getNotes: (note, octave) => [
      { note, octave },
      { note: (note + 4) % 12, octave: note + 4 >= 12 ? octave + 1 : octave },
      { note: (note + 7) % 12, octave: note + 7 >= 12 ? octave + 1 : octave },
    ],
  },
};

interface ModeSidebarProps {
  currentMode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
}

const buttonStyle = (isActive: boolean) => ({
  background: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
  color: "white",
  padding: "10px 15px",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "all 0.2s",
  width: "150px",
  textAlign: "left" as const,
  "&:hover": {
    background: isActive
      ? "rgba(255, 255, 255, 0.4)"
      : "rgba(255, 255, 255, 0.1)",
  },
});

export const ModeSidebar: React.FC<ModeSidebarProps> = ({
  currentMode,
  onModeChange,
}) => (
  <div
    style={{
      position: "fixed",
      left: "20px",
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
    <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Play Mode</div>
    {(Object.entries(PLAY_MODES) as [PlayMode, PlayModeConfig][]).map(
      ([mode, config]) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          style={buttonStyle(mode === currentMode)}
        >
          {config.label}
        </button>
      )
    )}
  </div>
);
