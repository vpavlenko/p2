import React, { useEffect, useState, useCallback, useRef } from "react";
import { Lesson, LESSONS } from "../data/lessons";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { Task } from "./Task";
import { TASK_CONFIGS } from "../types/tasks";
import type { TaskProgress } from "../types/tasks";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { KEY_DISPLAY_LABELS, KeyboardMapping } from "../constants/keyboard";
import { getColors } from "../utils/colors";
import { getLabelColorForNote } from "../utils/colors";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  taskKeyboardMapping?: KeyboardMapping;
}

interface LessonsPanelProps {
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  taskProgress: TaskProgress[];
  activeTaskId: string | null;
  onSkipTask?: (taskId: string) => void;
  keyboardState: KeyboardState;
}

// Memoize the Task components
const MemoizedTask = React.memo(Task);

const KEYBOARD_LAYOUT = {
  default: [
    "1 2 3 4 5 6 7 8 9 0 - =",
    "q w e r t y u i o p [ ]",
    "a s d f g h j k l ; '",
    "z x c v b n m , . /",
  ],
};

export const LessonsPanel: React.FC<LessonsPanelProps> = React.memo(
  ({
    currentLessonId,
    onLessonChange,
    taskProgress,
    activeTaskId,
    onSkipTask,
    keyboardState,
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

    // Update the getButtonTheme function
    const getButtonTheme = (keyboardState: KeyboardState) => {
      if (!activeTaskId || !keyboardState.taskKeyboardMapping) return [];

      const taskConfig = TASK_CONFIGS[activeTaskId];
      if (!taskConfig?.keyboardMapping) return [];

      const colors = getColors(0, taskConfig.colorMode || "chromatic");
      const buttonTheme: Array<{ class: string; buttons: string }> = [];

      // First, create a mapping of key labels to their notes
      const keyLabelToNote: Record<string, number> = {};
      Object.entries(taskConfig.keyboardMapping).forEach(
        ([keyCode, mapping]) => {
          const keyLabel = KEY_DISPLAY_LABELS[keyCode]?.toLowerCase();
          if (keyLabel) {
            keyLabelToNote[keyLabel] = mapping.note;
          }
        }
      );

      // Create styles for all keyboard keys
      Object.entries(KEY_DISPLAY_LABELS).forEach(([keyCode, label]) => {
        const keyLabel = label.toLowerCase();
        const note = keyLabelToNote[keyLabel];

        // If this key is mapped to a note
        if (note !== undefined) {
          const backgroundColor = colors[note];
          const textColor = getLabelColorForNote(note);
          const isActive = keyboardState.activeKeyCodes.has(keyCode);

          const className = isActive
            ? `${keyCode}-mapped key-active`
            : `${keyCode}-mapped`;

          buttonTheme.push({
            class: className,
            buttons: keyLabel,
          });

          // Add the CSS for this specific key
          addKeyStyle(keyCode, backgroundColor, textColor);
        } else {
          // For unmapped keys, use a default style
          buttonTheme.push({
            class: `${keyCode}-unmapped`,
            buttons: keyLabel,
          });

          // Add default styling for unmapped keys
          addKeyStyle(keyCode, "#444", "rgba(255, 255, 255, 0.3)");
        }
      });

      return buttonTheme;
    };

    // Update the addKeyStyle function
    const addKeyStyle = (
      keyCode: string,
      backgroundColor: string,
      textColor: string
    ) => {
      const style = document.createElement("style");
      style.textContent = `
        .simple-keyboard-base .${keyCode}-mapped,
        .simple-keyboard-base .${keyCode}-unmapped {
          background: ${backgroundColor} !important;
          color: ${textColor} !important;
        }
        .simple-keyboard-base .${keyCode}-mapped.key-active {
          background: ${backgroundColor} !important;
          color: ${textColor} !important;
          transform: scale(0.95);
        }
      `;

      // Clean up existing style
      const existingStyle = document.querySelector(
        `style[data-key="${keyCode}"]`
      );
      if (existingStyle) existingStyle.remove();

      style.setAttribute("data-key", keyCode);
      document.head.appendChild(style);
    };

    // Add this function to get display mapping
    const getDisplay = () => {
      if (!activeTaskId) return {};

      const taskConfig = TASK_CONFIGS[activeTaskId];
      if (!taskConfig?.keyboardMapping) return {};

      const display: Record<string, string> = {};

      // Initialize all possible keys as empty
      "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./"
        .split("")
        .forEach((key) => {
          display[key] = " ";
        });

      // Set only mapped keys to be visible with their labels
      Object.entries(taskConfig.keyboardMapping).forEach(([key]) => {
        const keyLabel = KEY_DISPLAY_LABELS[key]?.toLowerCase();
        if (keyLabel) {
          display[keyLabel] = keyLabel;
        }
      });

      return display;
    };

    // Add ref for content container
    const contentRef = useRef<HTMLDivElement>(null);

    // Add effect to scroll to active task when it changes
    useEffect(() => {
      if (activeTaskId && contentRef.current) {
        const activeTaskElement = contentRef.current.querySelector(
          `[data-task-id="${activeTaskId}"]`
        );

        if (activeTaskElement) {
          const containerRect = contentRef.current.getBoundingClientRect();
          const taskRect = activeTaskElement.getBoundingClientRect();
          const keyboardHeight = 200; // Height of keyboard section

          // Check if task is below the visible area or partially hidden by keyboard
          if (
            taskRect.bottom > containerRect.bottom - keyboardHeight ||
            taskRect.top > containerRect.bottom - keyboardHeight
          ) {
            activeTaskElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
    }, [activeTaskId]);

    return (
      <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
        {/* Keyboard section - moved to top */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <div className="w-full flex justify-end">
            <div className="w-[274px]">
              <Keyboard
                layout={KEYBOARD_LAYOUT}
                display={getDisplay()}
                buttonTheme={getButtonTheme(keyboardState)}
                mergeDisplay={true}
                physicalKeyboardHighlight={false}
                physicalKeyboardHighlightPress={false}
                useButtonTag={true}
                disableButtonHold={true}
                preventMouseDownDefault={true}
                baseClass="simple-keyboard-base"
                theme="hg-theme-default custom-theme"
                debug={true}
                onRender={() => {
                  console.log(
                    "[Keyboard] Rendered. DOM structure:",
                    document.querySelector(".simple-keyboard-base")?.innerHTML
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Menu Header */}
        <div className="bg-gray-900 z-20 p-8 pb-4 border-b border-gray-800">
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

        {/* Menu Overlay - Move outside of scrollable content */}
        {isMenuOpen && (
          <div className="absolute inset-0 bg-gray-900 z-30 overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>
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

        {/* Main scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative min-h-[calc(100vh-400px)]">
            <div ref={contentRef} className="p-8 pt-4">
              {currentLesson && (
                <div className="prose prose-invert">
                  {renderContent(
                    currentLesson.content,
                    taskProgress,
                    currentLesson
                  )}
                  {currentLesson.taskIds.map((taskId, index) => (
                    <MemoizedTask
                      key={taskId}
                      taskConfig={TASK_CONFIGS[taskId]}
                      data-task-id={taskId}
                      progress={
                        taskProgress.find((t) => t.taskId === taskId)
                          ?.progress ?? 0
                      }
                      status={
                        taskProgress.find((t) => t.taskId === taskId)?.status ??
                        "active"
                      }
                      previousTaskCompleted={
                        index === 0
                          ? true
                          : taskProgress.some(
                              (t) =>
                                t.taskId === currentLesson.taskIds[index - 1] &&
                                t.status === "completed"
                            )
                      }
                      isActive={taskId === activeTaskId}
                      onSkip={onSkipTask}
                    />
                  ))}
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

            {/* Gradient overlay */}
            <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
        </div>
      </div>
    );
  }
);
