import React, { useState, useCallback, useEffect } from "react";
import { PianoUI } from "./PianoUI";
import { Voicing } from "../constants/voicings";
import { ColorMode } from "./types";
import { VOICINGS } from "../constants/voicings";
import { sampler } from "../audio/sampler";
import { FallingNote } from "./FallingNotes";
import { LessonsPanel } from "./LessonsPanel";
import { immediate } from "tone";
import { useParams, useNavigate } from "react-router-dom";
import { LESSONS } from "../data/lessons";
import { URL_PREFIX } from "../constants/routes";
import {
  TASK_CONFIGS,
  canTaskBeActivated,
  getNextTaskId,
} from "../types/tasks";
import { ensureSamplerLoaded } from "../audio/sampler";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

interface TaskProgress {
  taskId: string;
  progress: number;
  status: "active" | "completing" | "completed";
}

export interface PianoControllerState {
  taskProgress: Array<{
    taskId: string;
    progress: number;
    status: "active" | "completing" | "completed";
  }>;
  pendingTaskCompletion: string | null;
  activeKeysSize: number;
  pendingNextTask: string | null;
  lastKeyReleaseTime?: number;
}

const getLastTaskInLesson = (lessonId: number): string | null => {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson || !lesson.taskIds.length) return null;
  return lesson.taskIds[lesson.taskIds.length - 1];
};

const getActiveTaskId = (
  state: PianoControllerState,
  currentLessonId: number
): string | null => {
  console.log("[getActiveTaskId] Called with:", {
    taskProgress: state.taskProgress,
    currentLessonId,
    pendingNextTask: state.pendingNextTask,
  });

  const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
  if (!currentLesson) {
    console.log("No lesson found for id:", currentLessonId);
    return null;
  }

  // Check if this is the free play lesson
  if (currentLesson.taskIds.length === 0) {
    return null;
  }

  // First check for any completing tasks - they take priority
  const completingTask = state.taskProgress.find(
    (t) => t.status === "completing"
  );
  if (completingTask) {
    console.log("Found completing task:", completingTask.taskId);
    return completingTask.taskId;
  }

  // Check if current lesson is completed
  const allTasksCompleted = currentLesson.taskIds.every((taskId) =>
    state.taskProgress.some(
      (t) => t.taskId === taskId && t.status === "completed"
    )
  );

  if (allTasksCompleted) {
    console.log("All tasks completed in lesson:", currentLessonId);
    return getLastTaskInLesson(currentLessonId);
  }

  // Then handle pending task transitions
  if (state.pendingNextTask) {
    if (state.activeKeysSize > 0) {
      const currentTaskId =
        state.taskProgress.find((t) => t.status === "active")?.taskId ?? null;
      console.log(
        "Waiting for key releases before activating:",
        state.pendingNextTask
      );
      console.log("Staying with current task:", currentTaskId);
      return currentTaskId;
    }

    console.log("Activating pending task:", state.pendingNextTask);
    return state.pendingNextTask;
  }

  // First check if there's already an active task
  const activeTask = state.taskProgress.find((t) => t.status === "active");
  if (activeTask && currentLesson.taskIds.includes(activeTask.taskId)) {
    console.log("Found existing active task:", activeTask.taskId);
    return activeTask.taskId;
  }

  // Find first incomplete task in current lesson
  for (const taskId of currentLesson.taskIds) {
    console.log("Checking task:", taskId);
    const taskState = state.taskProgress.find((t) => t.taskId === taskId);
    console.log("Task state:", taskState);

    // If task doesn't exist or is not completed
    if (!taskState || taskState.status !== "completed") {
      if (canTaskBeActivated(taskId, state.taskProgress, currentLessonId)) {
        console.log(`Activating task: ${taskId}`);
        return taskId;
      }
    }
  }

  console.log("No active task found - all completed");
  return null;
};

// Add this helper function at the top level
const initializeTaskProgress = (taskId: string): TaskProgress => ({
  taskId,
  progress: 0,
  status: "active",
});

// Update the clearTaskProgressForOtherLessons function
const clearTaskProgressForOtherLessons = (
  taskProgress: TaskProgress[],
  currentLessonId: number
): TaskProgress[] => {
  const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
  if (!currentLesson) return taskProgress;

  // Keep only tasks from the current lesson
  const filtered = taskProgress.filter((t) =>
    currentLesson.taskIds.includes(t.taskId)
  );

  // If there are no tasks in progress for this lesson, initialize the first task
  if (filtered.length === 0 && currentLesson.taskIds.length > 0) {
    return [
      {
        taskId: currentLesson.taskIds[0],
        progress: 0,
        status: "active",
      },
    ];
  }

  return filtered;
};

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [voicing, setVoicing] = useState<Voicing>("single");
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [playbackTimeouts, setPlaybackTimeouts] = useState<number[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [state, setState] = useState<PianoControllerState>({
    taskProgress: [],
    pendingTaskCompletion: null,
    activeKeysSize: 0,
    pendingNextTask: null,
  });
  const [taskPlayedNotes, setTaskPlayedNotes] = useState<
    Record<string, Set<string>>
  >(() => {
    // Initialize for all tasks across all lessons
    const allTasks = LESSONS.reduce((acc, lesson) => {
      return [...acc, ...lesson.taskIds];
    }, [] as string[]);

    return allTasks.reduce(
      (acc, taskId) => ({
        ...acc,
        [taskId]: new Set<string>(),
      }),
      {}
    );
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    console.log("[lessonChange] Changing to lesson:", parsedId);

    if (parsedId === currentLessonId) {
      return;
    }

    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);

      // Clear task progress and initialize first task if needed
      setState((prev) => {
        const clearedProgress = clearTaskProgressForOtherLessons(
          prev.taskProgress,
          parsedId
        );

        return {
          ...prev,
          taskProgress: clearedProgress,
          pendingNextTask: null, // Reset pending tasks when changing lessons
          pendingTaskCompletion: null,
        };
      });

      // Reset task played notes for the new lesson
      const currentLesson = LESSONS.find((l) => l.id === parsedId);
      if (currentLesson) {
        setTaskPlayedNotes((prev) => {
          const newState = { ...prev };
          currentLesson.taskIds.forEach((taskId) => {
            newState[taskId] = new Set<string>();
          });
          return newState;
        });
      }
    } else {
      if (parsedId !== 1) {
        navigate(`${URL_PREFIX}/1`, { replace: true });
      }
    }
  }, [lessonId, navigate, currentLessonId]);

  // Add effect to sync activeKeysSize
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      activeKeysSize: activeKeys.size,
    }));
  }, [activeKeys.size]);

  const incrementTaskProgress = useCallback(
    (taskId: string, note: number, octave: number) => {
      const taskConfig = TASK_CONFIGS[taskId];
      if (!taskConfig) {
        console.log("No task config found for:", taskId);
        return;
      }

      const noteKey = `${note}-${octave}`;
      const taskNotes = taskPlayedNotes[taskId];
      const shouldIncrement = taskConfig.checkProgress(note, octave, taskNotes);

      console.log(`[incrementTaskProgress] Task ${taskId}:`, {
        noteKey,
        shouldIncrement,
        currentProgress:
          state.taskProgress.find((t) => t.taskId === taskId)?.progress || 0,
        total: taskConfig.total,
      });

      if (shouldIncrement) {
        setTaskPlayedNotes((prev) => ({
          ...prev,
          [taskId]: new Set([...prev[taskId], noteKey]),
        }));

        setState((prev) => {
          const existingTask = prev.taskProgress.find(
            (t) => t.taskId === taskId
          );
          const currentProgress = existingTask?.progress ?? 0;
          const newProgress = currentProgress + 1;

          return {
            ...prev,
            taskProgress: existingTask
              ? prev.taskProgress.map((t) =>
                  t.taskId === taskId
                    ? {
                        ...t,
                        progress: newProgress,
                        status:
                          newProgress >= taskConfig.total
                            ? "completing"
                            : "active",
                      }
                    : t
                )
              : [
                  ...prev.taskProgress,
                  { taskId, progress: 1, status: "active" },
                ],
          };
        });
      }
    },
    [taskPlayedNotes]
  );

  // Move sampler loading to an earlier useEffect
  useEffect(() => {
    const loadSampler = async () => {
      await ensureSamplerLoaded();
      setSamplerReady(true);
    };

    loadSampler();
  }, []);

  // Update playNotes to handle loading state
  const playNotes = useCallback(
    async (note: number, octave: number) => {
      if (!samplerReady) {
        console.log("Sampler not ready yet, ignoring note");
        return [];
      }

      console.log("[playNotes] Called with:", { note, octave, tonic });
      console.log("[playNotes] Current state:", {
        taskProgress: state.taskProgress,
        activeKeys: Array.from(activeKeys),
        currentLessonId,
        state,
        taskPlayedNotes,
      });

      const relativeNote = (note - tonic + 12) % 12;
      console.log("Calculated relative note:", relativeNote);

      const notesToPlay = VOICINGS[voicing].getNotes(relativeNote, octave);
      console.log("Notes to play:", notesToPlay);

      // Check progress for active task
      const activeTaskId = getActiveTaskId(state, currentLessonId);
      console.log("Active task check:", {
        activeTaskId,
        currentLessonId,
        taskProgressLength: state.taskProgress.length,
        stateTaskProgressLength: state.taskProgress.length,
      });

      if (activeTaskId) {
        console.log("Incrementing progress for task:", activeTaskId);
        // Initialize task if it doesn't exist
        setState((prev) => {
          console.log(
            "Current task progress before update:",
            prev.taskProgress
          );
          if (!prev.taskProgress.some((t) => t.taskId === activeTaskId)) {
            console.log("Initializing new task:", activeTaskId);
            return {
              ...prev,
              taskProgress: [
                ...prev.taskProgress,
                initializeTaskProgress(activeTaskId),
              ],
            };
          }
          return prev;
        });
        incrementTaskProgress(activeTaskId, note, octave);
      }

      const playedNotes = notesToPlay.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerAttack(noteString, immediate());

        // Create falling note
        const newNote: FallingNote = {
          id: `${absoluteNote}-${o}-${Date.now()}`,
          note: absoluteNote,
          octave: o,
          startTime: Date.now(),
          endTime: null,
        };

        setFallingNotes((prev) => [...prev, newNote]);

        return { note: absoluteNote, octave: o };
      });

      // Add to active keys
      setActiveKeys((prev) => new Set([...prev, `${note}-${octave}`]));

      return playedNotes;
    },
    [
      samplerReady,
      tonic,
      voicing,
      incrementTaskProgress,
      state,
      currentLessonId,
    ]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const noteKey = `${note}-${octave}`;
      console.log(
        `[releaseNotes] Releasing ${noteKey}, active keys: ${activeKeys.size}`
      );

      // Remove from active keys
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      // Handle note release logic
      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(relativeNote, octave);

      return notesToRelease.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerRelease(noteString);

        setFallingNotes((prev) =>
          prev.map((n) => {
            if (n.note === absoluteNote && n.octave === o && !n.endTime) {
              return { ...n, endTime: Date.now() };
            }
            return n;
          })
        );

        return { note: absoluteNote, octave: o };
      });
    },
    [tonic, voicing]
  );

  const stopProgression = useCallback(() => {
    console.log("stopProgression called, current ID:", currentlyPlayingId);
    setCurrentlyPlayingId(null);

    // Get all currently playing notes from falling notes
    const playingNotes = fallingNotes
      .filter((note) => !note.endTime)
      .map(({ note, octave }) => ({ note, octave }));

    console.log("Releasing notes:", playingNotes);

    // Release each note properly through the releaseNotes function
    playingNotes.forEach(({ note, octave }) => {
      releaseNotes(note, octave);
    });

    // Clear all scheduled timeouts
    playbackTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    setPlaybackTimeouts([]);
  }, [playbackTimeouts, fallingNotes, releaseNotes]);

  const handleLessonChange = useCallback(
    (lessonId: number) => {
      setCurrentLessonId(lessonId);
      navigate(`${URL_PREFIX}/${lessonId}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleSpaceKey = (e: KeyboardEvent) => {
      // Only handle space if there's something playing and it's not part of input
      if (
        e.code === "Space" &&
        currentlyPlayingId &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault(); // Prevent page scroll
        stopProgression();
      }
    };

    window.addEventListener("keydown", handleSpaceKey);
    return () => window.removeEventListener("keydown", handleSpaceKey);
  }, [currentlyPlayingId, stopProgression]);

  // Keep the effect for transitioning to next task when keys are released
  useEffect(() => {
    if (state.pendingNextTask && activeKeys.size === 0) {
      console.log(
        "All keys released, finalizing task transition to:",
        state.pendingNextTask
      );
      setState((prev) => ({
        ...prev,
        pendingNextTask: null, // Clear the pending state
      }));
    }
  }, [state.pendingNextTask, activeKeys.size]);

  // Add this effect to initialize new tasks
  useEffect(() => {
    if (state.pendingNextTask) {
      setState((prev) => {
        // Check if task already exists
        const exists = prev.taskProgress.some(
          (t) => t.taskId === state.pendingNextTask
        );
        if (!exists && state.pendingNextTask) {
          // Initialize the new task
          return {
            ...prev,
            taskProgress: [
              ...prev.taskProgress,
              {
                taskId: state.pendingNextTask,
                progress: 0,
                status: "active",
              } as TaskProgress, // Explicitly type as TaskProgress
            ],
          };
        }
        return prev;
      });
    }
  }, [state.pendingNextTask]);

  // Get the current active task ID
  const currentActiveTaskId = getActiveTaskId(state, currentLessonId);

  // Add debug logging for keyboard events
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      console.log("Key down event:", {
        code: event.code,
        key: event.key,
        activeTaskId: currentActiveTaskId,
        taskMapping: currentActiveTaskId
          ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
          : undefined,
      });

      // ... rest of key handling
    },
    [currentActiveTaskId]
  );

  // Add effect to attach keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Add this effect to reset taskPlayedNotes when lesson changes
  useEffect(() => {
    console.log("[taskPlayedNotes] Resetting for lesson:", currentLessonId);
    const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
    if (currentLesson) {
      setTaskPlayedNotes((prev) => {
        const newState = { ...prev };
        currentLesson.taskIds.forEach((taskId) => {
          newState[taskId] = new Set<string>();
        });
        return newState;
      });
    }
  }, [currentLessonId]);

  // Add this effect near other effects in PianoController
  useEffect(() => {
    console.log("[activeKeys effect] Size changed:", {
      size: activeKeys.size,
      completingTask: state.taskProgress.find((t) => t.status === "completing")
        ?.taskId,
    });

    // If we have no active keys and a completing task, it's time to complete
    if (activeKeys.size === 0) {
      const completingTask = state.taskProgress.find(
        (t) => t.status === "completing"
      );
      if (completingTask) {
        console.log(
          "[activeKeys effect] Completing task:",
          completingTask.taskId
        );

        setState((prev) => {
          const nextTaskId = getNextTaskId(completingTask.taskId);
          return {
            ...prev,
            taskProgress: prev.taskProgress.map((t) =>
              t.taskId === completingTask.taskId
                ? { ...t, status: "completed" }
                : t
            ),
            pendingNextTask: nextTaskId,
          };
        });
      }
    }
  }, [activeKeys.size]); // Only depend on activeKeys.size

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        taskProgress={state.taskProgress}
        activeTaskId={currentActiveTaskId}
      />
      {!samplerReady ? (
        <div className="fixed top-0 left-[600px] right-0 bottom-0 bg-black flex items-center justify-center text-white">
          Loading piano sounds...
        </div>
      ) : (
        <PianoUI
          tonic={tonic}
          setTonic={setTonic}
          colorMode={
            currentActiveTaskId
              ? TASK_CONFIGS[currentActiveTaskId]?.colorMode || colorMode
              : colorMode
          }
          onColorModeChange={setColorMode}
          currentVoicing={voicing}
          onVoicingChange={setVoicing}
          playNotes={playNotes}
          releaseNotes={releaseNotes}
          fallingNotes={fallingNotes}
          currentlyPlayingId={currentlyPlayingId}
          onStopPlaying={stopProgression}
          taskKeyboardMapping={
            currentActiveTaskId
              ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
              : undefined
          }
          activeTaskId={currentActiveTaskId}
          taskPlayedNotes={taskPlayedNotes}
        />
      )}
    </>
  );
};
