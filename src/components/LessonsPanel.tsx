import React, { useEffect, useState } from "react";
import { LESSONS } from "../data/lessons";
import { LessonExample } from "./LessonExample";
import { Voicing } from "../constants/voicings";
import { BasicInlineExample } from "./LessonExample";
import { Bars3Icon } from "@heroicons/react/24/outline";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white p-8 overflow-y-auto">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex-1 flex gap-2">
            <div className={`flex-1 ${nextLesson ? "w-1/2" : "w-full"}`}>
              {previousLesson && (
                <button
                  onClick={() => onLessonChange(previousLesson.id)}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-left"
                >
                  ← {previousLesson.title}
                </button>
              )}
            </div>

            <div className={`flex-1 ${previousLesson ? "w-1/2" : "w-full"}`}>
              {nextLesson && (
                <button
                  onClick={() => onLessonChange(nextLesson.id)}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-right"
                >
                  {nextLesson.title} →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full p-4 bg-indigo-900 rounded-lg border border-indigo-700 text-white font-semibold text-center text-lg">
          {currentLesson.title}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-10 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">All Lessons</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-800 rounded"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {LESSONS.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => {
                  onLessonChange(lesson.id);
                  setIsMenuOpen(false);
                }}
                className={`p-3 rounded text-left ${
                  lesson.id === currentLessonId
                    ? "bg-indigo-900 border border-indigo-700"
                    : "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                }`}
              >
                <span className="text-gray-400 mr-2">{index + 1}.</span>
                {lesson.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentLesson && (
        <div className="prose prose-invert">
          {renderContent(currentLesson.content)}
        </div>
      )}
    </div>
  );
};
