/* ==========================================================================
   PLAYER PHYSICS & ANIMATION MODEL: CAPTAIN CLAW PLAYER CONTROLLER
   ========================================================================== */

import { Sound } from "./Sound.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 44;

    // Movement Velocities
    this.vx = 0;
    this.vy = 0;

    // Physical constants
    this.speed = 3.5;
    this.climbSpeed = 2.5;
    this.jumpForce = 8.0;
    this.doubleJumpForce = 7.0;
    this.gravity = 0.4;
    this.friction = 0.82;

    // State Bools
    this.grounded = false;
    this.climbing = false;
    this.facingLeft = false;
    this.hasDoubleJumped = false;

    // Keyboard bindings state reference
    this.keys = {
      leftPressed: false,
      rightPressed: false,
      upPressed: false,
      downPressed: false,
      spacePressed: false
    };

    // Procedural animation parameters
    this.walkCycle = 0;
    this.isWalking = false;
    
    // Checkpoints
    this.spawnX = x;
    this.spawnY = y;
  }

  resetToCheckpoint() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.climbing = false;
    this.grounded = false;
  }

  update(level) {
    // 1. INPUT PROCESSING
    this.isWalking = false;

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
        // We are on the top ladder tile, climbing up onto the platform
        const tileTopY = currentTileY * level.tileSize;
        if (this.y + this.h <= tileTopY + 12) {
          // Auto snap feet to the top of the platform!
          this.y = tileTopY - this.h;
          this.climbing = false;
          this.grounded = true;
          this.vy = 0;
          this.vx = 0;
        }
      }
    } else {
      // Standard Platforming Physics
      if (this.keys.leftPressed) {
        this.vx = -this.speed;
        this.facingLeft = true;
        this.isWalking = true;
      } else if (this.keys.rightPressed) {
        this.vx = this.speed;
        this.facingLeft = false;
        this.isWalking = true;
      } else {
        this.vx *= this.friction; // apply friction
      }

      // Gravity
      this.vy += this.gravity;
      if (this.vy > 12) this.vy = 12; // Terminal velocity limit

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
          // Snap the player to the center of the ladder
          this.x = (climbingLadderCol * level.tileSize + level.tileSize / 2) - this.w / 2;
        }
      }
    }

    // Handle jump action safely on rising edge triggers
    // Checked inside engine key handler to avoid repeated jumps on hold.

    // 2. COLLISION & POSITION INTEGRATION
    
    // X-Axis Movement & Collision
    this.x += this.vx;
    this.checkCollisionsX(level);

    // Y-Axis Movement & Collision
    this.y += this.vy;
    this.grounded = false;
    this.checkCollisionsY(level);

    // Walk cycle animation ticker
    if (this.isWalking && this.grounded) {
      this.walkCycle += 0.25;
    } else {
      this.walkCycle = 0;
    }

    // World floor bounds checks
    if (this.y > level.height + 100) {
      this.fallIntoWater();
    }
  }

  jump() {
    if (this.climbing) {
      this.climbing = false;
      this.vy = -this.jumpForce;
      this.hasDoubleJumped = false;
      Sound.playJump();
    } else if (this.grounded) {
      this.vy = -this.jumpForce;
      this.grounded = false;
      this.hasDoubleJumped = false;
      Sound.playJump();
    } else if (!this.hasDoubleJumped) {
      // Double Jump mechanics
      this.vy = -this.doubleJumpForce;
      this.hasDoubleJumped = true;
      Sound.playJump();
    }
  }

  fallIntoWater() {
    Sound.playHurt();
    this.resetToCheckpoint();
  }

  checkCollisionsX(level) {
    // Collisions with solid blocks
    const leftTile = Math.floor(this.x / level.tileSize);
    const rightTile = Math.floor((this.x + this.w) / level.tileSize);
    const topTile = Math.floor(this.y / level.tileSize);
    const bottomTile = Math.floor((this.y + this.h - 2) / level.tileSize);

    // Bound checks
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

  checkCollisionsY(level) {
    const leftTile = Math.floor(this.x / level.tileSize);
    const rightTile = Math.floor((this.x + this.w - 1) / level.tileSize);
    const topTile = Math.floor(this.y / level.tileSize);
    const bottomTile = Math.floor((this.y + this.h) / level.tileSize);

    for (let col = leftTile; col <= rightTile; col++) {
      if (level.isSolid(col, topTile) && this.vy < 0) {
        this.y = (topTile + 1) * level.tileSize;
        this.vy = 0.1; // bounce slightly
        break;
      }

      // Check for one-way platform behavior at ladder tops
      const isLadder = level.isLadderAt(col * level.tileSize + level.tileSize/2, bottomTile * level.tileSize + level.tileSize/2);
      const isLadderAbove = level.isLadderAt(col * level.tileSize + level.tileSize/2, (bottomTile - 1) * level.tileSize + level.tileSize/2);
      
      // We treat a tile as solid if it's naturally solid, OR if it's the top tile of a ladder
      // and we are falling downwards, not pressing down, and not currently climbing
      const treatAsSolid = level.isSolid(col, bottomTile) || 
        (isLadder && !isLadderAbove && this.vy >= 0 && !this.keys.downPressed && !this.climbing);

      if (treatAsSolid && this.vy >= 0) {
        const feetPrevY = this.y + this.h - this.vy;
        const tileTopY = bottomTile * level.tileSize;
        
        // Ensure we land on top only if we were previously above it
        if (feetPrevY <= tileTopY + 8) {
          this.y = tileTopY - this.h;
          this.vy = 0;
          this.grounded = true;
          this.hasDoubleJumped = false;
          break;
        }
      }
    }
  }

  // Draw procedural animated Claw character
  draw(ctx, cameraX) {
    ctx.save();
    
    // Position translation
    const px = this.x - cameraX;
    const py = this.y;

    // Flip horizontal drawing when facing left
    ctx.translate(px + this.w/2, py + this.h/2);
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // 1. SHADOW (under character)
    if (this.grounded) {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(0, this.h/2 - 2, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Let's draw an awesome pirate cat character!
    
    // Walking tilt angle
    let bodyBob = 0;
    let limbSwing = 0;
    if (this.isWalking && this.grounded) {
      bodyBob = Math.sin(this.walkCycle) * 2;
      limbSwing = Math.sin(this.walkCycle) * 8;
    } else if (!this.grounded) {
      bodyBob = -4; // floating stretch
    }

    // 2. LEGS & BOOTS
    ctx.fillStyle = "#523624"; // brown boots
    
    // Left Leg
    ctx.save();
    ctx.translate(-6, this.h/2 - 8);
    if (this.grounded) ctx.rotate((limbSwing * Math.PI) / 180);
    ctx.fillRect(-4, 0, 7, 8);
    ctx.fillStyle = "#cca300"; // gold trim
    ctx.fillRect(-4, 0, 7, 2);
    ctx.restore();

    // Right Leg
    ctx.fillStyle = "#523624";
    ctx.save();
    ctx.translate(6, this.h/2 - 8);
    if (this.grounded) ctx.rotate((-limbSwing * Math.PI) / 180);
    ctx.fillRect(-3, 0, 7, 8);
    ctx.fillStyle = "#cca300"; // gold trim
    ctx.fillRect(-3, 0, 7, 2);
    ctx.restore();

    // 3. BODY (Pirate Coat)
    ctx.fillStyle = "#0d2a35"; // Deep ocean blue coat
    ctx.beginPath();
    ctx.roundRect(-10, -8 + bodyBob, 20, 22, [4, 4, 1, 1]);
    ctx.fill();

    // Coat details (golden buttons, red undershirt sash)
    ctx.fillStyle = "#d92b2b"; // red sash
    ctx.fillRect(-3, 5 + bodyBob, 6, 9);
    
    ctx.fillStyle = "#ffd700"; // golden buttons
    ctx.beginPath();
    ctx.arc(-4, -1 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(-4, 4 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -1 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.arc(4, 4 + bodyBob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. CAT HEAD
    ctx.save();
    ctx.translate(0, -18 + bodyBob);
    
    // Fur colors (warm amber golden fur cat)
    ctx.fillStyle = "#df8b32";
    ctx.beginPath();
    ctx.roundRect(-11, -9, 22, 18, [8, 8, 4, 4]);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(-10, -9);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-4, -9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffcccc"; // ear inner
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
    ctx.fillStyle = "#ffcccc"; // ear inner
    ctx.beginPath();
    ctx.moveTo(9, -10);
    ctx.lineTo(11, -15);
    ctx.lineTo(5, -10);
    ctx.closePath();
    ctx.fill();

    // Eyepatch (black leather band + eyepatch block over right eye)
    ctx.fillStyle = "#111";
    ctx.fillRect(1, -3, 6, 6); // eyepatch block
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(10, 0);
    ctx.stroke();

    // Left Eye (cat gold slit eye)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-5, -1, 3.5, 3.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(-5, -1, 1, 3, 0, 0, Math.PI*2);
    ctx.fill();

    // Snout / Nose
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(-1.5, 2);
    ctx.lineTo(1.5, 2);
    ctx.lineTo(0, 3.5);
    ctx.closePath();
    ctx.fill();

    // White cheeks/whisker padding
    ctx.fillStyle = "#fff8f0";
    ctx.beginPath();
    ctx.arc(-2.5, 4.5, 2.5, 0, Math.PI * 2);
    ctx.arc(2.5, 4.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. PIRATE HAT & BANDANA
    ctx.fillStyle = "#d92b2b"; // red bandanna wrapping
    ctx.fillRect(-11, -10, 22, 4);
    
    // Bandanna ties floating behind head
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

    // Pirate Hat (black bicorn/tricorn shape)
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.quadraticCurveTo(0, -18, 15, -10);
    ctx.quadraticCurveTo(8, -12, 0, -22);
    ctx.quadraticCurveTo(-8, -12, -15, -10);
    ctx.closePath();
    ctx.fill();

    // Gold trim on hat
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.quadraticCurveTo(0, -18, 15, -10);
    ctx.stroke();

    // White Skull decal center of hat
    ctx.fillStyle = "#eee";
    ctx.beginPath();
    ctx.arc(0, -14, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, -12, 4, 1.5);

    ctx.restore(); // end head

    // 6. ARMS / SWORD (Claw holds a cutlass!)
    ctx.fillStyle = "#df8b32";
    ctx.save();
    ctx.translate(-11, 2 + bodyBob);
    
    // Front Arm swinging slightly
    if (this.isWalking && this.grounded) {
      ctx.rotate((-limbSwing * Math.PI) / 180);
    }
    ctx.fillRect(-3, 0, 5, 8); // sleeve
    
    // Gold Cutlass Handle + Silver Blade
    ctx.fillStyle = "#ffd700"; // hilt
    ctx.fillRect(-4, 7, 7, 2);
    
    // Blade
    ctx.fillStyle = "#cbd5e1"; // steel
    ctx.beginPath();
    ctx.moveTo(-2, 7);
    ctx.lineTo(-2, -10);
    ctx.quadraticCurveTo(-2, -14, -5, -15);
    ctx.quadraticCurveTo(-5, -8, -4, 7);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // end player
  }
}
