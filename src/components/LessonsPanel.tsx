import React, { useEffect, useState } from "react";
import { LESSONS } from "../data/lessons";
import { Voicing } from "../constants/voicings";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { Task } from "./Task";

interface TaskProgress {
  taskId: string;
  progress: number;
}

interface LessonsPanelProps {
  onStopPlaying: () => void;
  currentlyPlayingId: string | null;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  taskProgress: TaskProgress[];
  onTaskProgress: (taskId: string) => void;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = ({
  onStopPlaying,
  currentlyPlayingId,
  currentLessonId,
  onLessonChange,
  taskProgress,
  onTaskProgress,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const renderContent = (content: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(content)) {
      return content;
    }

    if (content.type === Task) {
      const progress =
        taskProgress.find((t) => t.taskId === content.props.id)?.progress || 0;
      return React.cloneElement(content, {
        ...content.props,
        progress,
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
      <div
        className={`mb-8 flex flex-col gap-4 ${
          isMenuOpen ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700 relative z-20 pointer-events-auto"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex-1 flex gap-2">
            <div className={`flex-1 ${nextLesson ? "w-1/2" : "w-full"}`}>
              {previousLesson && (
                <Link
                  to={`${URL_PREFIX}/${previousLesson.id}`}
                  onClick={() => onLessonChange(previousLesson.id)}
                  className="block w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-left select-none"
                >
                  ← {currentLessonIndex}. {previousLesson.title}
                </Link>
              )}
            </div>

            <div className={`flex-1 ${previousLesson ? "w-1/2" : "w-full"}`}>
              {nextLesson && (
                <Link
                  to={`${URL_PREFIX}/${nextLesson.id}`}
                  onClick={() => onLessonChange(nextLesson.id)}
                  className="block w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-right select-none"
                >
                  {currentLessonIndex + 2}. {nextLesson.title} →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="w-full text-white font-semibold text-[28px]">
          {currentLessonIndex + 1}. {currentLesson.title}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-10 overflow-y-auto">
          <div className="p-8 pt-[72px]">
            <div className="flex flex-col gap-2">
              {LESSONS.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  to={`${URL_PREFIX}/${lesson.id}`}
                  onClick={() => {
                    onLessonChange(lesson.id);
                    setIsMenuOpen(false);
                  }}
                  className={`mt-2 text-left cursor-pointer hover:text-white ${
                    lesson.id === currentLessonId
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  <span>{index + 1}. </span>
                  {lesson.title}
                </Link>
              ))}
            </div>
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
