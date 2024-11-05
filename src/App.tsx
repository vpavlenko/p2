import React from "react";
import { PianoUI } from "./components/PianoUI";

const App: React.FC = () => {
  return (
    <div className="h-screen bg-black text-gray-100 font-sans relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-purple-950/30 pointer-events-none" />

      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-glow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-glow" />

      {/* Centered Piano */}
      <div className="relative">
        <PianoUI />
      </div>
    </div>
  );
};

export default App;
