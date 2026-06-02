/* ==========================================================================
   CORE CANVAS ENGINE & LOOP MANAGER: CAPTAIN CLAW GAME ENGINE
   ========================================================================== */

import { Level } from "./Level.js";
import { Player } from "./Player.js";
import { Sound } from "./Sound.js";
import { portfolioData } from "../../portfolioData.js";
import { ClassicView } from "../portfolio/ClassicView.js";

class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = "menu"; // "menu", "playing", "classic"

    this.level = null;
    this.player = null;

    this.cameraX = 0;
    this.coinsCount = 0;
    this.gemsCount = 0;

    // Text Particle popups (e.g. "+100 Gold", "+1 JS Skill")
    this.textPopups = [];

    // Animation frames tracking
    this.animationFrameId = null;
    this.lastTime = 0;
  }

  // Bind engine to Canvas DOM context
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Initialize Game state entities
    this.level = new Level();
    this.player = new Player(100, 420); // Spawn at starting docks coordinates

    // Bind controls
    this.setupControls();
    
    // Bind global state click listeners
    this.setupViewButtons();
  }

  startLoop() {
    this.lastTime = performance.now();
    this.loop();
  }

  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop() {
    // Standard delta time update frame independent physics
    const now = performance.now();
    const dt = (now - this.lastTime) / 16.666; // Normalized to 60fps
    this.lastTime = now;

    if (this.gameState === "playing") {
      this.update(dt);
      this.draw();
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    // 1. Update Player movement physics
    this.player.update(this.level);

    // 2. Update level items triggers
    this.level.update(this.player, this);

    // 3. Coordinate virtual camera tracking
    // Keep Claw centered on screen horizontally
    const targetCamX = this.player.x - this.canvas.width / 2 + this.player.w / 2;
    // Clamp camera within level bounds
    this.cameraX = Math.max(0, Math.min(this.level.width - this.canvas.width, targetCamX));

    // 4. Update flying text popups
    this.updateTextPopups();
  }

  draw() {
    // Clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // A. Render Level (Background + Tiles + Collectibles)
    this.level.draw(this.ctx, this.cameraX);

    // B. Render Player (Claw)
    this.player.draw(this.ctx, this.cameraX);

    // C. Render flying text popup animations
    this.drawTextPopups();
  }

  // --- STATS & SCORE SYSTEM ---
  addCoins(amount) {
    this.coinsCount += amount;
    const hudCoin = document.getElementById("hud-coin-count");
    if (hudCoin) hudCoin.textContent = this.coinsCount;
  }

  addGem(amount) {
    this.gemsCount += amount;
    const hudGem = document.getElementById("hud-gem-count");
    if (hudGem) hudGem.textContent = this.gemsCount;
  }

  // --- FLOATING RETRO TEXT PARTICLES ---
  spawnTextPopup(text, x, y, color = "#ffd700") {
    this.textPopups.push({
      text: text,
      x: x,
      y: y,
      vy: -1.5,
      timer: 45, // frames remaining
      color: color
    });
  }

  updateTextPopups() {
    for (let i = this.textPopups.length - 1; i >= 0; i--) {
      const pop = this.textPopups[i];
      pop.y += pop.vy;
      pop.timer--;
      if (pop.timer <= 0) {
        this.textPopups.splice(i, 1);
      }
    }
  }

  drawTextPopups() {
    this.ctx.save();
    this.ctx.font = "bold 13px Outfit";
    this.ctx.textAlign = "center";
    this.ctx.shadowColor = "#000";
    this.ctx.shadowBlur = 4;

    this.textPopups.forEach(pop => {
      // Fade out dynamically near end
      const opacity = Math.min(1, pop.timer / 15);
      this.ctx.fillStyle = pop.color;
      this.ctx.globalAlpha = opacity;
      this.ctx.fillText(pop.text, pop.x - this.cameraX, pop.y);
    });

    this.ctx.restore();
  }

  // --- KEYBOARD & MOBILE CONTROL BINDINGS ---
  setupControls() {
    // Key Down listeners
    window.addEventListener("keydown", (e) => {
      if (this.gameState !== "playing") return;

      switch(e.code) {
        case "KeyA":
        case "ArrowLeft":
          this.player.keys.leftPressed = true;
          break;
        case "KeyD":
        case "ArrowRight":
          this.player.keys.rightPressed = true;
          break;
        case "KeyW":
        case "ArrowUp":
          this.player.keys.upPressed = true;
          break;
        case "KeyS":
        case "ArrowDown":
          this.player.keys.downPressed = true;
          break;
        case "Space":
          e.preventDefault(); // stop browser scroll
          this.player.jump();
          break;
      }
    });

    // Key Up listeners
    window.addEventListener("keyup", (e) => {
      switch(e.code) {
        case "KeyA":
        case "ArrowLeft":
          this.player.keys.leftPressed = false;
          break;
        case "KeyD":
        case "ArrowRight":
          this.player.keys.rightPressed = false;
          break;
        case "KeyW":
        case "ArrowUp":
          this.player.keys.upPressed = false;
          break;
        case "KeyS":
        case "ArrowDown":
          this.player.keys.downPressed = false;
          break;
      }
    });

    // Mobile Joypad listeners
    const setupJoyBtn = (elementId, actionName) => {
      const btn = document.getElementById(elementId);
      if (!btn) return;

      const triggerAction = (state) => {
        if (actionName === "jump") {
          if (state) this.player.jump();
        } else {
          this.player.keys[actionName] = state;
        }
      };

      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        triggerAction(true);
      });
      btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        triggerAction(false);
      });
      // Fallback click for testing
      btn.addEventListener("mousedown", () => triggerAction(true));
      btn.addEventListener("mouseup", () => triggerAction(false));
    };

    setupJoyBtn("joy-left", "leftPressed");
    setupJoyBtn("joy-right", "rightPressed");
    setupJoyBtn("joy-up", "upPressed");
    setupJoyBtn("joy-jump", "jump");
  }

  // --- STATE SWITCH VIEW METHODS ---
  setupViewButtons() {
    const playBtn = document.getElementById("menu-play-btn");
    const classicBtn = document.getElementById("menu-classic-btn");
    const gameToClassicBtn = document.getElementById("game-to-classic-btn");
    const classicPlayBtn = document.getElementById("classic-play-btn");

    if (playBtn) playBtn.addEventListener("click", () => this.switchState("playing"));
    if (classicBtn) classicBtn.addEventListener("click", () => this.switchState("classic"));
    if (gameToClassicBtn) gameToClassicBtn.addEventListener("click", () => this.switchState("classic"));
    if (classicPlayBtn) classicPlayBtn.addEventListener("click", () => this.switchState("playing"));

    // Audio toggles
    const musicBtn = document.getElementById("toggle-music-btn");
    const sfxBtn = document.getElementById("toggle-sfx-btn");

    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        const isPlaying = Sound.toggleMusic();
        musicBtn.classList.toggle("muted", !isPlaying);
      });
    }

    if (sfxBtn) {
      sfxBtn.addEventListener("click", () => {
        const isEnabled = Sound.toggleSFX();
        sfxBtn.classList.toggle("muted", !isEnabled);
      });
    }
  }

  switchState(newState) {
    // Trigger audio initialization context
    Sound.init();

    // 1. Hide active sections
    document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
    
    this.stopLoop();

    if (newState === "playing") {
      this.gameState = "playing";
      document.getElementById("game-view").classList.add("active");
      
      // If player fell or is reset, spawn safely
      this.player.resetToCheckpoint();
      
      // Auto enable sound music shanty loop if not muted already
      Sound.resumeContext();
      if (Sound.musicEnabled) {
        Sound.stopShantyLoop();
        Sound.playShantyLoop();
      }

      this.startLoop();
    } else if (newState === "classic") {
      this.gameState = "classic";
      document.getElementById("classic-portfolio").classList.add("active");
      
      // Render classic fields
      ClassicView.init();
      ClassicView.animateSkillBars();
    } else {
      this.gameState = "menu";
      document.getElementById("main-menu").classList.add("active");
    }
  }

  // --- RETRO PARCHMENT MODAL HANDLERS ---
  openPortfolioModal(contentKey, title) {
    const modal = document.getElementById("game-modal");
    const titleField = document.getElementById("modal-title-field");
    const contentField = document.getElementById("modal-content-field");
    const closeBtn = document.getElementById("modal-close-btn");

    if (!modal || !contentField) return;

    // Pause game ticks
    this.stopLoop();

    titleField.textContent = title;
    contentField.innerHTML = "";

    // Generate specific content layout based on key
    if (contentKey === "about") {
      const { story, philosophy } = portfolioData.about;
      contentField.innerHTML = `
        <p class="scroll-story">"${story}"</p>
        <h4 style="font-family: Cinzel; margin-bottom: 6px;">Philosophical Creed:</h4>
        <p style="line-height: 1.5; font-size: 0.95rem;">${philosophy}</p>
      `;
    } else if (contentKey === "skills") {
      let skillsHtml = "";
      portfolioData.skills.forEach(s => {
        skillsHtml += `
          <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(46,28,16,0.15); padding-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-family: Cinzel;">
              <span>${s.name}</span>
              <span style="color: #8c510a;">${s.level}% Mastery</span>
            </div>
            <p style="font-size: 0.85rem; line-height: 1.3; color: #444; margin-top: 2px;">${s.description}</p>
          </div>
        `;
      });
      contentField.innerHTML = `
        <div style="max-height: 45vh; overflow-y: auto; padding-right: 8px;">
          ${skillsHtml}
        </div>
      `;
    } else if (contentKey === "experience") {
      let expHtml = "";
      portfolioData.experience.forEach(e => {
        expHtml += `
          <div style="margin-bottom: 16px; border-left: 2.5px solid var(--color-wood-light); padding-left: 12px;">
            <span style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: #8c510a;">${e.year}</span>
            <h4 style="font-family: Cinzel; font-weight: 700; margin: 2px 0;">${e.role}</h4>
            <div style="font-size: 0.85rem; font-style: italic; color: #555; margin-bottom: 4px;">${e.company}</div>
            <p style="font-size: 0.9rem; line-height: 1.4; color: #3e2d20;">${e.description}</p>
          </div>
        `;
      });
      contentField.innerHTML = `
        <div style="max-height: 45vh; overflow-y: auto; padding-right: 8px;">
          ${expHtml}
        </div>
      `;
    } else if (contentKey === "projects") {
      let listHtml = "";
      portfolioData.projects.forEach(p => {
        const tags = p.tech.map(t => `<span class="scroll-project-tech">${t}</span>`).join(" ");
        listHtml += `
          <div class="scroll-project-item">
            <div class="scroll-project-header">
              <span class="scroll-project-title">${p.title}</span>
              <div>${tags}</div>
            </div>
            <p style="font-size: 0.9rem; line-height: 1.4; color: #444;">${p.description}</p>
            <div class="scroll-project-links">
              <a class="scroll-link" href="${p.github}" target="_blank">View Code 🐙</a>
              <a class="scroll-link" href="${p.live}" target="_blank">Live Vessel ⚓</a>
            </div>
          </div>
        `;
      });
      contentField.innerHTML = `
        <div class="scroll-projects-list">
          ${listHtml}
        </div>
      `;
    } else if (contentKey === "contact") {
      const { email, github, linkedin } = portfolioData.contact;
      contentField.innerHTML = `
        <p style="margin-bottom: 1rem; line-height: 1.4;">Stand fast! Fill this scroll parchment dispatch to send an direct avian pigeon message to Captain Asish, or trace standard tracks:</p>
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: center; font-family: Cinzel; font-weight: 700;">
          <a class="scroll-link" href="mailto:${email}">Email Dispatch</a>
          <a class="scroll-link" href="${github}" target="_blank">GitHub</a>
          <a class="scroll-link" href="${linkedin}" target="_blank">LinkedIn</a>
        </div>
        
        <form id="game-modal-contact-form" class="scroll-form">
          <div class="form-group">
            <label class="form-label" for="m-name">Recruiter Name</label>
            <input class="form-input" id="m-name" type="text" placeholder="e.g. Admiral Nelson" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="m-email">Vessel Email Address</label>
            <input class="form-input" id="m-email" type="email" placeholder="nelson@navy.mil" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="m-msg">Message Dispatch</label>
            <textarea class="form-textarea" id="m-msg" rows="3" placeholder="Ahoy Captain! I have a high stakes mission..." required></textarea>
          </div>
          <button class="form-submit" type="submit">DISPATCH MESSAGE</button>
        </form>
      `;

      // Set up form submission handler inside modal
      setTimeout(() => {
        const modalForm = document.getElementById("game-modal-contact-form");
        if (modalForm) {
          modalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const rName = document.getElementById("m-name").value;
            alert(`Message sent by ${rName}! Captain Asish has received your avian scroll!`);
            modalForm.reset();
            this.closeModal(modal);
          });
        }
      }, 50);
    }

    modal.classList.add("active");

    const closeHandler = () => {
      this.closeModal(modal);
      closeBtn.removeEventListener("click", closeHandler);
    };
    closeBtn.addEventListener("click", closeHandler);
  }

  closeModal(modal) {
    modal.classList.remove("active");
    // Clear and resume loop
    this.startLoop();
  }
}

export const Engine = new GameEngine();
