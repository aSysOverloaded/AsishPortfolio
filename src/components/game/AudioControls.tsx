/* ==========================================================================
   AUDIO CONTROLS FLOATING COMPONENT: MUSIC & SFX MUTERS
   ========================================================================== */

"use client";

import React, { useState } from "react";
import { Sound } from "../../game/Sound";

export default function AudioControls() {
  const [musicEnabled, setMusicEnabled] = useState(Sound.musicEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(Sound.sfxEnabled);

  const handleToggleMusic = () => {
    const isPlaying = Sound.toggleMusic();
    setMusicEnabled(isPlaying);
  };

  const handleToggleSFX = () => {
    const isEnabled = Sound.toggleSFX();
    setSfxEnabled(isEnabled);
  };

  return (
    <div id="audio-controls">
      <button 
        onClick={handleToggleMusic} 
        className={`audio-btn ${!musicEnabled ? "muted" : ""}`}
        title="Toggle Sea Shanty Background Music" 
        aria-label="Toggle music"
      >
        🎵
      </button>
      <button 
        onClick={handleToggleSFX} 
        className={`audio-btn ${!sfxEnabled ? "muted" : ""}`}
        title="Toggle Synthesized SFX" 
        aria-label="Toggle sound effects"
      >
        🔊
      </button>
    </div>
  );
}
