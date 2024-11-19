import React from "react";
import confetti from "canvas-confetti";
import { TaskConfig, TaskProgress } from "../types/tasks";

interface TaskProps {
  taskConfig: TaskConfig;
  progress?: number;
  status?: TaskProgress["status"];
  isActive?: boolean;
  activeNotes?: number;
  onActivate?: () => void;
}

export const Task: React.FC<TaskProps> = ({
  taskConfig,
  progress = 0,
  status = "active",
  isActive = false,
  onActivate,
}) => {
  const { total, description } = taskConfig;
  const isCompleting = status === "completing";
  const isCompleted = status === "completed";
  const percentage = Math.min((progress / total) * 100, 100);

  React.useEffect(() => {
    if (!isCompleted && !isCompleting && progress >= total) {
      confetti({
        particleCount: 1000,
        spread: 200,
        origin: { y: 0.8 },
      });
    }
  }, [progress, total, isCompleted, isCompleting]);

  return (
    <div
      className={`my-4 p-4 bg-gray-800 rounded-lg transition-all duration-300 ${
        isActive
          ? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg shadow-blue-500/50"
          : ""
      } ${onActivate ? "cursor-pointer hover:bg-gray-700" : ""}`}
      onClick={onActivate}
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
        <div className={`${isCompleted ? "text-green-400" : "text-gray-400"}`}>
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
      {isCompleting && (
        <div className="text-xs text-gray-500 mt-2">
          Release all keys to continue...
        </div>
      )}
    </div>
  );
};
