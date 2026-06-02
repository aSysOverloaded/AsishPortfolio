/* ==========================================================================
   MOBILE TOUCH CONTROLS OVERLAY COMPONENT: JOYS / DPADS
   ========================================================================== */

"use client";

import React from "react";
import { Engine } from "../../game/Engine";

export default function MobileControls() {
  const triggerKeyAction = (actionName: string, state: boolean) => {
    if (!Engine.player) return;
    
    if (actionName === "jump") {
      if (state) Engine.player.jump();
    } else {
      const keys = Engine.player.keys as Record<string, boolean>;
      keys[actionName] = state;
    }
  };

  const bindTouch = (actionName: string) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        triggerKeyAction(actionName, true);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        triggerKeyAction(actionName, false);
      },
      onMouseDown: () => triggerKeyAction(actionName, true),
      onMouseUp: () => triggerKeyAction(actionName, false),
    };
  };

  return (
    <div id="mobile-controls">
      <div className="mobile-dpad">
        <button className="mobile-btn" aria-label="Move left" {...bindTouch("leftPressed")}>←</button>
        <button className="mobile-btn" aria-label="Move right" {...bindTouch("rightPressed")}>→</button>
        <button className="mobile-btn" aria-label="Climb up or interact" {...bindTouch("upPressed")}>↑</button>
      </div>
      <div className="mobile-actions">
        <button className="mobile-btn" aria-label="Jump" {...bindTouch("jump")}>JUMP</button>
      </div>
    </div>
  );
}
