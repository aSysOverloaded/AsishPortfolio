/* ==========================================================================
   APP BOOTSTRAPPER & ENTRANCE ORCHESTRATOR: PORTFOLIO MAIN ENTRYPOINT
   ========================================================================== */

import { Engine } from "./game/Engine.js";
import { Sound } from "./game/Sound.js";

window.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize the 2D Game Engine
  Engine.init("game-canvas");

  // 2. Perform responsive layout adjustments for game Canvas aspect ratios
  adjustCanvasScale();
  window.addEventListener("resize", adjustCanvasScale);

  // 3. Detect touch device capabilities and toggle HUD mobile joystick
  detectTouchDevice();
});

// Rescales canvas scaling factor dynamically to match desktop monitors beautifully
function adjustCanvasScale() {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;

  const winW = window.innerWidth;
  const winH = window.innerHeight;

  // We want the logical game height to ALWAYS be 576 logical pixels,
  // matching the level height perfectly!
  const zoom = winH / 576;

  // Set the logical drawing resolution dynamically to stretch/fill the width
  canvas.width = winW / zoom;
  canvas.height = 576;

  // Set visual CSS styling sizes to 100% of the screen
  canvas.style.width = `${winW}px`;
  canvas.style.height = `${winH}px`;
}

// Seamlessly toggle touch joysticks on mobile / tablet viewports
function detectTouchDevice() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  const mobileControls = document.getElementById("mobile-controls");
  
  if (mobileControls) {
    if (isTouch) {
      mobileControls.style.display = "flex";
      // Shrink keyboard hint displays if joystick is shown
      const hint = document.querySelector(".controls-hint");
      if (hint) {
        // Only keep the 'Classic View' toggle and strip text keys labels
        hint.style.fontSize = "0.75rem";
        hint.innerHTML = `<button id="game-to-classic-btn" class="classic-toggle-btn" style="pointer-events: auto;">Classic View</button>`;
        
        // Re-bind the dynamically wiped button event listener
        const btn = document.getElementById("game-to-classic-btn");
        if (btn) {
          btn.addEventListener("click", () => Engine.switchState("classic"));
        }
      }
    } else {
      mobileControls.style.display = "none";
    }
  }
}
