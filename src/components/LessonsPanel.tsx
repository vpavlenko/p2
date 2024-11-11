import React from "react";
import { LESSONS, LessonExample } from "../data/lessons";
import { Voicing } from "../constants/voicings";

interface LessonsPanelProps {
  onPlayExample: (example: LessonExample) => void;
  onStopPlaying: () => void;
  isPlaying: boolean;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = ({
  onPlayExample,
  onStopPlaying,
  isPlaying,
  currentLessonId,
  onLessonChange,
}) => {
  const currentLesson = LESSONS.find((lesson) => lesson.id === currentLessonId);

  return (
    <div className="lessons-panel">
      <div className="lesson-selector">
        <select
          value={currentLessonId}
          onChange={(e) => onLessonChange(Number(e.target.value))}
        >
          {LESSONS.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {currentLesson && (
        <div className="lesson-content">
          <h2>{currentLesson.title}</h2>
          <p>{currentLesson.description}</p>

          <div className="examples-list">
            {currentLesson.examples.map((example) => (
              <div key={example.id} className="example-item">
                <h3>{example.name}</h3>
                <p>{example.description}</p>
                <button
                  onClick={() => onPlayExample(example)}
                  disabled={isPlaying}
                >
                  Play Example
                </button>
              </div>
            ))}
          </div>

          {isPlaying && <button onClick={onStopPlaying}>Stop Playing</button>}
        </div>
      )}
    </div>
  );
};
