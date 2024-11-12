import React from "react";
import { BasicInlineExample as E } from "../components/LessonExample";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold mb-4">{children}</h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold mb-3">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4">{children}</p>
);

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
        <H2>The octave</H2>
        <H3>Octave</H3>
        <P>
          The most important thing to understand about the piano is the octave.
          Two notes an octave apart sound similar. Not the same, but similar.
          For any note, the most similarly sounding to it are the ones octave
          apart from it.
        </P>
        <P>
          For that reason, we color all notes that are one or several octaves
          apart in the same color. Western music uses 12 colors.
        </P>
        <E data="C1 C2 C3 C4 C5 C6 C7 C8" name="All C notes" />
        <E
          data="C1 C2 C1+C2 C1-C2 C2+C3 C2-C3 C3+C4 C3-C4 C4+C5 C4-C5 C5+C6 C5-C6 C6+C7 C6-C7 C7+C8 C7-C8"
          name="Pairs of C notes"
        />
        <E
          data="C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8"
          name="Triplets of C notes"
        />
        <E
          data="C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="Other C note combos"
        />
        <P>Now let's listen to other 11 colors.</P>
        <E data="C#1 C#2 C#3 C#4 C#5 C#6 C#7" name="All C# notes" />
        <E data="D1 D2 D3 D4 D5 D6 D7" name="All D notes" />
        <E data="D#1 D#2 D#3 D#4 D#5 D#6 D#7" name="All D# notes" />
        <E data="E1 E2 E3 E4 E5 E6 E7" name="All E notes" />
        <E data="F1 F2 F3 F4 F5 F6 F7" name="All F notes" />
        <E data="F#1 F#2 F#3 F#4 F#5 F#6 F#7" name="All F# notes" />
        <E data="G1 G2 G3 G4 G5 G6 G7" name="All G notes" />
        <E data="G#1 G#2 G#3 G#4 G#5 G#6 G#7" name="All G# notes" />
        <E data="A1 A2 A3 A4 A5 A6 A7" name="All A notes" />
        <E data="A#1 A#2 A#3 A#4 A#5 A#6 A#7" name="All A# notes" />
        <E data="B1 B2 B3 B4 B5 B6 B7" name="All B notes" />
        <P>And then let's have them all together.</P>
        <E
          data="C2 C#2 D2 D#2 E2 F2 F#2 G2 G#2 A2 A#2 B2"
          name="All notes in the second octave"
        />
        <E
          data="C1-C2-C3-C4-C5-C6-C7 C#1-C#2-C#3-C#4-C#5-C#6-C#7 D1-D2-D3-D4-D5-D6-D7 D#1-D#2-D#3-D#4-D#5-D#6-D#7 E1-E2-E3-E4-E5-E6-E7 F1-F2-F3-F4-F5-F6-F7 F#1-F#2-F#3-F#4-F#5-F#6-F#7 G1-G2-G3-G4-G5-G6-G7 G#1-G#2-G#3-G#4-G#5-G#6-G#7 A1-A2-A3-A4-A5-A6-A7 A#1-A#2-A#3-A#4-A#5-A#6-A#7 B1-B2-B3-B4-B5-B6-B7 C2-C3-C4-C5-C6-C7 C#2-C#3-C#4-C#5-C#6-C#7 D2-D3-D4-D5-D6-D7 D#2-D#3-D#4-D#5-D#6-D#7 E2-E3-E4-E5-E6-E7 F2-F3-F4-F5-F6-F7 F#2-F#3-F#4-F#5-F#6-F#7 G2-G3-G4-G5-G6-G7 G#2-G#3-G#4-G#5-G#6-G#7 A2-A3-A4-A5-A6-A7 A#2-A#3-A#4-A#5-A#6-A#7 B2-B3-B4-B5-B6-B7 C3-C4-C5-C6-C7"
          name="All notes in the all octaves simultaneously"
        />
      </>
    ),
  },
  {
    id: 2,
    title: "Advanced Patterns",
    content: (
      <>
        <H2>Getting Started with Piano</H2>
        <P>
          Welcome to your first piano lesson! Let's start by understanding the
          basics of piano control and simple musical patterns.
        </P>
        <H3>Octave</H3>
        <P>
          The most important thing to understand about the piano is the octave.
          Two notes an octave apart sound similar. Not the same, but similar.
          For any note, the most similarly sounding to it are the ones octave
          apart from it.
        </P>
        <P>
          For that reason, we color all notes that are one or several octaves
          apart in the same color. Western music uses 12 colors.
        </P>
        <E
          data="C1 C2 C3 C4 C5 C6 C7 C8 C1-C2 C2-C3 C3-C4 C4-C5 C5-C6 C6-C7 C7-C8 C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8 C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="All C notes"
        />
      </>
    ),
  },
];
