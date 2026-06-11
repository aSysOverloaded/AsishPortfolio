/* ==========================================================================
   MAIN ROUTING PAGE: NEXT.JS CORE APPLICATION LANDING VIEW
   ========================================================================== */

"use client";

import React, { useState, useEffect } from "react";
import { Engine } from "../game/Engine";
import GameCanvas from "../components/game/GameCanvas";
import HUD from "../components/game/HUD";
import MobileControls from "../components/game/MobileControls";
import AudioControls from "../components/game/AudioControls";
import ParchmentModal from "../components/game/ParchmentModal";
import ClassicPortfolio from "../components/portfolio/ClassicPortfolio";

export default function Home() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "classic">("menu");
  
  // Game Hud Reactive States
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [health, setHealth] = useState(100);
  const [collectedTraits, setCollectedTraits] = useState<string[]>([]);

  // Parchment Modal Triggers
  const [modalActive, setModalActive] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContentKey, setModalContentKey] = useState("");

  // Mobile joystick layout indicator
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // 1. Setup global state synchronization hooks
    Engine.onStateChange = (state) => {
      setGameState(state);
    };
    Engine.onHealthChange = (h) => {
      setHealth(h);
    };
    Engine.onTraitsChange = (traits) => {
      setCollectedTraits([...traits]);
    };

    // 2. Detect touch capability to safely enable on-screen joystick controllers
    const isTouch = 
      ("ontouchstart" in window) || 
      (navigator.maxTouchPoints > 0) || 
      ((navigator as any).msMaxTouchPoints > 0);
    setIsTouchDevice(isTouch);

    // 3. Custom event listener to switch to classic portfolio from victory overlay
    const handleSwitchClassic = () => {
      Engine.switchState("classic");
    };
    const handleSwitchMenu = () => {
      Engine.switchState("menu");
    };
    window.addEventListener("switch-to-classic", handleSwitchClassic);
    window.addEventListener("switch-to-menu", handleSwitchMenu);

    return () => {
      Engine.onStateChange = null;
      Engine.onHealthChange = null;
      Engine.onTraitsChange = null;
      window.removeEventListener("switch-to-classic", handleSwitchClassic);
      window.removeEventListener("switch-to-menu", handleSwitchMenu);
    };
  }, []);

  const handlePlayGame = () => {
    // Zero score count resets
    setCoins(0);
    setGems(0);
    setHealth(100);
    setCollectedTraits([]);
    Engine.coinsCount = 0;
    Engine.gemsCount = 0;
    Engine.collectedTraits = [];
    Engine.victoryTriggered = false;
    
    Engine.switchState("playing");
  };

  const handleClassicPortfolio = () => {
    Engine.switchState("classic");
  };

  const handleMainMenu = () => {
    Engine.switchState("menu");
  };

  const handleOpenModal = (key: string, title: string) => {
    setModalContentKey(key);
    setModalTitle(title);
    setModalActive(true);
  };

  const handleCloseModal = () => {
    setModalActive(false);
    // Resume the game loops
    Engine.startLoop();
  };

  return (
    <>
      {/* Dynamic Floating Global Sound Controllers */}
      <AudioControls gameState={gameState} />

      {/* ==========================================
           1. MAIN MENU VIEW (PIRATE THEME OVERLAY)
           ========================================== */}
      {gameState === "menu" && (
        <section id="main-menu" className="view-section active">
          <div className="menu-header">
            <span className="menu-logo-sub">Interactive Developer</span>
            <h1 className="menu-logo">CAPTAIN ASISH PANDA</h1>
          </div>

          <div className="menu-box">
            <button onClick={handlePlayGame} className="menu-btn primary" type="button">
              PLAY GAME
            </button>
            <button onClick={handleClassicPortfolio} className="menu-btn" type="button">
              CLASSIC PORTFOLIO
            </button>
          </div>

          <div className="menu-character-card">
            <img className="char-portrait" src="/assets/claw_portrait.png" alt="Captain Claw avatar portrait" />
            <div className="char-dialog">
              <h4 style={{ fontFamily: "Cinzel", color: "#ffd700", fontSize: "0.9rem", fontWeight: 700, marginBottom: "2px" }}>
                Captain Claw
              </h4>
              <p className="char-dialog-text">&ldquo;Ahoy, recruiter! Ready for a legendary portfolio adventure?&rdquo;</p>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
           2. PLAYABLE 2D SCROLLER VIEW
           ========================================== */}
      {gameState === "playing" && (
        <section id="game-view" className="view-section active" style={{ display: "block" }}>
          
          {/* Dynamic HUD selector */}
          <HUD coins={coins} gems={gems} health={health} collectedTraits={collectedTraits} />

          {/* HTML5 Canvas Binder */}
          <GameCanvas 
            onOpenModal={handleOpenModal}
            onCoinsChange={setCoins}
            onGemsChange={setGems}
            onHealthChange={setHealth}
          />

          {/* Desktop HUD Hint details overlay */}
          <div className="controls-hint">
            {!isTouchDevice ? (
              <>
                <span><span className="key-badge">A</span> <span className="key-badge">D</span> / <span className="key-badge">←</span> <span className="key-badge">→</span> Walk</span>
                <span><span className="key-badge">Space</span> Jump</span>
                <span><span className="key-badge">W</span> / <span className="key-badge">↑</span> Ladder / Open Chest</span>
                <span><span className="key-badge">F</span> / <span className="key-badge">J</span> Attack</span>
              </>
            ) : (
              <span>Touch joysticks active</span>
            )}
            <button onClick={handleClassicPortfolio} className="classic-toggle-btn" style={{ pointerEvents: "auto", marginLeft: "10px" }}>
              Classic View
            </button>
          </div>

          {/* Joysticks for mobile screens */}
          {isTouchDevice && <MobileControls />}

          {/* Parchment modal for in-game chests */}
          <ParchmentModal 
            active={modalActive}
            title={modalTitle}
            contentKey={modalContentKey}
            onClose={handleCloseModal}
          />
        </section>
      )}

      {/* ==========================================
           3. CLASSIC WEB PORTFOLIO VIEW
           ========================================== */}
      {gameState === "classic" && (
        <ClassicPortfolio onToggleGame={handlePlayGame} />
      )}
    </>
  );
}
