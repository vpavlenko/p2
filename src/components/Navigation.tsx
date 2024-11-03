import React from 'react';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Lesson {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface NavigationProps {
  lessons: Lesson[];
  setActiveLesson: (chapter: Chapter) => void;
  activeLesson?: Chapter;
}

function Navigation({ lessons, setActiveLesson, activeLesson }: NavigationProps) {
  return (
    <nav className="space-y-6">
      <div className="space-y-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {lesson.title}
            </h3>
            <div className="space-y-1">
              {lesson.chapters.map((chapter) => {
                const isActive = chapter.id === activeLesson?.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveLesson(chapter)}
                    className={`w-full text-left py-2 px-3 text-sm rounded-lg transition-colors relative ${
                      isActive
                        ? 'text-white bg-indigo-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500" />
                    )}
                    {chapter.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;