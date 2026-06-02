/* ==========================================================================
   GAME COLLECTIBLES & ENTITIES: CAPTAIN CLAW ENTITY MODELS
   ========================================================================== */

import { Sound } from "./Sound.js";

// Helper to check if two rects intersect (AABB collision)
function rectIntersect(r1, r2) {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

// 1. BASE ENTITY
class GameEntity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.collected = false;
  }

  update(player) {}
  draw(ctx, cameraX) {}
}

// 2. GOLDEN COIN
export class Coin extends GameEntity {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.bounceTimer = Math.random() * 100;
    this.angle = Math.random() * Math.PI;
  }

  update(player, engine) {
    if (this.collected) return;

    // Hover floating effect
    this.bounceTimer += 0.05;
    this.angle += 0.05;

    // AABB Check with Player
    if (rectIntersect(this, player)) {
      this.collected = true;
      engine.addCoins(1);
      Sound.playCoin();
      
      // Spawn flying text
      engine.spawnTextPopup("+100 Loot", this.x + 10, this.y);
    }
  }

  draw(ctx, cameraX) {
    if (this.collected) return;

    ctx.save();
    // Parallax floating
    const floatY = Math.sin(this.bounceTimer) * 4;
    
    // Draw golden retro coin (rotating)
    ctx.translate(this.x + this.w/2 - cameraX, this.y + this.h/2 + floatY);
    ctx.scale(Math.abs(Math.sin(this.angle)), 1);

    // Inner gold circle
    ctx.beginPath();
    ctx.arc(0, 0, this.w/2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd700";
    ctx.fill();
    ctx.strokeStyle = "#b38600";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring detail
    ctx.beginPath();
    ctx.arc(0, 0, this.w/4, 0, Math.PI * 2);
    ctx.strokeStyle = "#cca300";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

// 3. SKILLS GLOWING GEM
export class Gem extends GameEntity {
  constructor(x, y, color = "#39ff14", skillName = "JS") {
    super(x, y, 22, 26);
    this.color = color;
    this.skillName = skillName;
    this.bounceTimer = Math.random() * 100;
  }

  update(player, engine) {
    if (this.collected) return;

    this.bounceTimer += 0.07;

    if (rectIntersect(this, player)) {
      this.collected = true;
      engine.addGem(1);
      Sound.playCoin();

      // Trigger dialogue pop-up or popup text
      engine.spawnTextPopup(`+1 ${this.skillName} Skill!`, this.x + 10, this.y, this.color);
    }
  }

  draw(ctx, cameraX) {
    if (this.collected) return;

    ctx.save();
    const floatY = Math.sin(this.bounceTimer) * 5;
    
    // Position drawing coordinates
    const px = this.x - cameraX;
    const py = this.y + floatY;

    // Draw glowing diamond polygon gem
    ctx.beginPath();
    ctx.moveTo(px + this.w/2, py);
    ctx.lineTo(px + this.w, py + this.h * 0.35);
    ctx.lineTo(px + this.w, py + this.h * 0.7);
    ctx.lineTo(px + this.w/2, py + this.h);
    ctx.lineTo(px, py + this.h * 0.7);
    ctx.lineTo(px, py + this.h * 0.35);
    ctx.closePath();

    // Fill with radial gradient for premium neon glow
    const grad = ctx.createRadialGradient(px + this.w/2, py + this.h/2, 2, px + this.w/2, py + this.h/2, this.w);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, this.color);
    grad.addColorStop(1, "rgba(0,0,0,0.5)");
    
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sparkle reflection glint
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(px + this.w * 0.35, py + this.h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 4. INTERACTIVE TREASURE CHEST
export class TreasureChest extends GameEntity {
  constructor(x, y, modalId, title, contentKey) {
    super(x, y, 48, 38);
    this.modalId = modalId;
    this.title = title;
    this.contentKey = contentKey;
    this.isOpen = false;
    this.isNear = false;
    this.spriteImg = new Image();
    this.spriteImg.src = "assets/treasure_chest.png";
    this.angle = 0;
  }

  update(player, engine) {
    // Check if player is near the chest to show interact prompt
    const interactionRange = {
      x: this.x - 20,
      y: this.y - 20,
      w: this.w + 40,
      h: this.h + 40
    };

    if (rectIntersect(interactionRange, player)) {
      this.isNear = true;
      // If player triggers up action (e.g. key W or UP) and chest is not open yet
      if (player.keys.upPressed && !this.isOpen) {
        this.open(engine);
      }
    } else {
      this.isNear = false;
    }
  }

  open(engine) {
    this.isOpen = true;
    Sound.playChestFanfare();
    engine.spawnTextPopup("Treasure Unlocked!", this.x + 24, this.y - 10, "#ffd700");
    
    // Open corresponding modal via engine modal manager
    setTimeout(() => {
      engine.openPortfolioModal(this.contentKey, this.title);
    }, 400);
  }

  draw(ctx, cameraX) {
    ctx.save();
    
    const px = this.x - cameraX;
    const py = this.y;

    // Draw chest graphic
    if (this.spriteImg.complete && this.spriteImg.naturalWidth !== 0) {
      // Draw pixel art asset from generate_image
      // Draw standard sizing box, crop bottom-half for open state if sprite is a spreadsheet
      ctx.drawImage(this.spriteImg, px, py, this.w, this.h);
    } else {
      // Elegant vector fallback: draws beautiful wood-textured chest
      ctx.fillStyle = this.isOpen ? "#523624" : "#2e1c10";
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      
      // Bottom Box
      ctx.fillRect(px, py + 12, this.w, this.h - 12);
      ctx.strokeRect(px, py + 12, this.w, this.h - 12);

      // Lid Arch
      ctx.beginPath();
      if (this.isOpen) {
        // Open lid rotated upwards
        ctx.arc(px + this.w/2, py + 6, this.w/2, Math.PI, Math.PI * 2);
        ctx.fillStyle = "#1a0f08";
        ctx.fill();
        ctx.strokeStyle = "#ffd700";
        ctx.stroke();
      } else {
        // Closed lid arch
        ctx.arc(px + this.w/2, py + 12, this.w/2, Math.PI, Math.PI * 2);
        ctx.fillStyle = "#523624";
        ctx.fill();
        ctx.stroke();
      }

      // Golden locks/details
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(px + this.w/2 - 4, py + 12, 8, 8);
      ctx.strokeRect(px + this.w/2 - 4, py + 12, 8, 8);
    }

    // Draw golden floating indicator if player is near and chest is closed
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

// 5. CLIMBABLE LADDER
export class Ladder extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y, w, h);
  }

  draw(ctx, cameraX) {
    ctx.save();
    ctx.strokeStyle = "#523624";
    ctx.lineWidth = 4;
    
    const px = this.x - cameraX;
    const steps = Math.floor(this.h / 16);

    // Left and Right Rails
    ctx.beginPath();
    ctx.moveTo(px + 4, this.y);
    ctx.lineTo(px + 4, this.y + this.h);
    ctx.moveTo(px + this.w - 4, this.y);
    ctx.lineTo(px + this.w - 4, this.y + this.h);
    ctx.stroke();

    // Rungs (Steps)
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

// 6. DECORATIONS (e.g. pirate flags, background ships)
export class Decoration extends GameEntity {
  constructor(x, y, type) {
    super(x, y, 40, 40);
    this.type = type;
  }

  draw(ctx, cameraX) {
    const px = this.x - cameraX;
    ctx.save();

    if (this.type === "barrel") {
      ctx.fillStyle = "#2e1c10";
      ctx.fillRect(px, this.y + 10, 24, 30);
      ctx.strokeStyle = "#523624";
      ctx.strokeRect(px, this.y + 10, 24, 30);
      
      // Iron bands
      ctx.fillStyle = "#555";
      ctx.fillRect(px, this.y + 16, 24, 3);
      ctx.fillRect(px, this.y + 30, 24, 3);
    } else if (this.type === "flag") {
      // Skull Flag pole
      ctx.strokeStyle = "#332211";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, this.y);
      ctx.lineTo(px, this.y + this.h);
      ctx.stroke();

      // Black Flag
      ctx.fillStyle = "#111";
      ctx.fillRect(px, this.y, 30, 18);
      
      // White skull detail (stylized dot)
      ctx.fillStyle = "#eee";
      ctx.beginPath();
      ctx.arc(px + 15, this.y + 9, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
