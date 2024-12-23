import * as Tone from "tone";

// Import all audio files
import C2 from "../assets/salamander/C2.mp3";
import Ds2 from "../assets/salamander/Ds2.mp3";
import Fs2 from "../assets/salamander/Fs2.mp3";
import A2 from "../assets/salamander/A2.mp3";
import C3 from "../assets/salamander/C3.mp3";
import Ds3 from "../assets/salamander/Ds3.mp3";
import Fs3 from "../assets/salamander/Fs3.mp3";
import A3 from "../assets/salamander/A3.mp3";
import C4 from "../assets/salamander/C4.mp3";
import Ds4 from "../assets/salamander/Ds4.mp3";
import Fs4 from "../assets/salamander/Fs4.mp3";
import A4 from "../assets/salamander/A4.mp3";
import C5 from "../assets/salamander/C5.mp3";
import Ds5 from "../assets/salamander/Ds5.mp3";
import Fs5 from "../assets/salamander/Fs5.mp3";
import A5 from "../assets/salamander/A5.mp3";

let samplerLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const sampler = new Tone.Sampler({
  urls: {
    C2,
    "D#2": Ds2,
    "F#2": Fs2,
    A2,
    C3,
    "D#3": Ds3,
    "F#3": Fs3,
    A3,
    C4,
    "D#4": Ds4,
    "F#4": Fs4,
    A4,
    C5,
    "D#5": Ds5,
    "F#5": Fs5,
    A5,
  },
  onload: () => {
    console.log("Sampler loaded");
    console.log("Audio Context State:", Tone.getContext().state);
    samplerLoaded = true;
  },
}).toDestination();

const originalTriggerAttack = sampler.triggerAttack;
sampler.triggerAttack = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerAttack.apply(this, args);
};

const originalTriggerRelease = sampler.triggerRelease;
sampler.triggerRelease = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerRelease.apply(this, args);
};

export const ensureSamplerLoaded = async () => {
  if (samplerLoaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    if (sampler.loaded) {
      console.log("Sampler already loaded");
      samplerLoaded = true;
      resolve();
      return;
    }

    const checkLoaded = () => {
      if (sampler.loaded) {
        console.log("Sampler loaded successfully");
        samplerLoaded = true;
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };

    checkLoaded();
  });

  await loadingPromise;
  await Tone.start();
  console.log("Audio context started");
};

export const resumeAudioContext = async () => {
  await Tone.start();
  console.log("resuming audio context");
};
