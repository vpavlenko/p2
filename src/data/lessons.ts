import { ChordProgression } from "../constants/progressions";
import { Voicing } from "../constants/voicings";

export interface LessonExample {
  id: string;
  name: string;
  type: "progression" | "fullRange" | "custom";
  data?:
    | ChordProgression
    | Array<{ note: number; octave: number; duration: number }>;
  description: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  recommendedVoicing: Voicing;
  examples: LessonExample[];
}

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Basic Piano Control",
    description: "Learn the basics of piano control with simple examples",
    recommendedVoicing: "single",
    examples: [
      {
        id: "prog1",
        name: "Simple Progression",
        type: "progression",
        data: { chords: [0, 4, 5, 0] }, // C-F-G-C progression
        description: "A basic I-IV-V-I progression",
      },
      {
        id: "full-range",
        name: "Full Range",
        type: "fullRange",
        description: "Play all notes from lowest to highest",
      },
    ],
  },
  {
    id: 2,
    title: "Advanced Patterns",
    description: "Explore more complex musical patterns",
    recommendedVoicing: "triad",
    examples: [
      {
        id: "prog2",
        name: "Jazz Progression",
        type: "progression",
        data: { chords: [0, 3, 6, 9] }, // Chromatic progression
        description: "A chromatic progression with triads",
      },
      {
        id: "custom1",
        name: "Arpeggio Pattern",
        type: "custom",
        data: [
          { note: 0, octave: 3, duration: 200 },
          { note: 4, octave: 3, duration: 200 },
          { note: 7, octave: 3, duration: 200 },
          { note: 12, octave: 4, duration: 400 },
        ],
        description: "Simple arpeggio pattern",
      },
    ],
  },
];
