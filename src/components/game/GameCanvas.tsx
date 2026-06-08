/* ==========================================================================
   GAME CANVAS RENDERING SYSTEM: REACT CANVAS COMPONENT
   ========================================================================== */

"use client";

import React, { useEffect, useRef } from "react";
import { Engine } from "../../game/Engine";

interface GameCanvasProps {
  onOpenModal: (contentKey: string, title: string) => void;
  onCoinsChange: (count: number) => void;
  onGemsChange: (count: number) => void;
  onHealthChange: (health: number) => void;
}

export default function GameCanvas({
  onOpenModal,
  onCoinsChange,
  onGemsChange,
  onHealthChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Maintain references to latest callbacks to avoid triggering useEffect re-runs
  const callbacksRef = useRef({
    onOpenModal,
    onCoinsChange,
    onGemsChange,
    onHealthChange,
  });

  // Keep references updated on every render
  useEffect(() => {
    callbacksRef.current = {
      onOpenModal,
      onCoinsChange,
      onGemsChange,
      onHealthChange,
    };
  }, [onOpenModal, onCoinsChange, onGemsChange, onHealthChange]);

  useEffect(() => {
    // 1. Initialize engine
    Engine.init("game-canvas");
    
    // 2. Setup stable React synchronization hooks
    Engine.onOpenModal = (key: string, title: string) => {
      callbacksRef.current.onOpenModal(key, title);
    };
    Engine.onCoinsChange = (count: number) => {
      callbacksRef.current.onCoinsChange(count);
    };
    Engine.onGemsChange = (count: number) => {
      callbacksRef.current.onGemsChange(count);
    };
    Engine.onHealthChange = (health: number) => {
      callbacksRef.current.onHealthChange(health);
    };

    // 3. Setup scales resize handling
    const adjustCanvasScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Always maintain 576 logical height to perfectly scale level details
      const zoom = winH / 576;

      canvas.width = winW / zoom;
      canvas.height = 576;

      canvas.style.width = `${winW}px`;
      canvas.style.height = `${winH}px`;
    };

    adjustCanvasScale();
    window.addEventListener("resize", adjustCanvasScale);

    // 4. Start game loop
    Engine.switchState("playing");

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener("resize", adjustCanvasScale);
      Engine.stopLoop();
      Engine.onOpenModal = null;
      Engine.onCoinsChange = null;
      Engine.onGemsChange = null;
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      id="game-canvas"
      style={{ display: "block" }}
    ></canvas>
  );
}
