import { BasicInlineExample } from "../components/LessonExample";
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

        <h3 className="text-xl font-semibold mb-3">Basic Chord Progression</h3>
        <p className="mb-4">
          One of the most fundamental patterns in music is the I-IV-V-I
          progression. This forms the basis of countless songs across many
          genres.
        </p>
        <BasicInlineExample
          id="prog1"
          type="progression"
          data={{ chords: [0, 4, 5, 0] }}
          name="I-IV-V-I Progression"
          description="Listen to how these chords naturally flow together"
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
