import React from "react";
import { LESSONS, LessonExample } from "../data/lessons";
import { Voicing } from "../constants/voicings";
import { BasicInlineExample, InlineExampleProps } from "./LessonExample";

interface LessonsPanelProps {
  onPlayExample: (example: LessonExample) => void;
  onStopPlaying: () => void;
  isPlaying: boolean;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = ({
  onPlayExample,
  onStopPlaying,
  isPlaying,
  currentLessonId,
  onLessonChange,
}) => {
  const currentLesson = LESSONS.find((lesson) => lesson.id === currentLessonId);

  return (
    <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white p-8 overflow-y-auto">
      <div className="mb-8">
        <select
          value={currentLessonId}
          onChange={(e) => onLessonChange(Number(e.target.value))}
          className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
        >
          {LESSONS.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {currentLesson && (
        <div className="prose prose-invert">
          {React.Children.map(currentLesson.content, (child) => {
            if (
              React.isValidElement(child) &&
              child.type === BasicInlineExample
            ) {
              return React.cloneElement(
                child as React.ReactElement<InlineExampleProps>,
                {
                  isPlaying,
                  onPlay: onPlayExample,
                  onStop: onStopPlaying,
                }
              );
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};
