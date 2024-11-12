import React, { useState, useCallback } from "react";
import { PianoUI } from "./PianoUI";
import { Voicing } from "../constants/voicings";
import { ColorMode } from "./types";
import { VOICINGS } from "../constants/voicings";
import { sampler } from "../audio/sampler";
import { ScaleMode } from "../constants/scales";
import { FallingNote } from "./FallingNotes";
import { LessonsPanel } from "./LessonsPanel";
import { LessonExample } from "./LessonExample";

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

const NOTE_NAME_TO_NUMBER: { [key: string]: number } = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// Add this function to parse note strings
const parseNoteString = (noteStr: string): { note: number; octave: number } => {
  const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) throw new Error(`Invalid note format: ${noteStr}`);

  const [, noteName, octaveStr] = match;
  const note = NOTE_NAME_TO_NUMBER[noteName];
  const octave = parseInt(octaveStr);

  return { note, octave };
};

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [voicing, setVoicing] = useState<Voicing>("single");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(1);

  const playNotes = useCallback(
    async (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      const playedNotes = notesToPlay.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerAttack(noteString);

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
    [tonic, voicing, scaleMode]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

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
    [tonic, voicing, scaleMode]
  );

  const stopProgression = useCallback(() => {
    setIsProgressionPlaying(false);
    // Release all currently playing notes
    sampler.releaseAll();
  }, []);

  const playSequentialNotes = useCallback(
    async (notation: string) => {
      if (isProgressionPlaying) {
        stopProgression();
      }

      setIsProgressionPlaying(true);

      try {
        const chords = notation.trim().split(/\s+/);

        for (const chord of chords) {
          // Split chord into simultaneous notes
          const simultaneousNotes = chord.split("-").map(parseNoteString);

          // Play all notes in the chord simultaneously
          await Promise.all(
            simultaneousNotes.map(({ note, octave }) => playNotes(note, octave))
          );

          // Wait for 1000ms
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Release all notes in the chord
          simultaneousNotes.forEach(({ note, octave }) =>
            releaseNotes(note, octave)
          );

          // Small gap between chords
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error("Error playing sequence:", error);
      } finally {
        setIsProgressionPlaying(false);
      }
    },
    [playNotes, releaseNotes, isProgressionPlaying, stopProgression]
  );

  const handlePlayExample = useCallback(
    (example: LessonExample) => {
      if (!example.data) return;

      playSequentialNotes(example.data);
    },
    [playSequentialNotes]
  );

  const handleLessonChange = useCallback((lessonId: number) => {
    setCurrentLessonId(lessonId);
  }, []);

  return (
    <>
      <LessonsPanel
        onPlayExample={handlePlayExample}
        onStopPlaying={stopProgression}
        isPlaying={isProgressionPlaying}
        currentVoicing={voicing}
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        onVoicingChange={setVoicing}
      />
      <PianoUI
        tonic={tonic}
        setTonic={setTonic}
        scaleMode={scaleMode}
        onScaleModeChange={setScaleMode}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        currentVoicing={voicing}
        onVoicingChange={setVoicing}
        playNotes={playNotes}
        releaseNotes={releaseNotes}
        fallingNotes={fallingNotes}
      />
    </>
  );
};
