/* ==========================================================================
   GAME COLLECTIBLES & ENTITIES: CAPTAIN CLAW ENTITY MODELS (TS VERSION)
   ========================================================================== */

import { Sound } from "./Sound";

export interface IEngine {
  addCoins(amount: number): void;
  addGem(amount: number): void;
  spawnTextPopup(text: string, x: number, y: number, color?: string): void;
  openPortfolioModal(contentKey: string, title: string): void;
  setPlayerCheckpoint(x: number, y: number): void;
  updateHealth(amount: number): void;
  health: number;
}

export interface IPlayer {
  x: number;
  y: number;
  w: number;
  h: number;
  keys: {
    upPressed: boolean;
    downPressed: boolean;
  };
}

// Helper to check AABB intersections
function rectIntersect(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

// Base Entity
export abstract class GameEntity {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public collected = false;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  abstract update(player: IPlayer, engine: IEngine): void;
  abstract draw(ctx: CanvasRenderingContext2D, cameraX: number): void;
}

// Golden Coin
export class Coin extends GameEntity {
  private bounceTimer: number;
  private angle: number;

  constructor(x: number, y: number) {
    super(x, y, 20, 20);
    this.bounceTimer = Math.random() * 100;
    this.angle = Math.random() * Math.PI;
  }

  public update(player: IPlayer, engine: IEngine) {
    if (this.collected) return;

    this.bounceTimer += 0.05;
    this.angle += 0.05;

    if (rectIntersect(this, player)) {
      this.collected = true;
      engine.addCoins(1);
      Sound.playCoin();
      engine.spawnTextPopup("+100 Loot", this.x + 10, this.y);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.collected) return;

    ctx.save();
    const floatY = Math.sin(this.bounceTimer) * 4;
    
    ctx.translate(this.x + this.w/2 - cameraX, this.y + this.h/2 + floatY);
    ctx.scale(Math.abs(Math.sin(this.angle)), 1);

    ctx.beginPath();
    ctx.arc(0, 0, this.w/2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd700";
    ctx.fill();
    ctx.strokeStyle = "#b38600";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, this.w/4, 0, Math.PI * 2);
    ctx.strokeStyle = "#cca300";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

// Glowing Skill Gem
export class Gem extends GameEntity {
  public color: string;
  public skillName: string;
  private bounceTimer: number;

  constructor(x: number, y: number, color = "#39ff14", skillName = "JS") {
    super(x, y, 22, 26);
    this.color = color;
    this.skillName = skillName;
    this.bounceTimer = Math.random() * 100;
  }

  public update(player: IPlayer, engine: IEngine) {
    if (this.collected) return;

    this.bounceTimer += 0.07;

    if (rectIntersect(this, player)) {
      this.collected = true;
      engine.addGem(1);
      Sound.playCoin();
      engine.spawnTextPopup(`+1 ${this.skillName} Skill!`, this.x + 10, this.y, this.color);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.collected) return;

    ctx.save();
    const floatY = Math.sin(this.bounceTimer) * 5;
    
    const px = this.x - cameraX;
    const py = this.y + floatY;

    ctx.beginPath();
    ctx.moveTo(px + this.w/2, py);
    ctx.lineTo(px + this.w, py + this.h * 0.35);
    ctx.lineTo(px + this.w, py + this.h * 0.7);
    ctx.lineTo(px + this.w/2, py + this.h);
    ctx.lineTo(px, py + this.h * 0.7);
    ctx.lineTo(px, py + this.h * 0.35);
    ctx.closePath();

    const grad = ctx.createRadialGradient(px + this.w/2, py + this.h/2, 2, px + this.w/2, py + this.h/2, this.w);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, this.color);
    grad.addColorStop(1, "rgba(0,0,0,0.5)");
    
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(px + this.w * 0.35, py + this.h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Interactive Chest
export class TreasureChest extends GameEntity {
  public modalId: string;
  public title: string;
  public contentKey: string;
  public isOpen = false;
  public isNear = false;
  private spriteImg: HTMLImageElement | null = null;

  constructor(x: number, y: number, modalId: string, title: string, contentKey: string) {
    super(x, y, 48, 38);
    this.modalId = modalId;
    this.title = title;
    this.contentKey = contentKey;
  }

  public update(player: IPlayer, engine: IEngine) {
    const interactionRange = {
      x: this.x - 20,
      y: this.y - 20,
      w: this.w + 40,
      h: this.h + 40
    };

    if (rectIntersect(interactionRange, player)) {
      this.isNear = true;
      if (player.keys.upPressed && !this.isOpen) {
        this.open(engine);
      }
    } else {
      this.isNear = false;
    }
  }

  public open(engine: IEngine) {
    this.isOpen = true;
    Sound.playChestFanfare();
    engine.spawnTextPopup("Treasure Unlocked!", this.x + 24, this.y - 10, "#ffd700");
    engine.setPlayerCheckpoint(this.x, this.y - 10);
    
    setTimeout(() => {
      engine.openPortfolioModal(this.contentKey, this.title);
    }, 400);
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    
    const px = this.x - cameraX;
    const py = this.y;

    if (this.isOpen) {
      // 1. Draw the base of the chest
      ctx.fillStyle = "#523624"; // Wood base
      ctx.fillRect(px, py + 16, this.w, this.h - 16);
      
      // Draw gold metal trim on corners
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px, py + 1, this.w, 2); // Lip
      ctx.fillRect(px, py + 16, 6, this.h - 16); // Left trim
      ctx.fillRect(px + this.w - 6, py + 16, 6, this.h - 16); // Right trim
      
      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py + 16, this.w, this.h - 16);

      // 2. Draw overflowing gold loot (coins and gems)
      ctx.fillStyle = "#ffd700"; // Gold coins
      ctx.beginPath();
      ctx.arc(px + 10, py + 16, 6, 0, Math.PI * 2);
      ctx.arc(px + 18, py + 14, 5, 0, Math.PI * 2);
      ctx.arc(px + 26, py + 15, 6, 0, Math.PI * 2);
      ctx.arc(px + 34, py + 17, 5, 0, Math.PI * 2);
      ctx.arc(px + 40, py + 19, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Sparkling ruby gems inside
      ctx.fillStyle = "#d92b2b";
      ctx.beginPath();
      ctx.moveTo(px + 14, py + 14);
      ctx.lineTo(px + 18, py + 10);
      ctx.lineTo(px + 22, py + 14);
      ctx.lineTo(px + 18, py + 18);
      ctx.closePath();
      ctx.fill();

      // Sparkling emerald gem
      ctx.fillStyle = "#39ff14";
      ctx.beginPath();
      ctx.moveTo(px + 28, py + 16);
      ctx.lineTo(px + 32, py + 12);
      ctx.lineTo(px + 36, py + 16);
      ctx.lineTo(px + 32, py + 20);
      ctx.closePath();
      ctx.fill();

      // 3. Draw the tilted open lid
      ctx.save();
      // Translate to lid hinge
      ctx.translate(px, py + 16);
      ctx.rotate(-Math.PI / 5); // 36 degrees open tilt
      
      ctx.fillStyle = "#7a543b"; // Lighter wood for lid
      // Draw lid arc/semicircle
      ctx.beginPath();
      ctx.arc(this.w / 2, 0, this.w / 2, Math.PI, 0, false);
      ctx.fill();
      
      // Lid outline and gold band
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.w / 2, 0, this.w / 2, Math.PI, 0, false);
      ctx.stroke();

      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.w, 0);
      ctx.stroke();
      
      ctx.restore();

      // Lock latch dangling open
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px + this.w/2 - 3, py + 16, 6, 8);
      ctx.strokeStyle = "#2e1c10";
      ctx.strokeRect(px + this.w/2 - 3, py + 16, 6, 8);

      // 4. Draw sparkles rising from the chest (animated by time)
      const sparkleOffset = Math.sin(Date.now() / 200) * 3;
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px monospace";
      ctx.fillText("✦", px + 8, py - 4 + sparkleOffset);
      ctx.fillText("✦", px + 36, py - 10 - sparkleOffset);

    } else {
      // CLOSED CHEST: High-fidelity procedural vector closed chest
      // 1. Draw the base of the chest
      ctx.fillStyle = "#523624"; // Wood base
      ctx.fillRect(px, py + 16, this.w, this.h - 16);
      
      // Draw gold metal trim on corners
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px, py + 16, 6, this.h - 16); // Left trim
      ctx.fillRect(px + this.w - 6, py + 16, 6, this.h - 16); // Right trim
      
      // Draw vertical gold bands on base
      ctx.fillRect(px + 12, py + 16, 2, this.h - 16);
      ctx.fillRect(px + this.w - 14, py + 16, 2, this.h - 16);

      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py + 16, this.w, this.h - 16);

      // 2. Draw the closed lid (curved top)
      ctx.fillStyle = "#7a543b"; // Lighter wood for lid (matches open lid)
      ctx.beginPath();
      ctx.arc(px + this.w / 2, py + 16, this.w / 2, Math.PI, 0, false);
      ctx.fill();

      // Lid gold rim trim
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + this.w / 2, py + 16, this.w / 2, Math.PI, 0, false);
      ctx.stroke();

      // Vertical gold bands on the lid
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2.5;
      
      // Left band on lid (x = px + 12)
      ctx.beginPath();
      ctx.moveTo(px + 12, py + 16 - 20.8);
      ctx.lineTo(px + 12, py + 16);
      ctx.stroke();

      // Right band on lid (x = px + 36)
      ctx.beginPath();
      ctx.moveTo(px + 36, py + 16 - 20.8);
      ctx.lineTo(px + 36, py + 16);
      ctx.stroke();

      // Lid base outline
      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py + 16);
      ctx.lineTo(px + this.w, py + 16);
      ctx.stroke();

      // 3. Draw padlock with keyhole
      // Lock loop (shackle)
      ctx.strokeStyle = "#777777";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + this.w / 2, py + 13, 4, Math.PI, 0, false);
      ctx.stroke();

      // Latch plate (brass / gold)
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px + this.w / 2 - 5, py + 12, 10, 10);
      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + this.w / 2 - 5, py + 12, 10, 10);

      // Keyhole in lock plate
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.arc(px + this.w / 2, py + 15, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + this.w / 2 - 1, py + 15);
      ctx.lineTo(px + this.w / 2 + 1, py + 15);
      ctx.lineTo(px + this.w / 2 + 1.5, py + 19);
      ctx.lineTo(px + this.w / 2 - 1.5, py + 19);
      ctx.closePath();
      ctx.fill();
    }

    if (this.isNear && !this.isOpen) {
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 11px Cinzel";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      ctx.fillText("PRESS [W / ↑] TO OPEN", px + this.w/2, py - 12);
    }

    ctx.restore();
  }
}

// Climbable Ladder
export class Ladder extends GameEntity {
  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w, h);
  }

  public update(player: IPlayer, engine: IEngine) {}

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    ctx.strokeStyle = "#523624";
    ctx.lineWidth = 4;
    
    const px = this.x - cameraX;
    const steps = Math.floor(this.h / 16);

    ctx.beginPath();
    ctx.moveTo(px + 4, this.y);
    ctx.lineTo(px + 4, this.y + this.h);
    ctx.moveTo(px + this.w - 4, this.y);
    ctx.lineTo(px + this.w - 4, this.y + this.h);
    ctx.stroke();

    ctx.strokeStyle = "#7a543b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const stepY = this.y + (i * 16);
      ctx.moveTo(px + 4, stepY);
      ctx.lineTo(px + this.w - 4, stepY);
    }
    ctx.stroke();

    ctx.restore();
  }
}

// Decoration Entity
export class Decoration extends GameEntity {
  public type: "barrel" | "flag";

  constructor(x: number, y: number, type: "barrel" | "flag") {
    super(x, y, 40, type === "flag" ? 72 : 40);
    this.type = type;
  }

  public update(player: IPlayer, engine: IEngine) {}

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const px = this.x - cameraX;
    ctx.save();

    if (this.type === "barrel") {
      ctx.fillStyle = "#2e1c10";
      ctx.fillRect(px, this.y + 10, 24, 30);
      ctx.strokeStyle = "#523624";
      ctx.strokeRect(px, this.y + 10, 24, 30);
      
      ctx.fillStyle = "#555";
      ctx.fillRect(px, this.y + 16, 24, 3);
      ctx.fillRect(px, this.y + 30, 24, 3);
    } else if (this.type === "flag") {
      // Flagpole
      ctx.strokeStyle = "#402c1d"; // Dark wood pole
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px + 4, this.y);
      ctx.lineTo(px + 4, this.y + this.h);
      ctx.stroke();

      // Gold ball on top of flagpole
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(px + 4, this.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2e1c10";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Flag Banner (drawn on the right side of the pole)
      // Waving gradient effect
      const grad = ctx.createLinearGradient(px + 4, 0, px + 36, 0);
      grad.addColorStop(0, "#222222");
      grad.addColorStop(0.25, "#0c0c0c");
      grad.addColorStop(0.5, "#2a2a2a");
      grad.addColorStop(0.75, "#050505");
      grad.addColorStop(1, "#181818");
      
      ctx.fillStyle = grad;
      ctx.fillRect(px + 4, this.y + 2, 32, 22);
      
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 4, this.y + 2, 32, 22);

      // Skull & Crossbones Emblem (Jolly Roger)
      // 1. Draw the crossed bones (behind skull)
      ctx.fillStyle = "#eeeeee";
      
      // Bone joints (knobs at the ends)
      // Top-left
      ctx.beginPath(); ctx.arc(px + 10, this.y + 6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 8, this.y + 8, 2, 0, Math.PI * 2); ctx.fill();
      // Bottom-left
      ctx.beginPath(); ctx.arc(px + 10, this.y + 20, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 8, this.y + 18, 2, 0, Math.PI * 2); ctx.fill();
      // Top-right
      ctx.beginPath(); ctx.arc(px + 30, this.y + 6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 32, this.y + 8, 2, 0, Math.PI * 2); ctx.fill();
      // Bottom-right
      ctx.beginPath(); ctx.arc(px + 30, this.y + 20, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 32, this.y + 18, 2, 0, Math.PI * 2); ctx.fill();

      // Crossing bone shafts
      ctx.strokeStyle = "#eeeeee";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px + 10, this.y + 7);
      ctx.lineTo(px + 30, this.y + 19);
      ctx.moveTo(px + 30, this.y + 7);
      ctx.lineTo(px + 10, this.y + 19);
      ctx.stroke();

      // 2. Draw the Skull
      ctx.fillStyle = "#eeeeee";
      // Skull head
      ctx.beginPath();
      ctx.arc(px + 20, this.y + 11, 5, 0, Math.PI * 2);
      ctx.fill();
      // Skull jaw
      ctx.fillRect(px + 18, this.y + 14, 4, 3.5);

      // Eyes (black)
      ctx.fillStyle = "#0c0c0c";
      ctx.beginPath();
      ctx.arc(px + 18.2, this.y + 11, 1.2, 0, Math.PI * 2);
      ctx.arc(px + 21.8, this.y + 11, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Nose cavity
      ctx.fillRect(px + 19.5, this.y + 13, 1, 1.2);

      // Teeth notches
      ctx.strokeStyle = "#0c0c0c";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(px + 19, this.y + 14.5);
      ctx.lineTo(px + 19, this.y + 17);
      ctx.moveTo(px + 21, this.y + 14.5);
      ctx.lineTo(px + 21, this.y + 17);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// Spikes / Spaghetti Code Hazard
export class Spikes extends GameEntity {
  private damageCooldown = 0;

  constructor(x: number, y: number) {
    super(x, y, 32, 20);
  }

  public update(player: IPlayer, engine: IEngine) {
    if (this.damageCooldown > 0) {
      this.damageCooldown--;
      return;
    }

    if (rectIntersect(this, player)) {
      this.damageCooldown = 60; // 1 second invulnerability
      engine.updateHealth(-15);
      engine.spawnTextPopup("-15 Health: Spaghetti Code!", this.x + 16, this.y - 10, "#d92b2b");
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const px = this.x - cameraX;
    const py = this.y;

    // Draw sharp red spike cones
    ctx.fillStyle = "#d92b2b";
    ctx.strokeStyle = "#5a0f0f";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(px, py + this.h);
    ctx.lineTo(px + 5, py);
    ctx.lineTo(px + 10, py + this.h);
    
    ctx.moveTo(px + 10, py + this.h);
    ctx.lineTo(px + 16, py);
    ctx.lineTo(px + 22, py + this.h);

    ctx.moveTo(px + 22, py + this.h);
    ctx.lineTo(px + 27, py);
    ctx.lineTo(px + 32, py + this.h);
    
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Potion Jar / Refactor Boost
export class PotionJar extends GameEntity {
  constructor(x: number, y: number) {
    super(x, y, 20, 20);
  }

  public update(player: IPlayer, engine: IEngine) {
    if (this.collected) return;

    if (rectIntersect(this, player)) {
      if (engine.health >= 100) return; // Do not collect if health is already full
      this.collected = true;
      engine.updateHealth(25);
      Sound.playCoin();
      engine.spawnTextPopup("+25 Health: Potion - Developer's Coffee!", this.x + 10, this.y - 10, "#2ecc71");
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.collected) return;
    ctx.save();

    const floatY = Math.sin(Date.now() / 250) * 3;
    const px = this.x - cameraX;
    const py = this.y + floatY;

    // 1. Draw Potion Jar Cork
    ctx.fillStyle = "#8c5230"; // Wood cork brown
    ctx.fillRect(px + 8, py + 1, 4, 3);
    
    // Draw Glass Neck
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 7, py + 4, 6, 4);

    // Draw Glass Bulb Base (circle)
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(px + 10, py + 13, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Draw Green Potion Liquid inside the bulb (half full)
    ctx.fillStyle = "#2ecc71"; // Green health potion
    ctx.beginPath();
    ctx.arc(px + 10, py + 13, 5.5, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // 3. Draw white reflection shine on the glass bulb
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px + 7, py + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Sparkling rising potion bubbles
    const bubbleOffset = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = "rgba(46, 204, 113, 0.6)"; // Green bubbles
    ctx.beginPath();
    ctx.arc(px + 8, py - 2 + bubbleOffset, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 13, py - 6 - bubbleOffset, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Boss Nemesis / Technical Debt Captain
export class Boss extends GameEntity {
  public dialogueTriggered = false;

  constructor(x: number, y: number) {
    super(x, y, 48, 48);
  }

  public update(player: IPlayer, engine: IEngine) {
    const range = {
      x: this.x - 60,
      y: this.y - 60,
      w: this.w + 120,
      h: this.h + 120
    };

    if (rectIntersect(range, player) && !this.dialogueTriggered) {
      this.dialogueTriggered = true;
      engine.openPortfolioModal("victory", "The Code Review Duel!");
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    const px = this.x - cameraX;
    const py = this.y;

    // Draw Captain Red-Tail (Nemesis Red Cat) procedurally
    ctx.translate(px + this.w/2, py + this.h/2);
    ctx.scale(-1, 1); // Face left towards player

    // Coat (Red)
    ctx.fillStyle = "#d92b2b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-10, -4, 20, 24, [4, 4, 1, 1])
      : ctx.rect(-10, -4, 20, 24);
    ctx.fill();

    // Gold trim
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-2, 2, 4, 18);

    // Head (Orange-Red cat)
    ctx.fillStyle = "#a82020";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-11, -16, 22, 18, [8, 8, 4, 4])
      : ctx.rect(-11, -16, 22, 18);
    ctx.fill();

    // Hook (left arm)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(12, 10, 5, -Math.PI/2, Math.PI/2, false);
    ctx.stroke();
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(8, 7, 4, 6);

    // Pirate Hat
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-15, -16);
    ctx.quadraticCurveTo(0, -24, 15, -16);
    ctx.quadraticCurveTo(8, -18, 0, -28);
    ctx.quadraticCurveTo(-8, -18, -15, -16);
    ctx.closePath();
    ctx.fill();

    // Eyepatch
    ctx.fillStyle = "#111";
    ctx.fillRect(-6, -11, 5, 5);

    ctx.restore();
  }
}

// Climbable & Swingable Pendulum Rope Entity
export class Rope extends GameEntity {
  public pivotX: number;
  public pivotY: number;
  public length: number;
  public angle = 0.0;
  public angleVelocity = 0.0;

  constructor(x: number, y: number, length: number) {
    // x, y specifies the pivot point of the pendulum rope
    super(x, y, 16, length);
    this.pivotX = x;
    this.pivotY = y;
    this.length = length;
  }

  public update(player: IPlayer, engine: IEngine) {
    // 1. Natural pendulum motion gravity & friction dampening
    const gravity = 0.025; 
    const damping = 0.993; 
    
    // accel = -g/L * sin(theta)
    const angleAccel = -(gravity / (this.length / 32)) * Math.sin(this.angle);
    this.angleVelocity += angleAccel;
    this.angleVelocity *= damping;
    this.angle += this.angleVelocity;

    const p = player as any;

    // 2. Handle swinging controls if player is currently attached
    if (p.swingingRope === this) {
      // Pumping swing left/right: only apply force if input matches travel direction (or near rest)
      if (p.keys.leftPressed && this.angleVelocity <= 0.002) {
        this.angleVelocity -= 0.0014;
      }
      if (p.keys.rightPressed && this.angleVelocity >= -0.002) {
        this.angleVelocity += 0.0014;
      }
      
      // Speed clamp for game stability
      this.angleVelocity = Math.max(-0.045, Math.min(0.045, this.angleVelocity));
    } else {
      // 3. Grab detection (only when player is in the air and cooldown has expired)
      if (p.ropeGrabCooldown && p.ropeGrabCooldown > 0) return;
      if (p.climbing || p.grounded) return;

      // Find current rope end position
      const currentLength = this.length * (p.ropeClimbProgress || 1.0);
      const endX = this.pivotX + Math.sin(this.angle) * currentLength;
      const endY = this.pivotY + Math.cos(this.angle) * currentLength;

      // Check distance from player center to rope end
      const playerCenterX = p.x + p.w / 2;
      const playerCenterY = p.y + p.h / 2;
      const dx = playerCenterX - endX;
      const dy = playerCenterY - endY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 26) {
        // Grab! Attach player to the rope
        p.swingingRope = this;
        p.ropeClimbProgress = 1.0;
        
        // Transfer player velocity to swing velocity
        this.angleVelocity += p.vx * 0.003;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    
    const px = this.pivotX - cameraX;
    const py = this.pivotY;
    
    const segments = 10;
    const points: { x: number; y: number }[] = [];
    
    // Perpendicular vector to the main rope direction
    const perpX = Math.cos(this.angle);
    const perpY = -Math.sin(this.angle);
    const time = Date.now();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Projection along the straight line
      const sx = px + Math.sin(this.angle) * this.length * t;
      const sy = py + Math.cos(this.angle) * this.length * t;

      // Flex curve due to swing velocity (inertia lag) + wind ripple waves
      // Sine multiplier anchors the wave to 0 displacement at the pivot (t=0) and knob (t=1)
      const amplitude = Math.sin(t * Math.PI);
      const flex = this.angleVelocity * 135 * amplitude;
      const ripple = Math.sin(time * 0.008 + t * 5.2) * 2.5 * amplitude;
      
      const displacement = flex + ripple;

      points.push({
        x: sx + perpX * displacement,
        y: sy + perpY * displacement
      });
    }

    const endPoint = points[points.length - 1];

    // Draw the main rope strand
    ctx.strokeStyle = "#7a543b"; // Rope brown
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw rope spiral pattern (fibers)
    ctx.strokeStyle = "#523624";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]); 

    // Draw pivot iron ring pin
    ctx.fillStyle = "#333333";
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw a neat climbing knot handle at the bottom
    ctx.fillStyle = "#8c5230";
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#402c1d";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
