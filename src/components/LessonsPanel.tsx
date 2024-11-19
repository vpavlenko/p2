import React, { useEffect, useState } from "react";
import { Lesson, LESSONS, P } from "../data/lessons";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { Task } from "./Task";
import { TASK_CONFIGS } from "../types/tasks";
import { PianoControllerState } from "./PianoController";
import type { TaskProgress } from "../types/tasks";

// Add type for React element
type ReactElement = React.ReactElement<
  any,
  string | React.JSXElementConstructor<any>
>;

interface LessonsPanelProps {
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  taskProgress: TaskProgress[];
  activeTaskId: string | null;
  activeKeysCount: number;
  setState: React.Dispatch<React.SetStateAction<PianoControllerState>>;
}

const renderContent = (
  content: React.ReactNode,
  taskProgress: TaskProgress[],
  currentLesson: Lesson
): React.ReactNode => {
  console.log("renderContent called with:", {
    contentType:
      content && React.isValidElement(content)
        ? (content as ReactElement).type.name ||
          typeof (content as ReactElement).type
        : typeof content,
    isValidElement: React.isValidElement(content),
    hasChildren: React.isValidElement(content) ? content.props?.children : null,
    currentLesson: currentLesson.title,
  });

  if (!React.isValidElement(content)) {
    return content;
  }

  if (content.props.children) {
    console.log("Processing children of:", {
      contentType: content.type,
      childrenCount: React.Children.count(content.props.children),
    });
    const children = React.Children.map(content.props.children, (child) =>
      renderContent(child, taskProgress, currentLesson)
    );
    return React.cloneElement(content, {}, children);
  }

  return content;
};

export const LessonsPanel: React.FC<LessonsPanelProps> = ({
  currentLessonId,
  onLessonChange,
  taskProgress,
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
          {renderContent(currentLesson.content, taskProgress, currentLesson)}

          {currentLesson.taskIds.map((taskId, index) => {
            const previousTaskId =
              index > 0 ? currentLesson.taskIds[index - 1] : null;
            const previousTaskCompleted = previousTaskId
              ? taskProgress.some(
                  (t) => t.taskId === previousTaskId && t.status === "completed"
                )
              : true;

            console.log(`Rendering task ${taskId}:`, {
              index,
              previousTaskId,
              previousTaskCompleted,
              progress:
                taskProgress.find((t) => t.taskId === taskId)?.progress ?? 0,
              status:
                taskProgress.find((t) => t.taskId === taskId)?.status ??
                "active",
            });

            return (
              <Task
                key={taskId}
                taskConfig={TASK_CONFIGS[taskId]}
                progress={
                  taskProgress.find((t) => t.taskId === taskId)?.progress ?? 0
                }
                status={
                  taskProgress.find((t) => t.taskId === taskId)?.status ??
                  "active"
                }
                previousTaskCompleted={previousTaskCompleted}
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
  );
};
