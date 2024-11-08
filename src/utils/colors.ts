import { ColorMode } from "../components/types";

export const getColors = (
  tonic: number,
  colorMode: ColorMode
): { [key: number]: string } => {
  if (colorMode === "traditional") {
    // Return traditional piano colors
    const traditionalColors: { [key: number]: string } = {};
    for (let i = 0; i < 12; i++) {
      traditionalColors[i] = [1, 3, 6, 8, 10].includes(i) ? "#222222" : "white";
    }
    return traditionalColors;
  }

  // Original chromatic colors
  const colors: { [key: number]: string } = {
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
