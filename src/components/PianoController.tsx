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

// Add this helper function
const getActiveTaskId = (taskProgress: TaskProgress[]): string | null => {
  // First task is active if it's not completed
  const firstTask = taskProgress.find((t) => t.taskId === "press-any-notes");
  if (!firstTask || firstTask.progress < 20) {
    return "press-any-notes";
  }

  // Second task is active if first is completed but second isn't
  const secondTask = taskProgress.find((t) => t.taskId === "play-all-c-notes");
  if (!secondTask || secondTask.progress < 7) {
    return "play-all-c-notes";
  }

  return null; // All tasks completed
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
  const [playedNotes] = useState(new Set<string>());

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);
    } else {
      navigate(`${URL_PREFIX}/1`, { replace: true });
    }
  }, [lessonId, navigate]);

  const incrementTaskProgress = useCallback(
    (taskId: string, note: number, octave: number) => {
      const taskConfig = TASK_CONFIGS[taskId];
      if (!taskConfig) return;

      const noteKey = `${note}-${octave}`;
      const shouldIncrement = taskConfig.checkProgress(
        note,
        octave,
        playedNotes
      );

      if (shouldIncrement) {
        if (taskConfig.id === "play-all-c-notes") {
          playedNotes.add(noteKey);
        }

        setTaskProgress((prev) => {
          const existingTask = prev.find((t) => t.taskId === taskId);
          if (existingTask) {
            return prev.map((t) =>
              t.taskId === taskId ? { ...t, progress: t.progress + 1 } : t
            );
          }
          return [...prev, { taskId, progress: 1 }];
        });
      }
    },
    [playedNotes]
  );

  const playNotes = useCallback(
    async (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(relativeNote, octave);

      // Check progress for active task
      const activeTaskId = getActiveTaskId(taskProgress);
      if (activeTaskId) {
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

      return playedNotes;
    },
    [tonic, voicing, incrementTaskProgress, taskProgress]
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

  // Get active task ID
  const activeTaskId = getActiveTaskId(taskProgress);

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        taskProgress={taskProgress}
      />
      <PianoUI
        tonic={tonic}
        setTonic={setTonic}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        currentVoicing={voicing}
        onVoicingChange={setVoicing}
        playNotes={playNotes}
        releaseNotes={releaseNotes}
        fallingNotes={fallingNotes}
        currentlyPlayingId={currentlyPlayingId}
        onStopPlaying={stopProgression}
        activeTaskId={activeTaskId}
      />
    </>
  );
};
