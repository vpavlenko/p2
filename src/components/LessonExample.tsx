import React from "react";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";

export interface LessonExample {
  name: string;
  data: string;
  tonic?: string;
}

interface BasicInlineExampleProps extends LessonExample {
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

  const handleClick = () => {
    console.log(`Clicked example ${name}:`, {
      exampleId,
      isThisPlaying,
      currentlyPlayingId,
      action: isThisPlaying ? "stop" : "play",
    });
    if (isThisPlaying) {
      onStopPlaying();
    } else {
      onPlayExample({ name, data });
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-yellow-200 hover:text-blue-300 transition-colors"
      >
        {isThisPlaying ? (
          <StopIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
        <span className="font-sans">{name}</span>
      </button>
    </div>
  );
};
