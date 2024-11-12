import React, { useEffect } from "react";
import { LESSONS } from "../data/lessons";
import { LessonExample } from "./LessonExample";
import { Voicing } from "../constants/voicings";
import { BasicInlineExample } from "./LessonExample";

interface LessonsPanelProps {
  onPlayExample: (example: LessonExample) => void;
  onStopPlaying: () => void;
  currentlyPlayingId: string | null;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = ({
  onPlayExample,
  onStopPlaying,
  currentlyPlayingId,
  currentLessonId,
  onLessonChange,
}) => {
  const currentLessonIndex = LESSONS.findIndex(
    (lesson) => lesson.id === currentLessonId
  );
  const currentLesson = LESSONS[currentLessonIndex];
  const previousLesson =
    currentLessonIndex > 0 ? LESSONS[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < LESSONS.length - 1
      ? LESSONS[currentLessonIndex + 1]
      : null;

  console.log("LessonsPanel props:", {
    onPlayExample,
    onStopPlaying,
    currentlyPlayingId,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && previousLesson) {
        onLessonChange(previousLesson.id);
      } else if (e.key === "ArrowRight" && nextLesson) {
        onLessonChange(nextLesson.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousLesson, nextLesson, onLessonChange]);

  const renderContent = (content: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(content)) {
      return content;
    }

    if (content.type === BasicInlineExample) {
      console.log("Found BasicInlineExample, injecting props");
      return React.cloneElement(content, {
        ...content.props,
        onPlayExample,
        onStopPlaying,
        currentlyPlayingId,
      });
    }

    if (content.props.children) {
      const children = React.Children.map(
        content.props.children,
        renderContent
      );
      return React.cloneElement(content, {}, children);
    }

    return content;
  };

  return (
    <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white p-8 overflow-y-auto">
      <div className="mb-8 flex flex-col gap-2">
        {previousLesson && (
          <button
            onClick={() => onLessonChange(previousLesson.id)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-left"
          >
            ← {previousLesson.title}
          </button>
        )}

        <div className="w-full p-3 bg-gray-800 rounded border border-gray-600 text-white font-medium">
          {currentLesson.title}
        </div>

        {nextLesson && (
          <button
            onClick={() => onLessonChange(nextLesson.id)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-right"
          >
            {nextLesson.title} →
          </button>
        )}
      </div>

      {currentLesson && (
        <div className="prose prose-invert">
          {renderContent(currentLesson.content)}
        </div>
      )}
    </div>
  );
};
