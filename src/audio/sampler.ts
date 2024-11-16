import * as Tone from "tone";

export const sampler = new Tone.Sampler({
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

// Resume audio context when page becomes visible
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible") {
    console.log("resuming audio context");
    await Tone.context.resume();
  }
});
