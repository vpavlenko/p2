import * as React from "react";

export type Voicing = "single" | "fifth" | "major" | "diatonic";

export interface VoicingConfig {
  label: string;
  getNotes: (
    baseNote: number,
    baseOctave: number
  ) => Array<{ note: number; octave: number }>;
}

export const VOICINGS: Record<Voicing, VoicingConfig> = {
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
    label: "Major Triad",
    getNotes: (note, octave) => [
      { note, octave },
      { note: (note + 4) % 12, octave: note + 4 >= 12 ? octave + 1 : octave },
      { note: (note + 7) % 12, octave: note + 7 >= 12 ? octave + 1 : octave },
    ],
  },
  diatonic: {
    label: "Diatonic Triad",
    getNotes: (note, octave, scale) => {
      const intervals =
        scale === "major"
          ? [0, 4, 7] // Major scale intervals
          : [0, 3, 7]; // Minor scale intervals
      return intervals.map((interval) => ({
        note: (note + interval) % 12,
        octave: note + interval >= 12 ? octave + 1 : octave,
      }));
    },
  },
};

interface VoicingSidebarProps {
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
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

export const VoicingSidebar: React.FC<VoicingSidebarProps> = ({
  currentVoicing,
  onVoicingChange,
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
    <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Voicing</div>
    {(Object.entries(VOICINGS) as [Voicing, VoicingConfig][]).map(
      ([voicing, config]) => (
        <button
          key={voicing}
          onClick={() => onVoicingChange(voicing)}
          style={buttonStyle(voicing === currentVoicing)}
        >
          {config.label}
        </button>
      )
    )}
  </div>
);
