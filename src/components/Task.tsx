import React from "react";
import confetti from "canvas-confetti";

interface TaskProps {
  id: string;
  total: number;
  description: string;
  progress?: number;
  onComplete?: () => void;
  nextTask?: React.ReactNode;
  isActive?: boolean;
}

export const Task: React.FC<TaskProps> = ({
  total,
  description,
  progress = 0,
  onComplete,
  nextTask,
  isActive = false,
}) => {
  const [isCompleted, setIsCompleted] = React.useState(false);
  const percentage = Math.min((progress / total) * 100, 100);

  React.useEffect(() => {
    if (!isCompleted && progress >= total) {
      setIsCompleted(true);
      onComplete?.();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [progress, total, onComplete, isCompleted]);

  return (
    <>
      <div
        className={`my-4 p-4 bg-gray-800 rounded-lg transition-all duration-300 ${
          isActive
            ? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg shadow-blue-500/50"
            : ""
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="text-white">
            {isCompleted ? (
              <span className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {description}
              </span>
            ) : (
              description
            )}
          </div>
          <div
            className={`${isCompleted ? "text-green-400" : "text-gray-400"}`}
          >
            {isCompleted ? "Completed!" : `${progress}/${total}`}
          </div>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              isCompleted ? "bg-green-400" : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isCompleted && nextTask}
    </>
  );
};
