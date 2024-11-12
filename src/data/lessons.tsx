import { BasicInlineExample } from "../components/LessonExample";
import { ChordProgression } from "../constants/progressions";

export interface LessonExample {
  id: string;
  name: string;
  type: "progression" | "fullRange" | "custom";
  data?: string;
  description: string;
}

export interface Lesson {
  id: number;
  title: string;
  content: React.ReactNode;
}

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Basic Piano Control",
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">Getting Started with Piano</h2>
        <p className="mb-4">
          Welcome to your first piano lesson! Let's start by understanding the
          basics of piano control and simple musical patterns.
        </p>

        <h3 className="text-xl font-semibold mb-3">Octave</h3>
        <p className="mb-4">
          The most important thing to understand about the piano is the octave.
          Two notes an octave apart sound similar. Not the same, but similar.
          For any note, the most similarly sounding to it are the ones octave
          apart from it.
        </p>
        <p className="mb-4">
          For that reason, we color all notes that are one or several octaves
          apart in the same color. Western music uses 12 colors.
        </p>
        <BasicInlineExample
          id="prog1"
          type="progression"
          data="C1 C2 C3 C4 C5 C6 C7 C8 C1-C2 C2-C3 C3-C4 C4-C5 C5-C6 C6-C7 C7-C8 C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8 C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="All C notes"
          description="Listen to all C notes from lowest to highest"
        />

        <h3 className="text-xl font-semibold mt-6 mb-3">Piano Range</h3>
        <p className="mb-4">
          The piano has an extensive range of notes. Let's hear all the notes
          from lowest to highest to understand the full scope of the instrument.
        </p>
        <BasicInlineExample
          id="full-range"
          type="fullRange"
          name="Full Piano Range"
          description="Experience the complete range of the piano"
        />
      </>
    ),
  },
  {
    id: 2,
    title: "Advanced Patterns",
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">Advanced Musical Patterns</h2>
        <p className="mb-4">
          Now that you're familiar with basic progressions, let's explore some
          more complex musical patterns that add color and interest to your
          playing.
        </p>

        <h3 className="text-xl font-semibold mb-3">Jazz Progressions</h3>
        <p className="mb-4">
          Jazz music often uses chromatic progressions that create tension and
          resolution in interesting ways.
        </p>
        <BasicInlineExample
          id="prog2"
          type="progression"
          data={{ chords: [0, 3, 6, 9] }}
          name="Chromatic Progression"
          description="Notice how each chord moves up by equal intervals"
        />

        <h3 className="text-xl font-semibold mt-6 mb-3">Arpeggios</h3>
        <p className="mb-4">
          Arpeggios break chords into individual notes, creating flowing melodic
          patterns.
        </p>
        <BasicInlineExample
          id="custom1"
          type="custom"
          data={[
            { note: 0, octave: 3, duration: 200 },
            { note: 4, octave: 3, duration: 200 },
            { note: 7, octave: 3, duration: 200 },
            { note: 12, octave: 4, duration: 400 },
          ]}
          name="Basic Arpeggio"
          description="A simple ascending arpeggio pattern"
        />
      </>
    ),
  },
];
