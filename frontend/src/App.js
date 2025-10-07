import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PlatformSelector from './components/PlatformSelector';
import WindowsPanelWrapper from './components/WindowsPanelWrapper';
import LinuxPanelWrapper from './components/linux/LinuxPanelWrapper';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PlatformSelector />} />
        <Route path="/windows" element={<WindowsPanelWrapper />} />
        <Route path="/linux" element={<LinuxPanelWrapper />} />
      </Routes>
    </HashRouter>
  );
}

export default App;