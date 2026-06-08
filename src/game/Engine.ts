/* ==========================================================================
   CORE CANVAS ENGINE & LOOP MANAGER: CAPTAIN CLAW GAME ENGINE (TS VERSION)
   ========================================================================== */

import { Level } from "./Level";
import { Player } from "./Player";
import { Sound } from "./Sound";

export interface TextPopup {
  text: string;
  x: number;
  y: number;
  vy: number;
  timer: number;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  public gameState: "menu" | "playing" | "classic" = "menu";
  public level: Level | null = null;
  public player: Player | null = null;
  
  public cameraX = 0;
  public coinsCount = 0;
  public gemsCount = 0;
  public victoryTriggered = false;
  
  private textPopups: TextPopup[] = [];
  private animationFrameId: number | null = null;
  private lastTime = 0;

  public health = 100;

  // React State Synchronization Callbacks
  public onOpenModal: ((contentKey: string, title: string) => void) | null = null;
  public onCoinsChange: ((count: number) => void) | null = null;
  public onGemsChange: ((count: number) => void) | null = null;
  public onHealthChange: ((health: number) => void) | null = null;
  public onStateChange: ((state: "menu" | "playing" | "classic") => void) | null = null;

  constructor() {
    this.level = new Level();
    this.player = new Player(100, 420);
  }

  public init(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.setupControls();
  }

  public startLoop() {
    this.stopLoop(); // Halted any running animation loops to prevent parallel duplicates
    this.lastTime = performance.now();
    this.loop();
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop() {
    const now = performance.now();
    const dt = (now - this.lastTime) / 16.666;
    this.lastTime = now;

    if (this.gameState === "playing") {
      this.update(dt);
      this.draw();
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private update(dt: number) {
    if (!this.player || !this.level) return;

    this.player.update(this.level);
    this.level.update(this.player, this);

    // Camera scrolling
    if (this.canvas) {
      const targetCamX = this.player.x - this.canvas.width / 2 + this.player.w / 2;
      this.cameraX = Math.max(0, Math.min(this.level.width - this.canvas.width, targetCamX));
    }

    this.updateTextPopups();
  }

  private draw() {
    if (!this.ctx || !this.canvas || !this.level || !this.player) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.level.draw(this.ctx, this.cameraX);
    this.player.draw(this.ctx, this.cameraX);
    this.drawTextPopups();
  }

  // Score stats
  public addCoins(amount: number) {
    this.coinsCount += amount;
    if (this.onCoinsChange) this.onCoinsChange(this.coinsCount);
  }

  public addGem(amount: number) {
    this.gemsCount += amount;
    if (this.onGemsChange) this.onGemsChange(this.gemsCount);
  }

  // Floating text particles
  public spawnTextPopup(text: string, x: number, y: number, color = "#ffd700") {
    this.textPopups.push({
      text: text,
      x: x,
      y: y,
      vy: -0.6,
      timer: 100,
      color: color
    });
  }

  public setPlayerCheckpoint(x: number, y: number) {
    if (this.player) {
      this.player.setCheckpoint(x, y);
    }
  }

  private updateTextPopups() {
    for (let i = this.textPopups.length - 1; i >= 0; i--) {
      const pop = this.textPopups[i];
      pop.y += pop.vy;
      pop.timer--;
      if (pop.timer <= 0) {
        this.textPopups.splice(i, 1);
      }
    }
  }

  private drawTextPopups() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.font = "bold 13px Outfit";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;

    this.textPopups.forEach(pop => {
      const opacity = Math.min(1, pop.timer / 30);
      ctx.fillStyle = pop.color;
      ctx.globalAlpha = opacity;
      ctx.fillText(pop.text, pop.x - this.cameraX, pop.y);
    });

    ctx.restore();
  }

  // Keyboard controls
  private setupControls() {
    window.addEventListener("keydown", (e) => {
      if (this.gameState !== "playing" || !this.player) return;

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
          e.preventDefault();
          this.player.jump();
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (!this.player) return;
      
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
  }

  // Switch View States
  public switchState(newState: "menu" | "playing" | "classic") {
    Sound.init();
    this.stopLoop();
    this.gameState = newState;

    if (this.onStateChange) this.onStateChange(newState);

    if (newState === "playing") {
      this.health = 100;
      if (this.onHealthChange) this.onHealthChange(100);
      if (this.player) this.player.resetToCheckpoint();
      Sound.resumeContext();
      if (Sound.musicEnabled) {
        Sound.stopShantyLoop();
        Sound.playShantyLoop();
      }
      this.startLoop();
    }
  }

  // Modal actions triggered from chest opens
  public openPortfolioModal(contentKey: string, title: string) {
    this.stopLoop();
    if (this.onOpenModal) {
      this.onOpenModal(contentKey, title);
    }
  }

  // Health and Death systems
  public updateHealth(amount: number) {
    this.health = Math.max(0, Math.min(100, this.health + amount));
    if (this.onHealthChange) this.onHealthChange(this.health);
    if (this.health <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    Sound.playHurt();
    this.spawnTextPopup("Code Crashed!", this.player?.x || 100, this.player?.y || 420, "#d92b2b");
    this.health = 100;
    if (this.onHealthChange) this.onHealthChange(this.health);
    if (this.player) {
      this.player.resetToCheckpoint();
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }
}

export const Engine = new GameEngine();
