/* ==========================================================================
   GAME HUD COMPONENT: REACT OVERLAY LAYER
   ========================================================================== */

"use client";

import React from "react";

interface HUDProps {
  coins: number;
  gems: number;
  health: number;
}

export default function HUD({ coins, gems, health }: HUDProps) {
  return (
    <div id="game-hud">
      <img className="hud-avatar" src="/assets/claw_portrait.png" alt="Player Claw Avatar" />
      <div className="hud-bars">
        <span className="hud-name">CLAW</span>
        <div className="health-bar-container">
          <div 
            id="hud-health-fill" 
            className="health-bar-fill" 
            style={{ width: `${health}%` }}
          ></div>
        </div>
      </div>
      <div className="hud-stats">
        <div className="hud-stat-item">
          <span className="hud-icon-coin" aria-hidden="true"></span>
          <span id="hud-coin-count">{coins}</span>
        </div>
        <div className="hud-stat-item">
          <span className="hud-icon-gem" aria-hidden="true"></span>
          <span id="hud-gem-count">{gems}</span>
        </div>
      </div>
    </div>
  );
}
