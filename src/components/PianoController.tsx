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
import { TASK_CONFIGS } from "../types/tasks";

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
}

interface PianoControllerState {
  taskProgress: Array<{ taskId: string; progress: number }>;
  pendingTaskCompletion: string | null;
  activeKeysSize: number;
  pendingNextTask: string | null;
}

// Add debug logging to getActiveTaskId
const getActiveTaskId = (state: PianoControllerState): string | null => {
  console.log("getActiveTaskId called with:", state);

  // If we have a pending next task but keys are still pressed,
  // stay with the current task
  if (state.pendingNextTask && state.activeKeysSize > 0) {
    const currentTaskId = state.taskProgress[0]?.taskId;
    console.log(
      "Waiting for key releases before activating:",
      state.pendingNextTask
    );
    console.log("Staying with current task:", currentTaskId);
    return currentTaskId;
  }

  // If we have a pending next task and no keys pressed, activate it
  if (state.pendingNextTask && state.activeKeysSize === 0) {
    console.log("Activating pending task:", state.pendingNextTask);
    return state.pendingNextTask;
  }

  // First task is active if it's not completed
  const firstTask = state.taskProgress.find(
    (t) => t.taskId === "play-c-across-octaves"
  );
  const firstTaskCompleted = firstTask && firstTask.progress >= 4;

  console.log("First task status:", {
    exists: !!firstTask,
    progress: firstTask?.progress,
    completed: firstTaskCompleted,
  });

  if (!firstTaskCompleted) {
    console.log("Activating first task");
    return "play-c-across-octaves";
  }

  // Second task is active if first is completed and second isn't completed
  const secondTask = state.taskProgress.find(
    (t) => t.taskId === "play-d-across-octaves"
  );
  const secondTaskCompleted = secondTask && secondTask.progress >= 4;

  if (
    firstTaskCompleted &&
    !secondTaskCompleted &&
    !state.pendingTaskCompletion
  ) {
    console.log("Activating second task");
    return "play-d-across-octaves";
  }

  // Third task is active if second is completed and third isn't completed
  const thirdTask = state.taskProgress.find(
    (t) => t.taskId === "play-e-across-octaves"
  );
  const thirdTaskCompleted = thirdTask && thirdTask.progress >= 4;

  if (
    secondTaskCompleted &&
    !thirdTaskCompleted &&
    !state.pendingTaskCompletion
  ) {
    console.log("Activating third task");
    return "play-e-across-octaves";
  }

  // Fourth task is active if third is completed and fourth isn't completed
  const fourthTask = state.taskProgress.find(
    (t) => t.taskId === "press-any-notes"
  );
  const fourthTaskCompleted = fourthTask && fourthTask.progress >= 20;

  if (
    thirdTaskCompleted &&
    !fourthTaskCompleted &&
    !state.pendingTaskCompletion
  ) {
    console.log("Activating fourth task");
    return "press-any-notes";
  }

  // Fifth task is active if fourth is completed and fifth isn't completed
  const fifthTask = state.taskProgress.find(
    (t) => t.taskId === "play-all-c-notes"
  );
  const fifthTaskCompleted = fifthTask && fifthTask.progress >= 8;

  if (
    fourthTaskCompleted &&
    !fifthTaskCompleted &&
    !state.pendingTaskCompletion
  ) {
    console.log("Activating fifth task");
    return "play-all-c-notes";
  }

  console.log("No active task - all completed");
  return null; // All tasks completed
};

// Add this helper function near getNextTaskId
const getPreviousTaskId = (currentTaskId: string): string | null => {
  if (currentTaskId === "play-d-across-octaves") return "play-c-across-octaves";
  if (currentTaskId === "play-e-across-octaves") return "play-d-across-octaves";
  if (currentTaskId === "press-any-notes") return "play-e-across-octaves";
  if (currentTaskId === "play-all-c-notes") return "press-any-notes";
  return null;
};

// Update getNextTaskId
const getNextTaskId = (currentTaskId: string): string | null => {
  if (currentTaskId === "play-c-across-octaves") return "play-d-across-octaves";
  if (currentTaskId === "play-d-across-octaves") return "play-e-across-octaves";
  if (currentTaskId === "play-e-across-octaves") return "press-any-notes";
  if (currentTaskId === "press-any-notes") return "play-all-c-notes";
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

      if (shouldIncrement) {
        // Update the played notes Set
        setTaskPlayedNotes((prev) => ({
          ...prev,
          [taskId]: new Set([...prev[taskId], noteKey]),
        }));

        setTaskProgress((prev) => {
          const existingTask = prev.find((t) => t.taskId === taskId);
          const newProgress = existingTask
            ? prev.map((t) =>
                t.taskId === taskId ? { ...t, progress: t.progress + 1 } : t
              )
            : [...prev, { taskId, progress: 1 }];

          // Check if task is completed
          const updatedTask = newProgress.find((t) => t.taskId === taskId);
          if (updatedTask && updatedTask.progress === taskConfig.total) {
            const nextTaskId = getNextTaskId(taskId);
            setState((currentState) => ({
              ...currentState,
              pendingNextTask: nextTaskId,
            }));
          }

          return newProgress;
        });
      }
    },
    [taskPlayedNotes, setState]
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
        activeTaskId={currentActiveTaskId}
        taskKeyboardMapping={
          currentActiveTaskId
            ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
            : undefined
        }
      />
    </>
  );
};
