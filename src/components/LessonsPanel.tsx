import React, { useEffect, useState, useCallback } from "react";
import { Lesson, LESSONS } from "../data/lessons";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { Task } from "./Task";
import { TASK_CONFIGS } from "../types/tasks";
import type { TaskProgress } from "../types/tasks";

interface LessonsPanelProps {
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  taskProgress: TaskProgress[];
  activeTaskId: string | null;
  onSkipTask?: (taskId: string) => void;
}

// Memoize the Task components
const MemoizedTask = React.memo(Task);

export const LessonsPanel: React.FC<LessonsPanelProps> = React.memo(
  ({
    currentLessonId,
    onLessonChange,
    taskProgress,
    activeTaskId,
    onSkipTask,
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

    // Check if all tasks in current lesson are completed
    const allTasksCompleted = currentLesson?.taskIds.every((taskId) =>
      taskProgress.some((t) => t.taskId === taskId && t.status === "completed")
    );

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

    // Move renderContent inside the component
    const renderContent = useCallback(
      (
        content: React.ReactNode,
        taskProgress: TaskProgress[],
        currentLesson: Lesson
      ): React.ReactNode => {
        if (!React.isValidElement(content)) {
          return content;
        }

        if (content.props.children) {
          const children = React.Children.map(content.props.children, (child) =>
            renderContent(child, taskProgress, currentLesson)
          );
          return React.cloneElement(content, {}, children);
        }

        return content;
      },
      []
    );

    return (
      <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gray-900 z-20 p-8 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
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
                    className={`block w-full p-2 rounded border text-right select-none transition-all duration-300 ${
                      allTasksCompleted
                        ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                    }`}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4">
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
              {renderContent(
                currentLesson.content,
                taskProgress,
                currentLesson
              )}

              {currentLesson.taskIds.map((taskId, index) => {
                const previousTaskId =
                  index > 0 ? currentLesson.taskIds[index - 1] : null;
                const previousTaskCompleted = previousTaskId
                  ? taskProgress.some(
                      (t) =>
                        t.taskId === previousTaskId && t.status === "completed"
                    )
                  : true;

                return (
                  <MemoizedTask
                    key={taskId}
                    taskConfig={TASK_CONFIGS[taskId]}
                    progress={
                      taskProgress.find((t) => t.taskId === taskId)?.progress ??
                      0
                    }
                    status={
                      taskProgress.find((t) => t.taskId === taskId)?.status ??
                      "active"
                    }
                    previousTaskCompleted={previousTaskCompleted}
                    isActive={taskId === activeTaskId}
                    onSkip={onSkipTask}
                  />
                );
              })}

              {currentLesson.finalText &&
                currentLesson.taskIds.every((taskId) =>
                  taskProgress.some(
                    (t) => t.taskId === taskId && t.status === "completed"
                  )
                ) && (
                  <p className="mt-6 text-gray-400 italic">
                    {currentLesson.finalText}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
