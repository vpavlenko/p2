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
  currentlyPlayingId: string | null;
}

// Helper function to generate consistent ID
const generateExampleId = (name: string, data: string) => `${name}:${data}`;

export const BasicInlineExample: React.FC<BasicInlineExampleProps> = ({
  name,
  data,
  onPlayExample,
  onStopPlaying,
  currentlyPlayingId,
}) => {
  const exampleId = generateExampleId(name, data);
  const isThisPlaying = currentlyPlayingId === exampleId;

  console.log(`Example ${name}:`, {
    exampleId,
    isThisPlaying,
    currentlyPlayingId,
  });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          console.log(`Clicked example ${name}:`, {
            exampleId,
            isThisPlaying,
            currentlyPlayingId,
            action: isThisPlaying ? "stop" : "play",
          });
          isThisPlaying ? onStopPlaying() : onPlayExample({ name, data });
        }}
        className="text-gray-700 hover:text-blue-600 transition-colors"
      >
        {isThisPlaying ? (
          <StopIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>
      <span className="font-mono">{name}</span>
    </div>
  );
};
