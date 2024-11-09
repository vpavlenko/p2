import React, { useState, useCallback } from "react";
import { PianoUI } from "./PianoUI";
import { Voicing } from "../constants/voicings";
import { ColorMode } from "./types";
import { VOICINGS } from "../constants/voicings";
import { sampler } from "../audio/sampler";
import { ScaleMode } from "../constants/scales";
import { FallingNote } from "./FallingNotes";
import { ControlPanel } from "./ControlPanel";
import { ChordProgression } from "../constants/progressions";

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

const START_OCTAVE = 0;

const getFallingNotePosition = (
  note: number,
  octave: number,
  startOctave: number
) => {
  const semitonesFromC0 = (octave - startOctave) * 12 + note;
  return (semitonesFromC0 * (25 * 7)) / 6 / 2 + -125;
};

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [voicing, setVoicing] = useState<Voicing>("single");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);

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
          left: getFallingNotePosition(absoluteNote, o, START_OCTAVE),
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

  const playProgression = useCallback(
    async (progression: ChordProgression) => {
      if (isProgressionPlaying) return;

      setIsProgressionPlaying(true);
      const CHORD_DURATION = 1000; // 1 second per chord

      // Store the current state values
      const currentVoicing = voicing;

      try {
        for (const chord of progression.chords) {
          // Play the chord
          const notesToPlay = VOICINGS[currentVoicing].getNotes(
            chord.root,
            3,
            chord.type === "major" ? "major" : "minor"
          );

          // Play each note in the chord
          for (const { note: n, octave: o } of notesToPlay) {
            const absoluteNote = n % 12;
            const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;

            // Trigger the note
            sampler.triggerAttack(noteString);

            // Add falling note
            const newNote: FallingNote = {
              id: `${absoluteNote}-${o}-${Date.now()}`,
              note: absoluteNote,
              octave: o,
              startTime: Date.now(),
              endTime: null,
              left: getFallingNotePosition(absoluteNote, o, START_OCTAVE),
            };

            setFallingNotes((prev) => [...prev, newNote]);
          }

          // Wait for chord duration
          await new Promise((resolve) => setTimeout(resolve, CHORD_DURATION));

          // Release all notes in the chord
          for (const { note: n, octave: o } of notesToPlay) {
            const absoluteNote = n % 12;
            const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;

            // Release the note
            sampler.triggerRelease(noteString);

            // Update falling notes
            setFallingNotes((prev) =>
              prev.map((note) => {
                if (
                  note.note === absoluteNote &&
                  note.octave === o &&
                  !note.endTime
                ) {
                  return { ...note, endTime: Date.now() };
                }
                return note;
              })
            );
          }

          // Small gap between chords
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error("Error playing progression:", error);
      } finally {
        setIsProgressionPlaying(false);
      }
    },
    [tonic, voicing]
  );

  const stopProgression = useCallback(() => {
    setIsProgressionPlaying(false);
    // Release all currently playing notes
    sampler.releaseAll();
  }, []);

  return (
    <>
      <ControlPanel
        currentVoicing={voicing}
        onVoicingChange={setVoicing}
        currentScaleMode={scaleMode}
        onScaleModeChange={setScaleMode}
        currentColorMode={colorMode}
        onColorModeChange={setColorMode}
        onPlayProgression={playProgression}
        onStopProgression={stopProgression}
        isProgressionPlaying={isProgressionPlaying}
      />
      <PianoUI
        tonic={tonic}
        setTonic={setTonic}
        scaleMode={scaleMode}
        colorMode={colorMode}
        playNotes={playNotes}
        releaseNotes={releaseNotes}
        fallingNotes={fallingNotes}
      />
    </>
  );
};
