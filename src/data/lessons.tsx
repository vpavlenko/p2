import React from "react";

export const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-6 mb-2">{children}</p>
);

export interface Lesson {
  id: number;
  title: string;
  content: React.ReactNode;
  finalText?: string;
  taskIds: string[];
}

const R = ({
  suffix,
  children,
}: {
  suffix: string;
  children: React.ReactNode;
}) => (
  <a
    href={`https://rawl.rocks/${suffix}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

const LESSONS_WITHOUT_IDS: {
  title: string;
  content: React.ReactNode;
  finalText?: string;
  taskIds: string[];
}[] = [
  {
    title: "White Keys",
    content: (
      <>
        <P>
          Welcome to Rawl Piano, the companion book to{" "}
          <R suffix="">rawl.rocks</R>. I'm gonna cover Western music theory
          using my colorful music notation.
        </P>
        <P>
          We have seven different types of white keys. Why seven? There are
          seven vibes, in a way.
        </P>
      </>
    ),
    finalText:
      "Play around with all seven keys. Then, as you're ready, go to the next lesson",
    taskIds: [
      "play-c-across-octaves",
      "play-d-across-octaves",
      "play-e-across-octaves",
      "play-f-across-octaves",
      "play-g-across-octaves",
      "play-a-across-octaves",
      "play-b-across-octaves",
    ],
  },
  {
    title: "Black Keys",
    content: (
      <>
        <P>Now let's learn about the black keys!</P>
      </>
    ),
    taskIds: [
      "play-d-again",
      "play-c-sharp",
      "play-e-again",
      "play-d-sharp",
      "play-a-again",
      "play-g-sharp",
      "play-b-again",
      "play-a-sharp",
      "play-f-again",
      "play-f-sharp",
    ],
  },
  {
    title: "Free Play",
    content: (
      <>
        <P>
          Congratulations! You've completed the lessons. Now you can freely play
          around with the piano. Try different tonics, voicings, and color
          modes!
        </P>
      </>
    ),
    taskIds: [], // No tasks for free play
  },
  {
    title: "Chromatic Sequences",
    content: (
      <>
        <P>
          Now let's play all notes in sequence! First ascending from A0, then
          descending from C8.
        </P>
        <P>
          Follow the arrows - they show which note to play next. Previous notes
          will show checkmarks.
        </P>
        <P>
          Finally, try playing the ascending sequence again using the flat
          keyboard layout - where each key is arranged in chromatic order from
          left to right.
        </P>
      </>
    ),
    taskIds: [
      "play-chromatic-ascending",
      "play-chromatic-descending",
      "play-chromatic-ascending-flat",
    ],
  },
  {
    title: "Major Second Intervals",
    content: (
      <>
        <P>
          Let's explore intervals! We'll start with major seconds - the interval
          of two semitones.
        </P>
        <P>
          First, play all notes separated by major seconds starting from A0.
          Then we'll play the complementary sequence starting from A#0.
        </P>
      </>
    ),
    taskIds: ["play-major-seconds-from-a0", "play-major-seconds-from-asharp0"],
  },
  {
    title: "Scale Modes",
    content: (
      <>
        <P>
          Let's explore different scale modes! Each row of keys maps to a
          different mode:
        </P>
        <P>
          Bottom row (Z-M): Lydian mode - like major scale but with a raised 4th
        </P>
        <P>
          Middle row (A-J): Major scale (Ionian mode) - the familiar do-re-mi
          pattern
        </P>
        <P>Top row (Q-U): Mixolydian mode - major scale with a lowered 7th</P>
        <P>Number row (1-8): Dorian mode - minor scale with a raised 6th</P>
      </>
    ),
    taskIds: [
      "play-lydian-scale",
      "play-major-scale",
      "play-mixolydian-scale",
      "play-dorian-scale",
    ],
  },
];

export const LESSONS = LESSONS_WITHOUT_IDS.map((lesson, index) => ({
  ...lesson,
  id: index + 1,
}));
