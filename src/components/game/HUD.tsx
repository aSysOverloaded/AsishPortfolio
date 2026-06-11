/* ==========================================================================
   GAME HUD COMPONENT: REACT OVERLAY LAYER WITH RECRUITER INSIGHTS
   ========================================================================== */

"use client";

import React, { useState } from "react";

interface HUDProps {
  coins: number;
  gems: number;
  health: number;
  collectedTraits: string[];
}

const ALL_TRAITS = [
  "Ownership",
  "Cross-team collaboration",
  "Problem solving",
  "Fast ramp-up",
  "Initiative"
];

export default function HUD({ coins, gems, health, collectedTraits = [] }: HUDProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const toggleChecklist = () => {
    setShowChecklist(!showChecklist);
  };

  const unlockedCount = collectedTraits.length;

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
        <div 
          className="hud-stat-item coin-tracker" 
          onClick={toggleChecklist}
          onMouseEnter={() => setShowChecklist(true)}
          onMouseLeave={() => setShowChecklist(false)}
          style={{ cursor: "pointer", position: "relative" }}
          aria-expanded={showChecklist}
          role="button"
          tabIndex={0}
        >
          <span className="hud-icon-coin" aria-hidden="true"></span>
          <span id="hud-coin-count">{coins}</span>
          
          <div className="hud-tooltip-hint">Insights</div>

          {showChecklist && (
            <div className="hud-traits-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="traits-dropdown-header">
                <h3>Developer Insights</h3>
                <span className="traits-dropdown-counter">{unlockedCount} / {ALL_TRAITS.length} Unlocked</span>
              </div>
              <div className="traits-dropdown-scroll">
                {ALL_TRAITS.map((trait, idx) => {
                  const isUnlocked = collectedTraits.includes(trait);
                  return (
                    <div key={idx} className={`trait-list-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      <span className="trait-status-icon">
                        {isUnlocked ? "✓" : "🔒"}
                      </span>
                      <span className="trait-list-name">
                        {isUnlocked ? trait : "??? (Collect coin)"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="traits-dropdown-footer">
                Collect gold coins to discover Asish Panda's developer highlights!
              </div>
            </div>
          )}
        </div>
        
        <div className="hud-stat-item">
          <span className="hud-icon-gem" aria-hidden="true"></span>
          <span id="hud-gem-count" style={{ fontSize: "0.85rem", fontFamily: "Cinzel", fontWeight: 700 }}>{gems} / 9 Skills</span>
        </div>
      </div>
    </div>
  );
}
