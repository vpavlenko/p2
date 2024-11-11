import React from "react";
import { LessonExample } from "../data/lessons";

export interface InlineExampleProps extends LessonExample {
  isPlaying?: boolean;
  onPlay: (example: LessonExample) => void;
  onStop: () => void;
}

export const InlineExample: React.FC<InlineExampleProps> = ({
  id,
  name,
  type,
  data,
  description,
  isPlaying,
  onPlay,
  onStop,
}) => {
  const example = { id, name, type, data, description };

  return (
    <div className="bg-gray-800 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold text-purple-300">{name}</h4>
        {isPlaying ? (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={() => onPlay(example)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Play Example
          </button>
        )}
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
};

export const BasicInlineExample: React.FC<InlineExampleProps> = (props) => {
  return <InlineExample {...props} onPlay={() => {}} onStop={() => {}} />;
};
