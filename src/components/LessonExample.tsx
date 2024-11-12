import React from "react";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

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
        className="text-gray-700 hover:text-blue-600 transition-colors"
      >
        {isPlaying ? (
          <StopIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>
      <span className="font-mono">{name}</span>
    </div>
  );
};
