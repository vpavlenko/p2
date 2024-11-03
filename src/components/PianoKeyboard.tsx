import React from "react";

const PianoKeyboard: React.FC = () => {
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  return (
    <div className="relative h-48 flex">
      {/* White Keys */}
      <div className="flex flex-1 relative">
        {whiteKeys.map((note, index) => (
          <button
            key={note}
            className="flex-1 h-full bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors rounded-b-lg border-r border-gray-200 last:border-r-0"
            aria-label={`${note} key`}
          />
        ))}
      </div>

      {/* Black Keys */}
      <div className="absolute top-0 left-0 flex h-32 w-full">
        {blackKeys.map((note, index) => (
          <button
            key={note}
            className="w-8 h-full bg-gray-900 hover:bg-gray-800 active:bg-gray-700 transition-colors rounded-b-lg absolute"
            style={{
              left: `${
                index < 2 ? index * 14.28 + 10 : (index + 1) * 14.28 + 10
              }%`,
            }}
            aria-label={`${note} key`}
          />
        ))}
      </div>
    </div>
  );
};

export default PianoKeyboard;
