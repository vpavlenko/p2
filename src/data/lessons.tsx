import React from "react";
import { BasicInlineExample as E } from "../components/LessonExample";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold mb-4">{children}</h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold mt-12">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-6 mb-2">{children}</p>
);

export interface Lesson {
  id: number;
  title: string;
  content: React.ReactNode;
}

const LESSONS_WITHOUT_IDS: { title: string; content: React.ReactNode }[] = [
  {
    title: "Octaves",
    content: (
      <>
        <P>
          The most important thing to understand about the piano is the octave.
          Two notes an octave apart sound similar. Not the same, but similar.
          For any note, the most similarly sounding to it are the ones octave
          apart from it.
        </P>
        <P>
          For that reason, we color all notes that are one or several octaves
          apart in the same color. Western music uses 12 colors.
        </P>
        <E data="C1 C2 C3 C4 C5 C6 C7 C8" name="All C notes" />
        <E
          data="C1 C2 C1+C2 C1-C2 C2+C3 C2-C3 C3+C4 C3-C4 C4+C5 C4-C5 C5+C6 C5-C6 C6+C7 C6-C7 C7+C8 C7-C8"
          name="Pairs of C notes"
        />
        <E
          data="C1-C2-C3 C2-C3-C4 C3-C4-C5 C4-C5-C6 C5-C6-C7 C6-C7-C8"
          name="Triplets of C notes"
        />
        <E
          data="C1-C2-C3-C4 C2-C3-C4-C5 C3-C4-C5-C6 C4-C5-C6-C7 C5-C6-C7-C8 C1-C2-C3-C4-C5 C2-C3-C4-C5-C6 C3-C4-C5-C6-C7 C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6 C2-C3-C4-C5-C6-C7 C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7 C2-C3-C4-C5-C6-C7-C8 C1-C2-C3-C4-C5-C6-C7-C8"
          name="Other C note combos"
        />
        <P>Now let's listen to other 11 colors.</P>
        <E data="C#1 C#2 C#3 C#4 C#5 C#6 C#7" name="All C# notes" />
        <E data="D1 D2 D3 D4 D5 D6 D7" name="All D notes" />
        <E data="D#1 D#2 D#3 D#4 D#5 D#6 D#7" name="All D# notes" />
        <E data="E1 E2 E3 E4 E5 E6 E7" name="All E notes" />
        <E data="F1 F2 F3 F4 F5 F6 F7" name="All F notes" />
        <E data="F#1 F#2 F#3 F#4 F#5 F#6 F#7" name="All F# notes" />
        <E data="G1 G2 G3 G4 G5 G6 G7" name="All G notes" />
        <E data="G#1 G#2 G#3 G#4 G#5 G#6 G#7" name="All G# notes" />
        <E data="A1 A2 A3 A4 A5 A6 A7" name="All A notes" />
        <E data="A#1 A#2 A#3 A#4 A#5 A#6 A#7" name="All A# notes" />
        <E data="B1 B2 B3 B4 B5 B6 B7" name="All B notes" />
        <P>And then let's have them all together.</P>
        <E
          data="C2 C#2 D2 D#2 E2 F2 F#2 G2 G#2 A2 A#2 B2"
          name="All notes in the second octave"
        />
        <E
          data="C1~C2~C3~C4~C5~C6~C7 C#1~C#2~C#3~C#4~C#5~C#6~C#7 D1~D2~D3~D4~D5~D6~D7 D#1~D#2~D#3~D#4~D#5~D#6~D#7 E1~E2~E3~E4~E5~E6~E7 F1~F2~F3~F4~F5~F6~F7 F#1~F#2~F#3~F#4~F#5~F#6~F#7 G1~G2~G3~G4~G5~G6~G7 G#1~G#2~G#3~G#4~G#5~G#6~G#7 A1~A2~A3~A4~A5~A6~A7 A#1~A#2~A#3~A#4~A#5~A#6~A#7 B1~B2~B3~B4~B5~B6~B7 C2-C3-C4-C5-C6-C7 C#2-C#3-C#4-C#5-C#6-C#7 D2-D3-D4-D5-D6-D7 D#2-D#3-D#4-D#5-D#6-D#7 E2-E3-E4-E5-E6-E7 F2-F3-F4-F5-F6-F7 F#2-F#3-F#4-F#5-F#6-F#7 G2-G3-G4-G5-G6-G7 G#2-G#3-G#4-G#5-G#6-G#7 A2-A3-A4-A5-A6-A7 A#2-A#3-A#4-A#5-A#6-A#7 B2-B3-B4-B5-B6-B7 C3-C4-C5-C6-C7"
          name="All notes in the all octaves simultaneously"
        />
      </>
    ),
  },
  {
    title: "Semitones",
    content: (
      <>
        <P>There are 12 semitones in each octave.</P>
        <E
          data="C3 C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3"
          name="12 semitones in octave 3"
        />
        <P>Five of them are lighter shades of their lower neighbor:</P>
        <E
          data="C#3-C#4 D3-D4 . D#3-D#4 E3-E4 . F3-F4 F#3-F#4 . G#3-G#4 A3-A4 . A#3-A#4 B3-B4"
          name="12 semitones in octave 3"
        />
      </>
    ),
  },
  {
    title: "Intervals",
    content: (
      <>
        <H3>A semitone</H3>
        <P>
          An interval is the distance between two notes. The distance is
          measured in semitones.
        </P>
        <E
          data="C3 C#3 C3-C#3 . C3 D3 C3-D3 . C3 D#3 C3-D#3 . C3 E3 C3-E3 . C3 F3 C3-F3 . C3 F#3 C3-F#3 . C3 G3 C3-G3 . C3 G#3 C3-G#3 . C3 A3 C3-A3 . C3 A#3 C3-A#3 . C3 B3 C3-B3 C3 C4 C3-C4"
          name="12 simple intervals from C3"
        />
        <P>
          For the last two centuries instruments like piano are tuned so that
          the difference between two consecutive notes - a semitone - is always
          the same. So, these semitones are all somewhat equal - they probably
          mean "the same interval" to your hearing.
        </P>
        <P>
          Visually they look the same: the notes overlap half the width. And
          that visual metaphor may even correlate with the clash you hear in
          them.
        </P>
        <E
          data="C3 C#3 C3-C#3 . C#3 D3 C#3-D3 . D3 D#3 D3-D#3 . D#3 E3 D#3-E3 . E3 F3 E3-F3 . F3 F#3 F3-F#3 . F#3 G3 F#3-G3 . G3 G#3 G3-G#3 . G#3 A3 G#3-A3 . A3 A#3 A3-A#3 . A#3 B3 A#3-B3 . B3 C4 B3-C4"
          name="12 semitones between C3 and C4"
        />
        <H3>Whole tone</H3>
        <P>The next interval is a whole tone. How does it look like?</P>
        <E
          data="C3 D3 C3-D3 . C#3 D#3 C#3-D#3 . D3 E3 D3-E3 . D#3 F3 D#3-F3 . E3 F#3 E3-F#3 . F3 G3 F3-G3 . F#3 G#3 F#3-G#3 . G3 A3 G3-A3 . G#3 A#3 G#3-A#3 . A3 B3 A3-B3 . A#3 C4 A#3-C4 . B3 C#4 B3-C#4"
          name="12 whole tones built from all notes of octave 3"
        />

        <P>
          The intervals are syllables of the Western music. They aren't yet
          words. That's why listening through them is that boring. If you get
          bored enough, please go to the next section on chords!
        </P>
        <H3>Minor third</H3>
        <P>
          The next interval is a minor third. What's the width of its visual gap
          between the two notes?
        </P>

        <P>Isn't "gap" and "interval" the same thing, semantically?</P>
        <P>
          While you listen to, think of whether a minor third "feels" different
          from a whole tone. Does it convey emotion, however abstract?
        </P>
        <E
          data="C3 D#3 C3-D#3 . C#3 E3 C#3-E3 . D3 F3 D3-F3 . D#3 F#3 D#3-F#3 . E3 G3 E3-G3 . F3 G#3 F3-G#3 . F#3 A3 F#3-A3 . G3 A#3 G3-A#3 . G#3 B3 G#3-B3 . A3 C4 A3-C4 . A#3 C#4 A#3-C#4 . B3 D4 B3-D4"
          name="12 minor thirds built from all notes of octave 3"
        />
        <H3>Major third</H3>
        <P>
          There are two thirds - a minor third and a major third. I'm gonna
          build them from several notes. Notice the different gap between them
          and the different feeling - minor vs. major, emotionally?{" "}
        </P>
        <E
          data="
    C3 D#3 C3-D#3 . C3 E3 C3-E3 . 
    D3 F3 D3-F3 . D3 F#3 D3-F#3 . 
    F3 G#3 F3-G#3 . F3 A3 F3-A3 . 
    G3 A#3 G3-A#3 . G3 B3 G3-B3 . 
    A#3 C#4 A#3-C#4 . A#3 D4 A#3-D4
  "
          name="a minor and a major third, built from some notes of octave 3"
        />
        <P>
          I was cheating - I picked only those five pair where the upper note
          gets brighter as we go from a minor third to a major third. That
          doesn't always happen.
        </P>
        <P>
          Here are seven other cases, where the intervals are only visible in
          the gap between the notes. The gap is a part of a physical reality, so
          you can hear it. The actual colors aren't important until we start
          talking about chords in a key.
        </P>
        <E
          data="
C#3 E3 C#3-E3 . C#3 F3 C#3-F3 . 
D#3 F#3 D#3-F#3 . D#3 G3 D#3-G3 . 
E3 G3 E3-G3 . E3 G#3 E3-G#3 . 
F#3 A3 F#3-A3 . F#3 A#3 F#3-A#3 . 
G#3 B3 G#3-B3 . G#3 C4 G#3-C4 . 
A3 C4 A3-C4 . A3 C#4 A3-C#4 . 
B3 D4 B3-D4 . B3 D#4 B3-D#4 . 
  "
          name="a minor and a major third, built from all other notes of octave 3"
        />
        <H3>Perfect fourth</H3>
        <P>
          A perfect fourth sounds less "colored" than thirds, it may sound
          rock-n-rolly, guitary to you - idk.
        </P>
        <E
          data=" C3-F3 
    C#3-F#3 
    D3-G3 
    D#3-G#3 
    E3-A3 
    F3-A#3 
    F#3-B3 
    G3-C4 
    G#3-C#4 
    A3-D4 
    A#3-D#4 
    B3-E4"
          name="12 perfect fourths built from all notes of octave 3"
        />
        <H3>Tritone</H3>
        <P>
          A tritone may sound like dissonant. This term is rather misleading and
          esoteric, so I'm not gonna explain it. Maybe you find and sharp, or
          devil, but probably not boring, at least.
        </P>
        <E
          data=" C3-F#3 
    C#3-G3 
    D3-G#3 
    D#3-A3 
    E3-A#3 
    F3-B3 
    F#3-C4 
    G3-C#4 
    G#3-D4 
    A3-D#4 
    A#3-E4 
    B3-F4"
          name="12 tritones built from all notes of octave 3"
        />
      </>
    ),
  },
  {
    title: "Chords",
    content: (
      <>
        <H3>Major chord</H3>
        <P>
          Chords are the real words of Western music. A chord is several notes
          sounding together. In many styles, chords are mostly built of three
          notes. A major chord is the stack of two intervals - a major third and
          a minor third.
        </P>
        <P>
          You can remember this stack as two gaps - note-wide gap plus
          half-note-wide gap.
        </P>
        <E
          data="C3 E3 G3 C3~E3~G3 . C#3 F3 G#3 C#3~F3~G#3 . D3 F#3 A3 D3~F#3~A3 . D#3 G3 A#3 D#3~G3~A#3 . E3 G#3 B3 E3~G#3~B3 . F3 A3 C4 F3~A3~C4 . F#3 A#3 C#4 F#3~A#3~C#4 . G3 B3 D4 G3~B3~D4 . G#3 C4 D#4 G#3~C4~D#4 . A3 C#4 E4 A3~C#4~E4 . A#3 D4 F4 A#3~D4~F4 . B3 D#4 F#4 B3~D#4~F#4"
          name="12 major chords built from on notes of octave 3"
        />
        <P>
          Let's take a C major chord. It's built from C, E and G. You can play
          them in all octaves, although it's kinda muddy in lower octaves,
          because notes clash together.
        </P>
        <E
          data="C1 E1 G1 C1~E1~G1 . C2 E2 G2 C2~E2~G2 . C3 E3 G3 C3~E3~G3 . C4 E4 G4 C4~E4~G4 . C5 E5 G5 C5~E5~G5 . C6 E6 G6 C6~E6~G6 . C7 E7 G7 C7~E7~G7"
          name="C major chord in all octaves"
        />
        <P>
          These three colors always make a major chord. So, the colors are
          defining, not the interval between concrete notes. That is, as long as
          you preserve the colors, you can play them in any octaves - we'll
          still consider this a C major chord.
        </P>
        <E
          data="C1 G1 E2 C1~G1~E2 . E1 C2 G2 E1~C2~G2 . G1 E2 C3 G1~E2~C3 . C2 G2 E3 C2~G2~E3 . E2 C3 G3 E2~C3~G3 . G2 E3 C4 G2~E3~C4 . C3 G3 E4 C3~G3~E4 . E3 C4 G4 E3~C4~G4 . G3 E4 C5 G3~E4~C5 . C4 G4 E5 C4~G4~E5 . E4 C5 G5 E4~C5~G5 . G4 E5 C6 G4~E5~C6 . C5 G5 E6 C5~G5~E6 . E5 C6 G6 E5~C6~G6 . G5 E6 C7 G5~E6~C7"
          name="C major chord, a wider voicing"
        />
        <H3>Minor chord</H3>
        <P>
          A minor chord is a stack of a minor third and a major third. The
          reverse order of intervals completely changes the game!
        </P>
        <E
          data="C3 Eb3 G3 C3~Eb3~G3 . C#3 E3 G#3 C#3~E3~G#3 . D3 F3 A3 D3~F3~A3 . D#3 F#3 A#3 D#3~F#3~A#3 . E3 G3 B3 E3~G3~B3 . F3 Ab3 C4 F3~Ab3~C4 . F#3 A3 C#4 F#3~A3~C#4 . G3 Bb3 D4 G3~Bb3~D4 . G#3 B3 D#4 G#3~B3~D#4 . A3 C4 E4 A3~C4~E4 . A#3 C#4 F4 A#3~C#4~F4 . B3 D4 F#4 B3~D4~F#4"
          name="12 minor chords built from on notes of octave 3"
        />
      </>
    ),
  },
  {
    title: "Major scale",
    content: (
      <>
        <P>
          A scale is a sequence of notes that shows almost a complete range of
          notes for some pieces. A major scale is on of the basic scales in
          Western music. It has seven notes. What defines a scale is a sequence
          of intervals between the notes.
        </P>
        <E data="C3 D3 E3 F3 G3 A3 B3 C4" name="C major scale" />
        <P>
          By applying the same sequence of intervals, we can build a major scale
          on any note of the piano. However, for this very process it makes
          sense to recolor the piano keyboard. That is because a major scale,
          played separately, defines so much expectations in Western music so
          that its lowest note can be thought as a local center, or a tonic.
          We'll try to always have a tonic notic colored as white.
        </P>
        <E
          data="C#3 D#3 F3 F#3 G#3 A#3 C4 C#4"
          name="C# (Db) major scale"
          tonic="C#"
        />
        <E data="D3 E3 F#3 G3 A3 B3 C#4 D4" name="D major scale" tonic="D" />
        <E
          data="Eb3 F3 G3 Ab3 Bb3 C4 D4 Eb4"
          name="D# (Eb) major scale"
          tonic="Eb"
        />
        <E data="E3 F#3 G#3 A3 B3 C#4 D#4 E4" name="E major scale" tonic="E" />
        <E data="F3 G3 A3 Bb3 C4 D4 E4 F4" name="F major scale" tonic="F" />
        <E
          data="F#3 G#3 A#3 B3 C#4 D#4 F4 F#4"
          name="F# (Gb) major scale"
          tonic="F#"
        />
        <E data="G3 A3 B3 C4 D4 E4 F#4 G4" name="G major scale" tonic="G" />
        <E
          data="Ab3 Bb3 C4 Db4 Eb4 F4 G4 Ab4"
          name="G# (Ab) major scale"
          tonic="Ab"
        />
        <E data="A3 B3 C#4 D4 E4 F#4 G#4 A4" name="A major scale" tonic="A" />
        <E
          data="Bb3 C4 D4 Eb4 F4 G4 A4 Bb4"
          name="A# (Bb) major scale"
          tonic="Bb"
        />
        <E data="B3 C#4 D#4 E4 F#4 G#4 A#4 B4" name="B major scale" tonic="B" />
      </>
    ),
  },
  {
    title: "Chords in a major key",
    content: (
      <>
        <H3>Six most popular chords</H3>
        <P>
          If a piece uses a major scale and uses its white note - the tonic - as
          its main note where melodies start and end, then this piece in Western
          music tends to use certain chords.
        </P>
        <P>
          Most of the time, it uses chords major and minor chords that can be
          built from the notes of a major scale. Naturally, we can only do that
          if we pick a note, a third above and one more third above - therefore
          we go pick-one skip-one pick-one skip-one up the scale.
        </P>
        <P>Here are six most popular chords in a major key:</P>
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . C3 E3 G3 C3~E3~G3 C3-E3-G3 C4-E4-G4 C5-E5-G5 C6-E6-G6 C3-E3-G3-C4-E4-G4 C5-E5-G5-C6-E6-G6 C3-E3-G3-C4-E4-G4-C5-E5-G5-C6-E6-G6"
          name="C major chord, C, I, 1-3-5"
        />
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . D3 F3 A3 D3~F3~A3 D3-F3-A3 D4-F4-A4 D5-F5-A5 D6-F6-A6 D3-F3-A3-D4-F4-A4 D5-F5-A5-D6-F6-A6 D3-F3-A3-D4-F4-A4-D5-F5-A5-D6-F6-A6"
          name="D minor chord, Dm, ii, 2-4-6"
        />
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . E3 G3 B3 E3~G3~B3 E3-G3-B3 E4-G4-B4 E5-G5-B5 E6-G6-B6 E3-G3-B3-E4-G4-B4 E5-G5-B5-E6-G6-B6 E3-G3-B3-E4-G4-B4-E5-G5-B5-E6-G6-B6"
          name="E minor chord, Em, iii, 3-5-7"
        />
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . F3 A3 C4 F3~A3~C4 F3-A3-C4 F4-A4-C5 F5-A5-C6 F6-A6-C7 F3-A3-C4-F4-A4-C5 F5-A5-C6-F6-A6-C7 F3-A3-C4-F4-A4-C5-F5-A5-C6-F6-A6-C7"
          name="F major chord, F, IV, 4-6-1"
        />
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . G3 B3 D4 G3~B3~D4 G3-B3-D4 G4-B4-D5 G5-B5-D6 G6-B6-D7 G3-B3-D4-G4-B4-D5 G5-B5-D6-G6-B6-D7 G3-B3-D4-G4-B4-D5-G5-B5-D6-G6-B6-D7"
          name="G major chord, G, V, 5-7-2"
        />
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . A3 C4 E4 A3~C4~E4 A3-C4-E4 A4-C5-E5 A5-C6-E6 A6-C7-E7 A3-C4-E4-A4-C5-E5 A5-C6-E6-A6-C7-E7 A3-C4-E4-A4-C5-E5-A5-C6-E6-A6-C7-E7"
          name="A minor chord, Am, vi, 6-1-3"
        />
        <H3>Roman numerals</H3>
        <P>
          Why do we use roman numerals to denote chords? That's because chords
          are built and used in the same way for all 12 major keys. Therefore,
          it's good to have a tonic-independent way to denote chords, to speak
          of all 12 keys at once.
        </P>
        <P>Let's see how chords are built in all 12 major keys.</P>
        <E
          data="C#3^D#3^F3^F#3^G#3^A#3^C4^C#4 . C#3-F3-G#3 D#3-F#3-A#3 F3-G#3-C4 F#3-A#3-C#4 G#3-C4-D#4 A#3-C#4-F4 G#3-C4-D#4 C#4-F4-G#4"
          name="I ii iii IV V vi V I in C# major"
          tonic="C#"
        />
        <E
          data="D3^E3^F#3^G3^A3^B3^C#4^D4 . D3-F#3-A3 E3-G3-B3 F#3-A3-C#4 G3-B3-D4 A3-C#4-E4 B3-D4-F#4 A3-C#4-E4 D4-F#4-A4"
          name="I ii iii IV V vi V I in D major"
          tonic="D"
        />{" "}
        <E
          data="D#3^F3^G3^G#3^A#3^C4^D4^D#4 . D#3-G3-A#3 F3-G#3-C4 G3-A#3-D4 G#3-C4-D#4 A#3-D4-F4 C4-D#4-G4 A#3-D4-F4 D#4-G4-A#4"
          name="I ii iii IV V vi V I in D# major"
          tonic="D#"
        />{" "}
        <E
          data="E3^F#3^G#3^A3^B3^C#4^D#4^E4 . E3-G#3-B3 F#3-A3-C#4 G#3-B3-D#4 A3-C#4-E4 B3-D#4-F#4 C#4-E4-G#4 B3-D#4-F#4 E4-G#4-B4"
          name="I ii iii IV V vi V I in E major"
          tonic="E"
        />{" "}
        <E
          data="F3^G3^A3^Bb3^C4^D4^E4^F4 . F3-A3-C4 G3-Bb3-D4 A3-C4-E4 Bb3-D4-F4 C4-E4-G4 D4-F4-A4 C4-E4-G4 F4-A4-C5"
          name="I ii iii IV V vi V I in F major"
          tonic="F"
        />{" "}
        <E
          data="F#3^G#3^A#3^B3^C#4^D#4^F4^F#4 . F#3-A#3-C#4 G#3-B3-D#4 A#3-C#4-F4 B3-D#4-F#4 C#4-F4-G#4 D#4-F#4-A#4 C#4-F4-G#4 F#4-A#4-C#5"
          name="I ii iii IV V vi V I in F# major"
          tonic="F#"
        />{" "}
        <E
          data="G3^A3^B3^C4^D4^E4^F#4^G4 . G3-B3-D4 A3-C4-E4 B3-D4-F#4 C4-E4-G4 D4-F#4-A4 E4-G4-B4 D4-F#4-A4 G4-B4-D5"
          name="I ii iii IV V vi V I in G major"
          tonic="G"
        />{" "}
        <E
          data="G#3^A#3^C4^C#4^D#4^F4^G4^G#4 . G#3-C4-D#4 A#3-C#4-F4 C4-D#4-G4 C#4-F4-G#4 D#4-G4-A#4 F4-G#4-C5 D#4-G4-A#4 G#4-C5-D#5"
          name="I ii iii IV V vi V I in G# major"
          tonic="G#"
        />{" "}
        <E
          data="A3^B3^C#4^D4^E4^F#4^G#4^A4 . A3-C#4-E4 B3-D4-F#4 C#4-E4-G#4 D4-F#4-A4 E4-G#4-B4 F#4-A4-C#5 E4-G#4-B4 A4-C#5-E5"
          name="I ii iii IV V vi V I in A major"
          tonic="A"
        />{" "}
        <E
          data="A#3^C4^D4^D#4^F4^G4^A4^A#4 . A#3-D4-F4 C4-D#4-G4 D4-F4-A4 D#4-G4-A#4 F4-A4-C5 G4-A#4-D5 F4-A4-C5 A#4-D5-F5"
          name="I ii iii IV V vi V I in A# major"
          tonic="A#"
        />{" "}
        <E
          data="B3^C#4^D#4^E4^F#4^G#4^A#4^B4 . B3-D#4-F#4 C#4-E4-G#4 D#4-F#4-A#4 E4-G#4-B4 F#4-A#4-C#5 G#4-B4-D#5 F#4-A#4-C#5 B4-D#5-F#5"
          name="I ii iii IV V vi V I in B major"
          tonic="B"
        />
        <P>
          In practice, pieces are written in one key, but can be played in any.
          So, we can focus on writing and playing everything in a C major key to
          not to repeat everything 12 times when learning.
        </P>
        <H3>Phrases with I, IV and V</H3>
        <P>
          Chords progress in a piece. One follows another. Their flow isn't
          uniformly random, though. And some are more frequent than others.
        </P>
        <P>Let's show some popular phrases on chords I, IV and V.</P>
        <E
          data="C3^D3^E3^F3^G3^A3^B3^C4 . C3-E3-G3 G3-B3-D4 C3-E3-G3 . C3-E3-G3 G3-B3-D4 C4-E4-G4 . C4-E4-G4 G3-B3-D4 C3-E3-G3"
          name="I V I, classical music is full of those"
        />
        <E data="C3-E3-G3 F3-A3-C4 C3-E3-G3" name="I IV I, rock, plagal" />
        <E
          data="C3-E3-G3 F3-A3-C4 G3-B3-D4 C3-E3-G3 . C4-E4-G4 F3-A3-C4 G3-B3-D4 C4-E4-G4"
          name="I IV V I, modern 'classical' turnaround"
        />
        <E
          data="F3-A3-C4 C3-E3-G3 G3-B3-D4 C3-E3-G3 . F3-A3-C4 C3-E3-G3 G2-B2-D3 C3-E3-G3"
          name="IV I V I"
        />
        <E
          data="C3-E3-G3 G3-B3-D4 F3-A3-C4 C3-E3-G3"
          name="I V IV I, bluesy, Mozart never did that"
        />
      </>
    ),
  },
];

export const LESSONS = LESSONS_WITHOUT_IDS.map((lesson, index) => ({
  ...lesson,
  id: index + 1,
}));
