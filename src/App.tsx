import React, { useState } from 'react';
import { BookOpen, Piano, Music, Menu, X } from 'lucide-react';
import Navigation from './components/Navigation';
import PianoKeyboard from './components/PianoKeyboard';
import { lessons } from './data/lessons';

function App() {
  const [activeLesson, setActiveLesson] = useState(lessons[0].chapters[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans relative">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-purple-950/30 pointer-events-none" />
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-glow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-glow" />

      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <Music className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg p-1.5 text-black" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                  Harmonia
                </h1>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Library</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Piano className="w-5 h-5" />
                <span className="font-medium">Practice</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-black/95 border-r border-gray-800/50 backdrop-blur-xl transform transition-transform duration-300 ease-in-out z-40 ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full pt-24">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <Navigation 
            lessons={lessons} 
            setActiveLesson={setActiveLesson} 
            activeLesson={activeLesson}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 container mx-auto relative">
        <div className="flex gap-8 p-6">
          {/* Left Column - Content */}
          <div className="w-1/2 min-h-[calc(100vh-8rem)]">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {activeLesson.title}
            </h2>
            <div className="prose prose-invert prose-lg max-w-none">
              {activeLesson.content}
            </div>
          </div>

          {/* Right Column - Interactive Playground */}
          <div className="w-1/2 min-h-[calc(100vh-8rem)]">
            <div className="sticky top-24 space-y-8">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Interactive Playground
              </h3>
              
              {/* Piano Keyboard */}
              <div>
                <PianoKeyboard />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Chord Progression</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 text-sm font-medium shadow-lg shadow-indigo-500/20">
                      Play
                    </button>
                    <button className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-700">
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['I', 'IV', 'V', 'vi'].map((chord) => (
                    <button
                      key={chord}
                      className="p-4 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-colors border border-gray-800/50 backdrop-blur-sm font-medium"
                    >
                      {chord}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;