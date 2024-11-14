import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PianoController } from "./components/PianoController";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/p/:lessonId" element={<PianoController />} />
        <Route path="/p" element={<Navigate to="/p/1" replace />} />
        <Route path="*" element={<Navigate to="/p/1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
