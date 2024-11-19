import React from "react";
import { Task } from "../components/Task";
import { TASK_CONFIGS } from "../types/tasks";

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-6 mb-2">{children}</p>
);

export interface Lesson {
  id: number;
  title: string;
  content: React.ReactNode;
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

const MTop100 = () => <R suffix="book/intro">Musescore Top 100</R>;

const LESSONS_WITHOUT_IDS: { title: string; content: React.ReactNode }[] = [
  {
    title: "Intro",
    content: (
      <>
        <P>
          Welcome to Rawl Piano, the companion book to{" "}
          <R suffix="">rawl.rocks</R>. I'm gonna cover Western music theory
          using my colorful music notation.
        </P>
        <P>
          Our goal is to learn enough structures to be able to analyze and
          compare pieces in <MTop100 />
        </P>
        <P>
          Let's start by getting familiar with the piano. Try pressing some
          keys!
        </P>
        <Task
          taskConfig={TASK_CONFIGS["press-any-notes"]}
          nextTask={<Task taskConfig={TASK_CONFIGS["play-all-c-notes"]} />}
        />
      </>
    ),
  },
];

export const LESSONS = LESSONS_WITHOUT_IDS.map((lesson, index) => ({
  ...lesson,
  id: index + 1,
}));
