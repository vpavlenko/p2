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
  isTaskCompleted,
  canTaskBeActivated,
  getNextTaskId,
} from "../types/tasks";

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

const getActiveTaskId = (state: PianoControllerState): string | null => {
  console.log("getActiveTaskId called with:", state);

  // First check for any completing tasks - they take priority
  const completingTask = state.taskProgress.find(
    (t) => t.status === "completing"
  );
  if (completingTask) {
    console.log("Found completing task:", completingTask.taskId);
    return completingTask.taskId;
  }

  // Then handle pending task transitions
  if (state.pendingNextTask && state.activeKeysSize > 0) {
    const currentTaskId = state.taskProgress[0]?.taskId;
    console.log(
      "Waiting for key releases before activating:",
      state.pendingNextTask
    );
    console.log("Staying with current task:", currentTaskId);
    return currentTaskId;
  }

  if (state.pendingNextTask && state.activeKeysSize === 0) {
    console.log("Activating pending task:", state.pendingNextTask);
    return state.pendingNextTask;
  }

  // Finally, find first incomplete task in sequence
  for (const taskId of TASK_SEQUENCE) {
    const taskProgress =
      state.taskProgress.find((t) => t.taskId === taskId)?.progress || 0;

    if (
      !isTaskCompleted(taskId, taskProgress) &&
      canTaskBeActivated(taskId, state.taskProgress)
    ) {
      console.log(`Activating task: ${taskId}`);
      return taskId;
    }
  }

  console.log("No active task - all completed");
  return null;
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
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [taskPlayedNotes, setTaskPlayedNotes] = useState<
    Record<string, Set<string>>
  >({
    "play-c-across-octaves": new Set<string>(),
    "play-d-across-octaves": new Set<string>(),
    "play-e-across-octaves": new Set<string>(),
    "press-any-notes": new Set<string>(),
    "play-all-c-notes": new Set<string>(),
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pendingTaskCompletion] = useState<string | null>(null);
  const [state, setState] = useState<PianoControllerState>({
    taskProgress: [],
    pendingTaskCompletion: null,
    activeKeysSize: 0,
    pendingNextTask: null,
  });
  const [pendingKeyReleases, setPendingKeyReleases] = useState<Set<string>>(
    new Set()
  );

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);
    } else {
      navigate(`${URL_PREFIX}/1`, { replace: true });
    }
  }, [lessonId, navigate]);

  // Add an effect to sync taskProgress with state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      taskProgress,
      activeKeysSize: activeKeys.size,
    }));
  }, [taskProgress, activeKeys.size]);

  const incrementTaskProgress = useCallback(
    (taskId: string, note: number, octave: number) => {
      const taskConfig = TASK_CONFIGS[taskId];
      if (!taskConfig) return;

      const noteKey = `${note}-${octave}`;
      const taskNotes = taskPlayedNotes[taskId];
      const shouldIncrement = taskConfig.checkProgress(note, octave, taskNotes);

      console.log(`[incrementTaskProgress] Task ${taskId}:`, {
        noteKey,
        shouldIncrement,
        currentProgress:
          taskProgress.find((t) => t.taskId === taskId)?.progress || 0,
        total: taskConfig.total,
      });

      if (shouldIncrement) {
        setPendingKeyReleases((prev) => {
          const next = new Set([...prev, noteKey]);
          console.log(
            "[setPendingKeyReleases] New pending releases:",
            Array.from(next)
          );
          return next;
        });

        setTaskPlayedNotes((prev) => ({
          ...prev,
          [taskId]: new Set([...prev[taskId], noteKey]),
        }));

        setTaskProgress((prev) => {
          const existingTask = prev.find((t) => t.taskId === taskId);
          const newProgress = existingTask?.progress + 1 || 1;

          console.log(`[setTaskProgress] Updating task ${taskId}:`, {
            currentProgress: existingTask?.progress || 0,
            newProgress,
            willComplete: newProgress >= taskConfig.total,
            currentStatus: existingTask?.status,
            newStatus:
              newProgress >= taskConfig.total ? "completing" : "active",
          });

          return existingTask
            ? prev.map((t) =>
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
            : [...prev, { taskId, progress: 1, status: "active" }];
        });
      }
    },
    [taskPlayedNotes, taskProgress]
  );

  const playNotes = useCallback(
    async (note: number, octave: number) => {
      console.log("playNotes called with:", { note, octave, tonic });
      const relativeNote = (note - tonic + 12) % 12;
      console.log("Calculated relative note:", relativeNote);

      const notesToPlay = VOICINGS[voicing].getNotes(relativeNote, octave);
      console.log("Notes to play:", notesToPlay);

      // Check progress for active task
      const activeTaskId = getActiveTaskId(state);
      if (activeTaskId) {
        console.log("Incrementing progress for task:", activeTaskId);
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
      tonic,
      voicing,
      incrementTaskProgress,
      taskProgress,
      pendingTaskCompletion,
      activeKeys,
    ]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const noteKey = `${note}-${octave}`;

      console.log(`[releaseNotes] Releasing ${noteKey}:`, {
        pendingReleases: Array.from(pendingKeyReleases),
        pendingReleasesSize: pendingKeyReleases.size,
        activeKeys: Array.from(activeKeys),
        activeKeysSize: activeKeys.size,
        completingTask: state.taskProgress.find(
          (t) => t.status === "completing"
        )?.taskId,
      });

      // Remove from pending releases
      setPendingKeyReleases((prev) => {
        const next = new Set(prev);
        next.delete(noteKey);
        console.log("[setPendingKeyReleases] After release:", Array.from(next));
        return next;
      });

      // Check if this was the last key release for a completing task
      if (pendingKeyReleases.size === 1) {
        // Current key hasn't been removed yet
        const completingTask = state.taskProgress.find(
          (t) => t.status === "completing"
        );

        console.log("[releaseNotes] Last key release check:", {
          completingTaskId: completingTask?.taskId,
          completingTaskStatus: completingTask?.status,
          pendingReleasesSize: pendingKeyReleases.size,
          activeKeysSize: activeKeys.size,
        });

        if (completingTask) {
          console.log(
            `[releaseNotes] Completing task ${completingTask.taskId}`
          );

          // Only now mark task as completed and set up next task
          setTaskProgress((prev) =>
            prev.map((t) =>
              t.taskId === completingTask.taskId
                ? { ...t, status: "completed" }
                : t
            )
          );

          const nextTaskId = getNextTaskId(completingTask.taskId);
          if (nextTaskId) {
            console.log(`[releaseNotes] Setting up next task: ${nextTaskId}`);
            setState((prev) => ({
              ...prev,
              pendingNextTask: nextTaskId,
            }));
          }
        }
      }

      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(relativeNote, octave);

      const releasedNotes = notesToRelease.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerRelease(noteString);

        // Update falling notes
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

      // Remove from active keys
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      return releasedNotes;
    },
    [state.taskProgress, pendingKeyReleases, activeKeys.size, tonic, voicing]
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

  // Get the current active task ID
  const currentActiveTaskId = getActiveTaskId(state);

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        taskProgress={taskProgress}
        activeTaskId={currentActiveTaskId}
        activeKeysCount={activeKeys.size}
        setState={setState}
      />
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
    </>
  );
};
