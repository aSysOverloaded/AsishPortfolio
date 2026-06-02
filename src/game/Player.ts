/* ==========================================================================
   PLAYER PHYSICS & ANIMATION MODEL: CAPTAIN CLAW PLAYER (TS VERSION)
   ========================================================================== */

import { Sound } from "./Sound";

export interface ILevel {
  tileSize: number;
  width: number;
  height: number;
  isSolid(col: number, row: number): boolean;
  isLadderAt(x: number, y: number): boolean;
}

export class Player {
  public x: number;
  public y: number;
  public w = 20;
  public h = 44;

  public vx = 0;
  public vy = 0;

  // Constants
  public speed = 3.5;
  public climbSpeed = 2.5;
  public jumpForce = 8.0;
  public doubleJumpForce = 7.0;
  public gravity = 0.4;
  public friction = 0.82;

  // Bools
  public grounded = false;
  public climbing = false;
  public facingLeft = false;
  public hasDoubleJumped = false;

  // Key configurations
  public keys = {
    leftPressed: false,
    rightPressed: false,
    upPressed: false,
    downPressed: false,
    spacePressed: false
  };

  // Animation ticks
  public walkCycle = 0;
  public isWalking = false;

  // Checkpoints
  private spawnX: number;
  private spawnY: number;

  // Grace / Gamefeel Timers
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
  }

  public resetToCheckpoint() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.climbing = false;
    this.grounded = false;
  }

  public setCheckpoint(x: number, y: number) {
    this.spawnX = x;
    this.spawnY = y;
  }

  public update(level: ILevel) {
    this.isWalking = false;

    // Grace / Gamefeel Timers
    if (this.grounded || this.climbing) {
      this.coyoteTimer = 6;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    if (this.jumpBufferTimer > 0) this.jumpBufferTimer--;

    // Process buffered jumps
    if (this.jumpBufferTimer > 0) {
      if (this.climbing) {
        this.climbing = false;
        this.vy = -this.jumpForce;
        this.hasDoubleJumped = false;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        Sound.playJump();
      } else if (this.grounded || this.coyoteTimer > 0) {
        this.vy = -this.jumpForce;
        this.grounded = false;
        this.hasDoubleJumped = false;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        Sound.playJump();
      }
    }

    // 1. INPUT HANDLING
    if (this.climbing) {
      this.vy = 0;
      if (this.keys.upPressed) {
        this.vy = -this.climbSpeed;
      } else if (this.keys.downPressed) {
        this.vy = this.climbSpeed;
      }
      
      if (this.keys.leftPressed) {
        this.vx = -this.speed * 0.6;
        this.facingLeft = true;
      } else if (this.keys.rightPressed) {
        this.vx = this.speed * 0.6;
        this.facingLeft = false;
      } else {
        this.vx = 0;
      }

      // Check if we left the ladder or reached the top to step onto the platform
      const playerCenter = { x: this.x + this.w/2, y: this.y + this.h/2 };
      const currentTileY = Math.floor((this.y + this.h / 2) / level.tileSize);
      const hasLadderAbove = level.isLadderAt(this.x + this.w / 2, (currentTileY - 1) * level.tileSize + level.tileSize / 2);

      if (!level.isLadderAt(playerCenter.x, playerCenter.y)) {
        this.climbing = false;
      } else if (!hasLadderAbove && this.keys.upPressed) {
        // Topmost tile stepping snap
        const tileTopY = currentTileY * level.tileSize;
        if (this.y + this.h <= tileTopY + 12) {
          this.y = tileTopY - this.h;
          this.climbing = false;
          this.grounded = true;
          this.vy = 0;
          this.vx = 0;
        }
      }
    } else {
      // Normal Platforming physics
      if (this.keys.leftPressed) {
        this.vx = -this.speed;
        this.facingLeft = true;
        this.isWalking = true;
      } else if (this.keys.rightPressed) {
        this.vx = this.speed;
        this.facingLeft = false;
        this.isWalking = true;
      } else {
        this.vx *= this.friction;
      }

      this.vy += this.gravity;
      if (this.vy > 12) this.vy = 12;

      // Check if overlapping ladder to start climbing
      const leftCol = Math.floor(this.x / level.tileSize);
      const rightCol = Math.floor((this.x + this.w - 1) / level.tileSize);
      const centerY = this.y + this.h / 2;
      
      let climbingLadderCol = -1;
      if (level.isLadderAt(leftCol * level.tileSize + level.tileSize / 2, centerY)) {
        climbingLadderCol = leftCol;
      } else if (level.isLadderAt(rightCol * level.tileSize + level.tileSize / 2, centerY)) {
        climbingLadderCol = rightCol;
      }

      if (climbingLadderCol !== -1) {
        if (this.keys.upPressed || this.keys.downPressed) {
          this.climbing = true;
          this.vx = 0;
          this.vy = 0;
          this.x = (climbingLadderCol * level.tileSize + level.tileSize / 2) - this.w / 2;
        }
      }
    }

    // 2. POSITION INTEGRATION & SOLID BLOCKS COLLISION
    this.x += this.vx;
    this.checkCollisionsX(level);

    this.y += this.vy;
    this.grounded = false;
    this.checkCollisionsY(level);

    if (this.isWalking && this.grounded) {
      this.walkCycle += 0.25;
    } else {
      this.walkCycle = 0;
    }

    if (this.y > level.height + 100) {
      this.fallIntoWater();
    }
  }

  public jump() {
    this.jumpBufferTimer = 6;

    // Double jump is triggered instantly if we are in the air and Coyote Time has expired
    if (!this.grounded && !this.climbing && this.coyoteTimer <= 0 && !this.hasDoubleJumped) {
      this.vy = -this.doubleJumpForce;
      this.hasDoubleJumped = true;
      this.jumpBufferTimer = 0;
      Sound.playJump();
    }
  }

  private fallIntoWater() {
    Sound.playHurt();
    this.resetToCheckpoint();
  }

  private checkCollisionsX(level: ILevel) {
    const leftTile = Math.floor(this.x / level.tileSize);
    const rightTile = Math.floor((this.x + this.w) / level.tileSize);
    const topTile = Math.floor(this.y / level.tileSize);
    const bottomTile = Math.floor((this.y + this.h - 2) / level.tileSize);

    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }

    for (let r = topTile; r <= bottomTile; r++) {
      if (level.isSolid(leftTile, r)) {
        this.x = (leftTile + 1) * level.tileSize;
        this.vx = 0;
        break;
      }
      if (level.isSolid(rightTile, r)) {
        this.x = rightTile * level.tileSize - this.w;
        this.vx = 0;
        break;
      }
    }
  }

  private checkCollisionsY(level: ILevel) {
    const leftTile = Math.floor(this.x / level.tileSize);
    const rightTile = Math.floor((this.x + this.w - 1) / level.tileSize);
    const topTile = Math.floor(this.y / level.tileSize);
    const bottomTile = Math.floor((this.y + this.h) / level.tileSize);

    for (let col = leftTile; col <= rightTile; col++) {
      if (level.isSolid(col, topTile) && this.vy < 0) {
        this.y = (topTile + 1) * level.tileSize;
        this.vy = 0.1;
        break;
      }

      // One-way landing at top of ladders
      const isLadder = level.isLadderAt(col * level.tileSize + level.tileSize/2, bottomTile * level.tileSize + level.tileSize/2);
      const isLadderAbove = level.isLadderAt(col * level.tileSize + level.tileSize/2, (bottomTile - 1) * level.tileSize + level.tileSize/2);
      
      const treatAsSolid = level.isSolid(col, bottomTile) || 
        (isLadder && !isLadderAbove && this.vy >= 0 && !this.keys.downPressed && !this.climbing);

      if (treatAsSolid && this.vy >= 0) {
        const feetPrevY = this.y + this.h - this.vy;
        const tileTopY = bottomTile * level.tileSize;
        
        if (feetPrevY <= tileTopY + Math.max(8, this.vy + 2)) {
          this.y = tileTopY - this.h;
          this.vy = 0;
          this.grounded = true;
          this.hasDoubleJumped = false;
          break;
        }
      }
    }
  }

  // Draw procedural cat pirate Claw
  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    
    const px = this.x - cameraX;
    const py = this.y;

    ctx.translate(px + this.w/2, py + this.h/2);
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    if (this.grounded) {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(0, this.h/2 - 2, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    let bodyBob = 0;
    let limbSwing = 0;
    if (this.isWalking && this.grounded) {
      bodyBob = Math.sin(this.walkCycle) * 2;
      limbSwing = Math.sin(this.walkCycle) * 8;
    } else if (!this.grounded) {
      bodyBob = -4;
    }

    // Legs
    ctx.fillStyle = "#523624";
    
    ctx.save();
    ctx.translate(-6, this.h/2 - 8);
    if (this.grounded) ctx.rotate((limbSwing * Math.PI) / 180);
    ctx.fillRect(-4, 0, 7, 8);
    ctx.fillStyle = "#cca300";
    ctx.fillRect(-4, 0, 7, 2);
    ctx.restore();

    ctx.fillStyle = "#523624";
    ctx.save();
    ctx.translate(6, this.h/2 - 8);
    if (this.grounded) ctx.rotate((-limbSwing * Math.PI) / 180);
    ctx.fillRect(-3, 0, 7, 8);
    ctx.fillStyle = "#cca300";
    ctx.fillRect(-3, 0, 7, 2);
    ctx.restore();

    // Body (Coat)
    ctx.fillStyle = "#0d2a35";
    ctx.beginPath();
    // Use standard roundRect fallback logic
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-10, -8 + bodyBob, 20, 22, [4, 4, 1, 1])
      : ctx.rect(-10, -8 + bodyBob, 20, 22);
    ctx.fill();

    ctx.fillStyle = "#d92b2b";
    ctx.fillRect(-3, 5 + bodyBob, 6, 9);
    
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(-4, -1 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(-4, 4 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -1 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(4, 4 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.save();
    ctx.translate(0, -18 + bodyBob);
    
    ctx.fillStyle = "#df8b32";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(-11, -9, 22, 18, [8, 8, 4, 4])
      : ctx.rect(-11, -9, 22, 18);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(-10, -9);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-4, -9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffcccc";
    ctx.beginPath();
    ctx.moveTo(-9, -10);
    ctx.lineTo(-11, -15);
    ctx.lineTo(-5, -10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#df8b32";
    ctx.beginPath();
    ctx.moveTo(10, -9);
    ctx.lineTo(14, -18);
    ctx.lineTo(4, -9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffcccc";
    ctx.beginPath();
    ctx.moveTo(9, -10);
    ctx.lineTo(11, -15);
    ctx.lineTo(5, -10);
    ctx.closePath();
    ctx.fill();

    // Eyepatch
    ctx.fillStyle = "#111";
    ctx.fillRect(1, -3, 6, 6);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(10, 0);
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-5, -1, 3.5, 3.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(-5, -1, 1, 3, 0, 0, Math.PI*2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-1.5, 2);
    ctx.lineTo(1.5, 2);
    ctx.lineTo(0, 3.5);
    ctx.closePath();
    ctx.fill();

    // Cheeks
    ctx.fillStyle = "#fff8f0";
    ctx.beginPath();
    ctx.arc(-2.5, 4.5, 2.5, 0, Math.PI * 2);
    ctx.arc(2.5, 4.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bandana
    ctx.fillStyle = "#d92b2b";
    ctx.fillRect(-11, -10, 22, 4);
    
    ctx.save();
    ctx.translate(-10, -8);
    ctx.rotate((Math.sin(this.walkCycle * 0.8) * 12 * Math.PI) / 180);
    ctx.fillStyle = "#d92b2b";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, 3);
    ctx.lineTo(-6, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Pirate Hat
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.quadraticCurveTo(0, -18, 15, -10);
    ctx.quadraticCurveTo(8, -12, 0, -22);
    ctx.quadraticCurveTo(-8, -12, -15, -10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.quadraticCurveTo(0, -18, 15, -10);
    ctx.stroke();

    ctx.fillStyle = "#eee";
    ctx.beginPath();
    ctx.arc(0, -14, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, -12, 4, 1.5);

    ctx.restore();

    // Cutlass
    ctx.fillStyle = "#df8b32";
    ctx.save();
    ctx.translate(-11, 2 + bodyBob);
    
    if (this.isWalking && this.grounded) {
      ctx.rotate((-limbSwing * Math.PI) / 180);
    }
    ctx.fillRect(-3, 0, 5, 8);
    
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-4, 7, 7, 2);
    
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(-2, 7);
    ctx.lineTo(-2, -10);
    ctx.quadraticCurveTo(-2, -14, -5, -15);
    ctx.quadraticCurveTo(-5, -8, -4, 7);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}
