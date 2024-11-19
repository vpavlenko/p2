import { ColorMode } from "../components/types";
import { KeyboardMapping } from "../constants/keyboard";
import { LESSONS } from "../data/lessons";

export interface TaskConfig {
  id: string;
  description: string;
  total: number;
  keyboardMapping?: KeyboardMapping;
  colorMode?: ColorMode;
  chromaticNotes?: number[];
  checkProgress: (
    note: number,
    octave: number,
    playedNotes: Set<string>
  ) => boolean;
  nextTaskId?: string | null;
  requiredProgress: number;
  previousTaskId?: string | null;
}

export interface TaskProgress {
  taskId: string;
  progress: number;
  status: "active" | "completing" | "completed";
}

export const TASK_SEQUENCE = [
  "play-c-across-octaves",
  "play-d-across-octaves",
  "play-e-across-octaves",
  "play-f-across-octaves",
  "play-g-across-octaves",
  "play-a-across-octaves",
  "play-b-across-octaves",
  "play-d-again",
  "play-c-sharp",
] as const;

// Helper function to get accumulated keyboard mappings up to a given task
const getAccumulatedKeyMapping = (taskIndex: number): KeyboardMapping => {
  const allMappings: Record<number, KeyboardMapping> = {
    0: {
      KeyZ: { note: 0, octave: 2 }, // C2
      KeyA: { note: 0, octave: 3 }, // C3
      KeyQ: { note: 0, octave: 4 }, // C4
      Digit1: { note: 0, octave: 5 }, // C5
    },
    1: {
      KeyX: { note: 2, octave: 2 }, // D2
      KeyS: { note: 2, octave: 3 }, // D3
      KeyW: { note: 2, octave: 4 }, // D4
      Digit2: { note: 2, octave: 5 }, // D5
    },
    2: {
      KeyC: { note: 4, octave: 2 }, // E2
      KeyD: { note: 4, octave: 3 }, // E3
      KeyE: { note: 4, octave: 4 }, // E4
      Digit3: { note: 4, octave: 5 }, // E5
    },
    3: {
      KeyV: { note: 5, octave: 2 }, // F2
      KeyF: { note: 5, octave: 3 }, // F3
      KeyR: { note: 5, octave: 4 }, // F4
      Digit4: { note: 5, octave: 5 }, // F5
    },
    4: {
      KeyB: { note: 7, octave: 2 }, // G2
      KeyG: { note: 7, octave: 3 }, // G3
      KeyT: { note: 7, octave: 4 }, // G4
      Digit5: { note: 7, octave: 5 }, // G5
    },
    5: {
      KeyN: { note: 9, octave: 2 }, // A2
      KeyH: { note: 9, octave: 3 }, // A3
      KeyY: { note: 9, octave: 4 }, // A4
      Digit6: { note: 9, octave: 5 }, // A5
    },
    6: {
      KeyM: { note: 11, octave: 2 }, // B2
      KeyJ: { note: 11, octave: 3 }, // B3
      KeyU: { note: 11, octave: 4 }, // B4
      Digit7: { note: 11, octave: 5 }, // B5
    },
  };

  return Object.entries(allMappings)
    .filter(([index]) => parseInt(index) <= taskIndex)
    .reduce((acc, [, mapping]) => ({ ...acc, ...mapping }), {});
};

// Helper function to create task config
const createTaskConfig = (
  index: number,
  targetNote: number,
  description: string,
  chromaticNotes: number[]
): TaskConfig => {
  return {
    id: TASK_SEQUENCE[index],
    description,
    total: 4,
    requiredProgress: 4,
    previousTaskId: index > 0 ? TASK_SEQUENCE[index - 1] : null,
    nextTaskId:
      index < TASK_SEQUENCE.length - 1 ? TASK_SEQUENCE[index + 1] : null,
    chromaticNotes,
    keyboardMapping: getAccumulatedKeyMapping(index),
    checkProgress: (note: number, octave: number, playedNotes: Set<string>) => {
      if (note !== targetNote || ![2, 3, 4, 5].includes(octave)) {
        return false;
      }
      const noteKey = `${note}-${octave}`;
      return !playedNotes.has(noteKey);
    },
  };
};

export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "play-c-across-octaves": createTaskConfig(
    0,
    0,
    "Play C notes across different octaves",
    [0]
  ),
  "play-d-across-octaves": createTaskConfig(
    1,
    2,
    "Play D notes across different octaves",
    [0, 2]
  ),
  "play-e-across-octaves": createTaskConfig(
    2,
    4,
    "Play E notes across different octaves",
    [0, 2, 4]
  ),
  "play-f-across-octaves": createTaskConfig(
    3,
    5,
    "Play F notes across different octaves",
    [0, 2, 4, 5]
  ),
  "play-g-across-octaves": createTaskConfig(
    4,
    7,
    "Play G notes across different octaves",
    [0, 2, 4, 5, 7]
  ),
  "play-a-across-octaves": createTaskConfig(
    5,
    9,
    "Play A notes across different octaves",
    [0, 2, 4, 5, 7, 9]
  ),
  "play-b-across-octaves": createTaskConfig(
    6,
    11,
    "Play B notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11]
  ),
  "play-d-again": createTaskConfig(
    0,
    2,
    "Play D notes again using X, S, W, 2 keys",
    [0, 2, 4, 5, 7, 9, 11]
  ),
  "play-c-sharp": createTaskConfig(
    1,
    1,
    "Play C# notes using Z, A, Q, 1 keys",
    [0, 1, 2, 4, 5, 7, 9, 11]
  ),
};

export const isTaskCompleted = (taskId: string, progress: number): boolean => {
  const config = TASK_CONFIGS[taskId];
  return config && progress >= config.requiredProgress;
};

export const canTaskBeActivated = (
  taskId: string,
  taskProgress: TaskProgress[],
  currentLessonId: number
): boolean => {
  const config = TASK_CONFIGS[taskId];
  if (!config) return false;

  // Find which lesson this task belongs to
  const taskLesson = LESSONS.find((lesson) => lesson.taskIds.includes(taskId));
  if (!taskLesson || taskLesson.id !== currentLessonId) {
    return false; // Don't activate if task is not in current lesson
  }

  if (!config.previousTaskId) return true;

  const previousTask = taskProgress.find(
    (t) => t.taskId === config.previousTaskId
  );
  const previousTaskProgress = previousTask?.progress || 0;

  return isTaskCompleted(config.previousTaskId, previousTaskProgress);
};

export const getNextTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.nextTaskId || null;
};

export const getPreviousTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.previousTaskId || null;
};
