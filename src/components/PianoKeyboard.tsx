import React, { useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { KEY_DISPLAY_LABELS, KeyboardMapping } from "../constants/keyboard";
import { getColors, getLabelColorForNote } from "../utils/colors";
import { TASK_CONFIGS } from "../types/tasks";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  taskKeyboardMapping?: KeyboardMapping;
}

interface PianoKeyboardProps {
  keyboardState: KeyboardState;
  activeTaskId: string | null;
}

const KEYBOARD_LAYOUT = {
  default: [
    "1 2 3 4 5 6 7 8 9 0 - =",
    "q w e r t y u i o p [ ]",
    "a s d f g h j k l ; '",
    "z x c v b n m , . /",
  ],
};

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  keyboardState,
  activeTaskId,
}) => {
  // Function to manage keyboard styles
  const updateKeyStyles = (
    keyCode: string,
    backgroundColor: string,
    textColor: string,
    isActive: boolean = false
  ) => {
    const styleId = `keyboard-style-${keyCode}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const activeStyles = isActive
      ? `
        .simple-keyboard-base .${keyCode}-mapped.key-active {
          background: ${backgroundColor} !important;
          color: ${textColor} !important;
          transform: scale(0.8);
        }`
      : "";

    styleEl.textContent = `
      .simple-keyboard-base .${keyCode}-mapped {
        background: ${backgroundColor} !important;
        color: ${textColor} !important;
      }
      ${activeStyles}
    `;
  };

  // Function to get button themes
  const getButtonTheme = (keyboardState: KeyboardState) => {
    if (!activeTaskId || !keyboardState.taskKeyboardMapping) return [];

    const taskConfig = TASK_CONFIGS[activeTaskId];
    if (!taskConfig?.keyboardMapping) return [];

    const colors = getColors(0, taskConfig.colorMode || "chromatic");
    const buttonTheme: Array<{ class: string; buttons: string }> = [];

    // Create mapping of key labels to notes
    const keyLabelToNote: Record<string, number> = {};
    Object.entries(taskConfig.keyboardMapping).forEach(([keyCode, mapping]) => {
      const keyLabel = KEY_DISPLAY_LABELS[keyCode]?.toLowerCase();
      if (keyLabel) {
        keyLabelToNote[keyLabel] = mapping.note;
      }
    });

    // Apply styles for all keyboard keys
    Object.entries(KEY_DISPLAY_LABELS).forEach(([keyCode, label]) => {
      const keyLabel = label.toLowerCase();
      const note = keyLabelToNote[keyLabel];
      const isActive = keyboardState.activeKeyCodes.has(keyCode);

      if (note !== undefined) {
        const backgroundColor = colors[note];
        const textColor = getLabelColorForNote(note);

        updateKeyStyles(keyCode, backgroundColor, textColor, isActive);

        buttonTheme.push({
          class: `${keyCode}-mapped${isActive ? " key-active" : ""}`,
          buttons: keyLabel,
        });
      } else {
        updateKeyStyles(keyCode, "#444", "rgba(255, 255, 255, 0.3)");
        buttonTheme.push({
          class: `${keyCode}-unmapped`,
          buttons: keyLabel,
        });
      }
    });

    return buttonTheme;
  };

  // Function to get display mapping
  const getDisplay = () => {
    if (!activeTaskId) return {};

    const taskConfig = TASK_CONFIGS[activeTaskId];
    if (!taskConfig?.keyboardMapping) return {};

    const display: Record<string, string> = {};
    const keys = "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./";

    // Initialize all keys as empty
    keys.split("").forEach((key) => {
      display[key] = " ";
    });

    // Set mapped keys to be visible
    Object.entries(taskConfig.keyboardMapping).forEach(([key]) => {
      const keyLabel = KEY_DISPLAY_LABELS[key]?.toLowerCase();
      if (keyLabel) {
        display[keyLabel] = keyLabel;
      }
    });

    return display;
  };

  // Cleanup styles on unmount
  useEffect(() => {
    return () => {
      Object.keys(KEY_DISPLAY_LABELS).forEach((keyCode) => {
        const styleEl = document.getElementById(`keyboard-style-${keyCode}`);
        if (styleEl) {
          styleEl.remove();
        }
      });
    };
  }, []);

  return (
    <div className="w-[290px]">
      <Keyboard
        layout={KEYBOARD_LAYOUT}
        display={getDisplay()}
        buttonTheme={getButtonTheme(keyboardState)}
        mergeDisplay={true}
        physicalKeyboardHighlight={false}
        physicalKeyboardHighlightPress={false}
        useButtonTag={true}
        disableButtonHold={true}
        preventMouseDownDefault={true}
        baseClass="simple-keyboard-base"
        theme="hg-theme-default custom-theme"
      />
    </div>
  );
};
