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
  TASK_SEQUENCE,
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
  console.log("getActiveTaskId called with:", state);

  // First check for any completing tasks - they take priority
  const completingTask = state.taskProgress.find(
    (t) => t.status === "completing"
  );
  if (completingTask) {
    console.log("Found completing task:", completingTask.taskId);
    return completingTask.taskId;
  }

  // Check if current lesson is completed
  const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
  if (currentLesson) {
    const allTasksCompleted = currentLesson.taskIds.every((taskId) =>
      state.taskProgress.some(
        (t) => t.taskId === taskId && t.status === "completed"
      )
    );

    if (allTasksCompleted) {
      // Return the last task of the lesson to maintain its mapping and coloring
      return getLastTaskInLesson(currentLessonId);
    }
  }

  // Then handle pending task transitions
  if (state.pendingNextTask) {
    // If we have active keys, stay with current task
    const currentTaskId =
      state.taskProgress.find((t) => t.status === "active")?.taskId ?? null;
    if (state.activeKeysSize > 0) {
      console.log(
        "Waiting for key releases before activating:",
        state.pendingNextTask
      );
      console.log("Staying with current task:", currentTaskId);
      return currentTaskId;
    }

    // No active keys, can transition
    console.log("Activating pending task:", state.pendingNextTask);
    return state.pendingNextTask;
  }

  // Finally, find first incomplete task in sequence
  for (const taskId of TASK_SEQUENCE) {
    const taskState = state.taskProgress.find((t) => t.taskId === taskId);

    // If task doesn't exist in progress or is not completed
    if (!taskState || taskState.status === "active") {
      if (canTaskBeActivated(taskId, state.taskProgress, currentLessonId)) {
        console.log(`Activating task: ${taskId}`);
        return taskId;
      }
    }
  }

  console.log("No active task - all completed");
  return null;
};

// Add this helper function at the top level
const initializeTaskProgress = (taskId: string): TaskProgress => ({
  taskId,
  progress: 0,
  status: "active",
});

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
  >({
    "play-c-across-octaves": new Set<string>(),
    "play-d-across-octaves": new Set<string>(),
    "play-e-across-octaves": new Set<string>(),
    "play-f-across-octaves": new Set<string>(),
    "play-g-across-octaves": new Set<string>(),
    "play-a-across-octaves": new Set<string>(),
    "play-b-across-octaves": new Set<string>(),
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);
    } else {
      navigate(`${URL_PREFIX}/1`, { replace: true });
    }
  }, [lessonId, navigate]);

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

  // Add effect to initialize first task of a lesson when lesson changes
  useEffect(() => {
    const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
    if (currentLesson && currentLesson.taskIds.length > 0) {
      const firstTaskId = currentLesson.taskIds[0];

      setState((prev) => {
        // Check if task already exists
        const exists = prev.taskProgress.some((t) => t.taskId === firstTaskId);
        if (!exists) {
          return {
            ...prev,
            taskProgress: [
              ...prev.taskProgress,
              initializeTaskProgress(firstTaskId),
            ],
          };
        }
        return prev;
      });
    }
  }, [currentLessonId]);

  // Move sampler loading to an earlier useEffect
  useEffect(() => {
    const loadSampler = async () => {
      setIsLoading(true);
      await ensureSamplerLoaded();
      setSamplerReady(true);
      setIsLoading(false);
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

      console.log("playNotes called with:", { note, octave, tonic });
      console.log("Current state:", {
        taskProgress: state.taskProgress,
        activeKeys: Array.from(activeKeys),
        currentLessonId,
        state,
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

      console.log(`[releaseNotes] Releasing ${noteKey}:`, {
        activeKeys: Array.from(activeKeys),
        activeKeysSize: activeKeys.size,
        completingTask: state.taskProgress.find(
          (t) => t.status === "completing"
        )?.taskId,
      });

      // Remove from active keys first
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      // Handle task completion - but only when ALL keys are released
      const completingTask = state.taskProgress.find(
        (t) => t.status === "completing"
      );
      if (completingTask && activeKeys.size === 1) {
        // size=1 because current key hasn't been removed yet
        console.log(
          `[releaseNotes] All keys released, completing task ${completingTask.taskId}`
        );

        setState((prev) => ({
          ...prev,
          taskProgress: prev.taskProgress.map((t) =>
            t.taskId === completingTask.taskId
              ? { ...t, status: "completed" }
              : t
          ),
        }));

        const nextTaskId = getNextTaskId(completingTask.taskId);
        if (nextTaskId) {
          setState((prev) => ({
            ...prev,
            pendingNextTask: nextTaskId,
          }));
        }
      }

      // Rest of the note release logic
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
    [state.taskProgress, activeKeys.size, tonic, voicing]
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

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        taskProgress={state.taskProgress}
        activeTaskId={currentActiveTaskId}
      />
      {isLoading ? (
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
        />
      )}
    </>
  );
};
