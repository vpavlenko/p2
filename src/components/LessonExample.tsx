import React from "react";

export interface LessonExample {
  name: string;
  data: string;
}

interface BasicInlineExampleProps {
  name: string;
  data: string;
  onPlayExample: (example: LessonExample) => void;
  onStopPlaying: () => void;
  isPlaying: boolean;
}

export const BasicInlineExample: React.FC<BasicInlineExampleProps> = ({
  name,
  data,
  onPlayExample,
  onStopPlaying,
  isPlaying,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          isPlaying ? onStopPlaying() : onPlayExample({ name, data })
        }
        className="px-2 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600"
      >
        {isPlaying ? "Stop" : "Play"}
      </button>
      <span className="font-mono">{name}</span>
    </div>
  );
};
