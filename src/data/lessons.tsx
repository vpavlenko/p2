import React from "react";
import { BasicInlineExample } from "../components/LessonExample";

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
        <h2 className="text-2xl font-bold mb-4">The octave</h2>

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
        <BasicInlineExample data="C1 C2 C3 C4 C5 C6 C7 C8" name="All C notes" />
        <BasicInlineExample
          data="C1 C2 C1+C2 C1-C2 C2+C3 C2-C3 C3+C4 C3-C4 C4+C5 C4-C5 C5+C6 C5-C6 C6+C7 C6-C7 C7+C8 C7-C8"
          name="Pairs of C notes"
        />
        <BasicInlineExample
          data="C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8"
          name="Triplets of C notes"
        />
        <BasicInlineExample
          data="C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="Other C note combos"
        />
      </>
    ),
  },
  {
    id: 2,
    title: "Advanced Patterns",
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
          data="C1 C2 C3 C4 C5 C6 C7 C8 C1-C2 C2-C3 C3-C4 C4-C5 C5-C6 C6-C7 C7-C8 C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8 C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="All C notes"
        />
      </>
    ),
  },
];
