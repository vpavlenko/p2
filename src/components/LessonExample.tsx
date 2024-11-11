import React from "react";
import { LessonExample } from "../data/lessons";

export interface InlineExampleProps extends LessonExample {
  onPlay?: (example: LessonExample) => void;
  onStop?: () => void;
  isPlaying?: boolean;
}

export const BasicInlineExample: React.FC<InlineExampleProps> = ({
  id,
  name,
  type,
  data,
  description,
  onPlay,
  onStop,
  isPlaying = false,
}) => {
  console.log("BasicInlineExample rendered with props:", {
    id,
    name,
    type,
    data,
    description,
    onPlay: !!onPlay,
    onStop: !!onStop,
    isPlaying,
  });

  const handlePlay = () => {
    console.log("Play button clicked");
    if (onPlay) {
      console.log("Calling onPlay with example:", {
        id,
        name,
        type,
        data,
        description,
      });
      onPlay({ id, name, type, data, description });
    } else {
      console.log("onPlay is not defined!");
    }
  };

  return (
    <div className="my-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">{name}</h4>
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`px-4 py-2 rounded ${
              isPlaying
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Play
          </button>
          {isPlaying && onStop && (
            <button
              onClick={() => {
                console.log("Stop button clicked");
                onStop();
              }}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Stop
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};
