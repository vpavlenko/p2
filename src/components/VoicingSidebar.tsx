import * as React from "react";
import { Voicing, VOICINGS } from "../constants/voicings";

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
