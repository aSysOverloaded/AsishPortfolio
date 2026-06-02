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

    if (!this.spriteImg && typeof window !== "undefined") {
      this.spriteImg = new Image();
      this.spriteImg.src = "/assets/treasure_chest.png";
    }

    if (this.spriteImg && this.spriteImg.complete && this.spriteImg.naturalWidth !== 0) {
      ctx.drawImage(this.spriteImg, px, py, this.w, this.h);
    } else {
      ctx.fillStyle = this.isOpen ? "#523624" : "#2e1c10";
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      
      ctx.fillRect(px, py + 12, this.w, this.h - 12);
      ctx.strokeRect(px, py + 12, this.w, this.h - 12);

      ctx.beginPath();
      if (this.isOpen) {
        ctx.arc(px + this.w/2, py + 6, this.w/2, Math.PI, Math.PI * 2);
        ctx.fillStyle = "#1a0f08";
        ctx.fill();
        ctx.strokeStyle = "#ffd700";
        ctx.stroke();
      } else {
        ctx.arc(px + this.w/2, py + 12, this.w/2, Math.PI, Math.PI * 2);
        ctx.fillStyle = "#523624";
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px + this.w/2 - 4, py + 12, 8, 8);
      ctx.strokeRect(px + this.w/2 - 4, py + 12, 8, 8);
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
    super(x, y, 40, 40);
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
      ctx.strokeStyle = "#332211";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, this.y);
      ctx.lineTo(px, this.y + this.h);
      ctx.stroke();

      ctx.fillStyle = "#111";
      ctx.fillRect(px, this.y, 30, 18);
      
      ctx.fillStyle = "#eee";
      ctx.beginPath();
      ctx.arc(px + 15, this.y + 9, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
