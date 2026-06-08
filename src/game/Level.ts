/* ==========================================================================
   LEVEL SETUP, GRID MAP & COLLISION DETECTOR: CAPTAIN CLAW LEVEL (TS VERSION)
   ========================================================================== */

import { Coin, Gem, TreasureChest, Ladder, Decoration, GameEntity, Spikes, PotionJar, Boss, Rope } from "./Items";

const TILE_SIZE = 32;
const MAP_ROWS = 18;
const MAP_COLS = 100;

const LEVEL_GRID: number[][] = Array(MAP_ROWS)
  .fill(null)
  .map(() => Array(MAP_COLS).fill(0));

// Set up solid boundaries
// 1. Initial docks flat floor (Cols 0 to 22)
for (let c = 0; c <= 22; c++) {
  LEVEL_GRID[15][c] = 1; // Wood planks top
  LEVEL_GRID[16][c] = 2; // Dark wooden beams under
  LEVEL_GRID[17][c] = 2;
}

// 2. High ladder tower on docks
for (let r = 9; r <= 14; r++) {
  LEVEL_GRID[r][16] = 3; // Ladder block
}
LEVEL_GRID[9][15] = 1; // Platform next to ladder top
LEVEL_GRID[9][16] = 3; // Keep top of ladder climbable, not solid!
LEVEL_GRID[9][17] = 1;

// 3. Skills Valley floating bridge (Cols 27 to 48)
LEVEL_GRID[14][26] = 1;
LEVEL_GRID[12][29] = 1;
LEVEL_GRID[11][32] = 1;

// High Education platform next to rope swing (Cols 43 to 45, row 6)
LEVEL_GRID[6][43] = 1;
LEVEL_GRID[6][44] = 1;
LEVEL_GRID[6][45] = 1;

for (let c = 35; c <= 45; c++) {
  LEVEL_GRID[10][c] = 4; // Hanging bridge planks
}
for (let r = 10; r <= 15; r++) {
  LEVEL_GRID[r][48] = 3; // Ladder down
}
for (let c = 47; c <= 49; c++) {
  LEVEL_GRID[16][c] = 1;
  LEVEL_GRID[17][c] = 2;
}

// 4. Temple ruins project shrines (Cols 52 to 74)
for (let c = 52; c <= 57; c++) {
  LEVEL_GRID[15][c] = 5; // Mossy stone temple brick
  LEVEL_GRID[16][c] = 6;
  LEVEL_GRID[17][c] = 6;
}
LEVEL_GRID[12][54] = 5; // Elevated shrine podium

for (let c = 61; c <= 66; c++) {
  LEVEL_GRID[14][c] = 5;
  LEVEL_GRID[15][c] = 6;
  LEVEL_GRID[16][c] = 6;
  LEVEL_GRID[17][c] = 6;
}

for (let c = 70; c <= 76; c++) {
  LEVEL_GRID[13][c] = 5;
  LEVEL_GRID[14][c] = 6;
  LEVEL_GRID[15][c] = 6;
  LEVEL_GRID[16][c] = 6;
  LEVEL_GRID[17][c] = 6;
}

// 5. Pirate ship harbor docks (Cols 82 to 100)
for (let c = 82; c < 100; c++) {
  LEVEL_GRID[15][c] = 1;
  LEVEL_GRID[16][c] = 2;
  LEVEL_GRID[17][c] = 2;
}

// Ship high platform deck (Cols 89 to 99)
for (let c = 89; c <= 99; c++) {
  LEVEL_GRID[9][c] = 1;
}
// Stern mast / cabin solid wall block
for (let r = 5; r <= 8; r++) {
  LEVEL_GRID[r][99] = 1;
}
for (let r = 9; r <= 14; r++) {
  LEVEL_GRID[r][89] = 3; // Ladder climbing up extending through deck
}

export class Level {
  public tileSize = TILE_SIZE;
  public width = MAP_COLS * TILE_SIZE;
  public height = MAP_ROWS * TILE_SIZE;
  
  private skyScroll = 0.05;
  private islandScroll = 0.35;

  public entities: GameEntity[] = [];
  public ladders: Ladder[] = [];
  public decorations: Decoration[] = [];
  private bgImg: HTMLImageElement | null = null;

  constructor() {
    this.initializeEntities();
    if (typeof window !== "undefined") {
      this.bgImg = new Image();
      this.bgImg.src = "/assets/menu_bg.png";
    }
  }

  public isSolid(col: number, row: number): boolean {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    const tile = LEVEL_GRID[row][col];
    return tile === 1 || tile === 2 || tile === 4 || tile === 5 || tile === 6;
  }

  public isLadderAt(x: number, y: number): boolean {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    return LEVEL_GRID[row][col] === 3;
  }

  private initializeEntities() {
    // Treasures Chests
    this.entities.push(new TreasureChest(510, 250, "about-modal", "Scroll of Genesis (About Me)", "about"));
    this.entities.push(new TreasureChest(1010, 314, "skills-modal", "Cove Vault (Skills)", "skills"));
    this.entities.push(new TreasureChest(1728, 346, "projects-modal", "Captain's Ledger (Projects)", "projects"));
    this.entities.push(new TreasureChest(1980, 410, "experience-modal", "Chronicles of Battle (Experience)", "experience"));
    this.entities.push(new TreasureChest(2944, 250, "contact-modal", "Message Dispatch (Contact)", "contact"));
    this.entities.push(new TreasureChest(1408, 154, "education-modal", "Grand Academe Vault (Education)", "education"));

    // Swinging Pendulum Rope (pivotX = 1136, pivotY = 64, length = 180)
    this.entities.push(new Rope(1136, 64, 180));

    // Gold Coins Placements
    const coinPlacements = [
      [150, 420], [200, 420], [250, 420],
      [512, 190], [544, 190],
      [880, 350], [970, 290],
      [1220, 210], [1280, 160], [1340, 170],
      [2050, 350], [2100, 320],
      [2680, 420], [2750, 420],
      [2940, 200], [3000, 200]
    ];
    coinPlacements.forEach(pos => {
      this.entities.push(new Coin(pos[0], pos[1]));
    });

    // Glowing Skill Gems
    const gemPlacements = [
      { x: 380, y: 420, color: "#61dafb", skill: "React / Next" },
      { x: 830, y: 390, color: "#f7df1e", skill: "JavaScript" },
      { x: 930, y: 320, color: "#38b2ac", skill: "CSS / Tailwind" },
      { x: 1020, y: 290, color: "#68a063", skill: "Node.js" },
      { x: 1530, y: 320, color: "#336791", skill: "Database" },
      { x: 2150, y: 260, color: "#2496ed", skill: "DevOps & Cloud" }
    ];
    gemPlacements.forEach(pos => {
      this.entities.push(new Gem(pos.x, pos.y, pos.color, pos.skill));
    });

    // Ladders overlays
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (LEVEL_GRID[r][c] === 3) {
          this.ladders.push(new Ladder(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE));
        }
      }
    }

    // Decorations
    this.decorations.push(new Decoration(80, 448, "barrel"));
    this.decorations.push(new Decoration(120, 448, "barrel"));
    this.decorations.push(new Decoration(96, 408, "flag")); // Stands on initial docks floor (y=480, height=72)
    this.decorations.push(new Decoration(2600, 448, "barrel"));
    this.decorations.push(new Decoration(3136, 216, "flag")); // Stands on pirate ship deck floor (y=288, height=72)

    // Spaghetti Code Spikes placement (Static Hazards sitting perfectly on floor surfaces)
    this.entities.push(new Spikes(320, 460)); // Stands on initial docks floor (Col 10, y=480)
    this.entities.push(new Spikes(1280, 300)); // Stands in the middle of hanging bridge (Col 40, y=320)
    this.entities.push(new Spikes(2048, 428)); // Stands on the stone pod podium of shrine 2 (Col 64, y=448)
    this.entities.push(new Spikes(2720, 460)); // Stands on ship harbor dock floor just before ladder (Col 85, y=480)

    // Refactor Potion Jar placements (Heals placed at logical exploration spots)
    this.entities.push(new PotionJar(480, 256)); // Docks tower elevated platform (Col 15, y=288)
    this.entities.push(new PotionJar(960, 280)); // Floating in mid-air to reward a jump in Skills Valley (Col 30, y=320)
    this.entities.push(new PotionJar(1728, 352)); // Sitting on shrine 1 elevated podium next to Projects chest (Col 54, y=384)
    this.entities.push(new PotionJar(2880, 256)); // Sitting on ship deck (Col 90, y=288)
    
    // Boss Nemesis Captain Red-Tail (Code review duel boss)
    this.entities.push(new Boss(3072, 240)); // Stands on pirate ship deck at column 96 (y=288)
  }

  public update(player: { x: number; y: number; w: number; h: number; keys: { upPressed: boolean; downPressed: boolean; } }, engine: any) {
    this.entities.forEach(ent => ent.update(player, engine));
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    this.drawParallaxBg(ctx, cameraX);

    this.ladders.forEach(lad => lad.draw(ctx, cameraX));
    this.decorations.forEach(dec => dec.draw(ctx, cameraX));

    ctx.save();
    const startCol = Math.floor(cameraX / this.tileSize);
    const endCol = startCol + Math.ceil(ctx.canvas.width / this.tileSize) + 1;

    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (c < 0 || c >= MAP_COLS) continue;
        const tile = LEVEL_GRID[r][c];
        const px = c * this.tileSize - cameraX;
        const py = r * this.tileSize;

        if (tile === 1) {
          ctx.fillStyle = "#523624";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.fillStyle = "#7a543b";
          ctx.fillRect(px, py, this.tileSize, 4);

          ctx.strokeStyle = "#2e1c10";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 2) {
          ctx.fillStyle = "#2e1c10";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.strokeStyle = "#1a0f08";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 4) {
          ctx.fillStyle = "#523624";
          ctx.fillRect(px, py, this.tileSize, 10);
          
          ctx.fillStyle = "#2e1c10";
          ctx.fillRect(px + 4, py + 10, 4, 4);
          ctx.fillRect(px + this.tileSize - 8, py + 10, 4, 4);

          ctx.strokeStyle = "#1a0f08";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, this.tileSize, 10);
        } else if (tile === 5) {
          ctx.fillStyle = "#1a4d57";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.fillStyle = "#38b2ac";
          ctx.fillRect(px, py, this.tileSize, 4);

          ctx.strokeStyle = "#0d2a35";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 6) {
          ctx.fillStyle = "#0d2a35";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);

          ctx.strokeStyle = "#07171d";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        }
      }
    }
    ctx.restore();

    this.entities.forEach(ent => ent.draw(ctx, cameraX));
    this.drawWaterHazard(ctx, cameraX);
  }

  private drawParallaxBg(ctx: CanvasRenderingContext2D, cameraX: number) {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // 1. Draw Sky Gradient (sunset twilight)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, "#06151c");   // Dark sky top
    skyGrad.addColorStop(0.4, "#0d2b38"); // Twilight blue
    skyGrad.addColorStop(0.85, "#241f1a"); // Warm horizon glow
    skyGrad.addColorStop(1, "#381a1a");    // Deep red horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Draw Twinkling Stars in the upper sky
    for (let i = 0; i < 45; i++) {
      const starX = ((i * 101 - cameraX * 0.02) % cw + cw) % cw;
      const starY = (i * 37) % 180; // Upper sky only
      const starSize = (i % 4 === 0) ? 1.5 : 1;
      const twinkle = Math.sin(Date.now() / 250 + i) * 0.45 + 0.55;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * twinkle})`;
      ctx.fillRect(starX, starY, starSize, starSize);
    }

    // Sunset ambient sun glow
    ctx.fillStyle = "rgba(255, 140, 0, 0.12)";
    ctx.beginPath();
    ctx.arc(cw * 0.7 - cameraX * this.skyScroll, ch * 0.65, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 215, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(cw * 0.7 - cameraX * this.skyScroll, ch * 0.65, 45, 0, Math.PI * 2);
    ctx.fill();

    // 2. Parallax Sunset Clouds
    const cloudSpeed = 0.18;
    this.drawCloud(ctx, 100 - cameraX * cloudSpeed, 80, 120);
    this.drawCloud(ctx, 550 - cameraX * cloudSpeed, 140, 180);
    this.drawCloud(ctx, 1100 - cameraX * cloudSpeed, 70, 150);
    this.drawCloud(ctx, 1650 - cameraX * cloudSpeed, 120, 130);
    this.drawCloud(ctx, 2200 - cameraX * cloudSpeed, 60, 200);
    this.drawCloud(ctx, 2750 - cameraX * cloudSpeed, 100, 160);

    // 3. Distant Silhouette Pirate Ships sailing on horizon
    const shipSpeed = 0.24;
    this.drawDistantShip(ctx, 400 - cameraX * shipSpeed, ch - 92, 0.65);
    this.drawDistantShip(ctx, 1800 - cameraX * shipSpeed, ch - 94, 0.85);

    // 4. Distant Parallax Islands
    ctx.save();
    ctx.fillStyle = "#10232b";
    
    ctx.beginPath();
    ctx.moveTo(0, ch);
    const startIslandX = -cameraX * this.islandScroll;
    
    ctx.lineTo(startIslandX + 100, ch - 80);
    ctx.quadraticCurveTo(startIslandX + 250, ch - 160, startIslandX + 400, ch - 80);
    ctx.lineTo(startIslandX + 600, ch);

    ctx.lineTo(startIslandX + 900, ch - 70);
    ctx.quadraticCurveTo(startIslandX + 1100, ch - 190, startIslandX + 1300, ch - 70);
    ctx.lineTo(startIslandX + 1500, ch);

    ctx.lineTo(startIslandX + 1900, ch - 90);
    ctx.quadraticCurveTo(startIslandX + 2100, ch - 170, startIslandX + 2300, ch - 90);
    ctx.lineTo(startIslandX + 2500, ch);
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5. Silhouette Palm Trees on Distant Island Peaks
    // Peak 1
    this.drawPalmTree(ctx, startIslandX + 238, ch - 116, 20);
    this.drawPalmTree(ctx, startIslandX + 250, ch - 120, 26);
    this.drawPalmTree(ctx, startIslandX + 262, ch - 114, 18);
    // Peak 2
    this.drawPalmTree(ctx, startIslandX + 1085, ch - 128, 22);
    this.drawPalmTree(ctx, startIslandX + 1100, ch - 132, 28);
    this.drawPalmTree(ctx, startIslandX + 1115, ch - 126, 20);
    // Peak 3
    this.drawPalmTree(ctx, startIslandX + 2085, ch - 128, 22);
    this.drawPalmTree(ctx, startIslandX + 2100, ch - 132, 28);
    this.drawPalmTree(ctx, startIslandX + 2115, ch - 126, 18);
  }

  // Draw procedural palm tree silhouette
  private drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
    ctx.save();
    ctx.fillStyle = "#10232b"; // Blend with island color
    
    // Trunk (natural slanting arc)
    ctx.beginPath();
    ctx.moveTo(x - 1.5, y);
    ctx.quadraticCurveTo(x - 3, y - height * 0.5, x + 3, y - height);
    ctx.lineTo(x + 4.5, y - height);
    ctx.quadraticCurveTo(x - 1.5, y - height * 0.5, x + 1.5, y);
    ctx.closePath();
    ctx.fill();
    
    // Leaves / Fronds
    ctx.translate(x + 4, y - height);
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(12, -7, 18, -3);
      ctx.quadraticCurveTo(10, 2, 0, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw distant ship silhouette
  private drawDistantShip(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.fillStyle = "rgba(16, 35, 43, 0.75)";
    
    // Hull
    ctx.beginPath();
    ctx.moveTo(x - 18 * scale, y);
    ctx.lineTo(x + 18 * scale, y);
    ctx.lineTo(x + 14 * scale, y + 5 * scale);
    ctx.lineTo(x - 14 * scale, y + 5 * scale);
    ctx.closePath();
    ctx.fill();
    
    // Center mast & sails
    ctx.fillRect(x - 0.8 * scale, y - 20 * scale, 1.6 * scale, 20 * scale);
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y - 5 * scale);
    ctx.quadraticCurveTo(x - 2 * scale, y - 11 * scale, x - 0.8 * scale, y - 18 * scale);
    ctx.quadraticCurveTo(x - 7 * scale, y - 11 * scale, x - 10 * scale, y - 5 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 10 * scale, y - 5 * scale);
    ctx.quadraticCurveTo(x + 2 * scale, y - 11 * scale, x + 0.8 * scale, y - 18 * scale);
    ctx.quadraticCurveTo(x + 7 * scale, y - 11 * scale, x + 10 * scale, y - 5 * scale);
    ctx.fill();
    
    // Left mast & sails
    ctx.fillRect(x - 9 * scale, y - 15 * scale, 1.2 * scale, 15 * scale);
    ctx.beginPath();
    ctx.moveTo(x - 16 * scale, y - 4 * scale);
    ctx.quadraticCurveTo(x - 10 * scale, y - 8 * scale, x - 9 * scale, y - 14 * scale);
    ctx.quadraticCurveTo(x - 13 * scale, y - 8 * scale, x - 16 * scale, y - 4 * scale);
    ctx.fill();
    
    // Right mast & sails
    ctx.fillRect(x + 8 * scale, y - 13 * scale, 1.2 * scale, 13 * scale);
    ctx.beginPath();
    ctx.moveTo(x + 14 * scale, y - 3 * scale);
    ctx.quadraticCurveTo(x + 9 * scale, y - 7 * scale, x + 8 * scale, y - 12 * scale);
    ctx.quadraticCurveTo(x + 12 * scale, y - 7 * scale, x + 14 * scale, y - 3 * scale);
    ctx.fill();

    ctx.restore();
  }

  // Draw soft background cloud
  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x, y + width * 0.4);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    grad.addColorStop(1, "rgba(255, 140, 0, 0.03)");
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.arc(x, y, width * 0.25, 0, Math.PI * 2);
    ctx.arc(x + width * 0.2, y - width * 0.05, width * 0.3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.42, y, width * 0.22, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawWaterHazard(ctx: CanvasRenderingContext2D, cameraX: number) {
    const ch = ctx.canvas.height;
    const time = Date.now();
    
    ctx.save();
    const waterY = 16.5 * this.tileSize;

    // 1. Draw Back Ocean Layer (Darker, slower offset waves for depth)
    ctx.fillStyle = "rgba(10, 58, 66, 0.75)";
    ctx.beginPath();
    ctx.moveTo(0, ch);
    ctx.lineTo(0, waterY + 10);
    for (let x = 0; x <= ctx.canvas.width; x += 10) {
      const waveY = waterY + 5 + Math.sin(x * 0.03 + time * 0.002) * 5;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(ctx.canvas.width, ch);
    ctx.closePath();
    ctx.fill();

    // 2. Draw Front Ocean Layer (Primary gradient filled waves)
    ctx.beginPath();
    ctx.moveTo(0, ch);
    ctx.lineTo(0, waterY + 10);
    
    const frontWaveCoords: { x: number; y: number }[] = [];
    for (let x = 0; x <= ctx.canvas.width; x += 10) {
      const waveY = waterY + Math.sin(x * 0.045 + time * 0.0035) * 4;
      frontWaveCoords.push({ x, y: waveY });
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(ctx.canvas.width, ch);
    ctx.closePath();

    const oceanGrad = ctx.createLinearGradient(0, waterY - 5, 0, ch);
    oceanGrad.addColorStop(0, "rgba(13, 77, 87, 0.9)");
    oceanGrad.addColorStop(0.3, "rgba(7, 23, 29, 0.95)");
    oceanGrad.addColorStop(1, "#041217");
    
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    // 3. Draw Bright Foam Crest Line along the front wave edge
    ctx.strokeStyle = "rgba(56, 178, 172, 0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(frontWaveCoords[0].x, frontWaveCoords[0].y);
    for (let i = 1; i < frontWaveCoords.length; i++) {
      ctx.lineTo(frontWaveCoords[i].x, frontWaveCoords[i].y);
    }
    ctx.stroke();

    // 4. Shimmering specular highlights on water surface
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const shimX = ((i * 180 - cameraX * 0.7) % ctx.canvas.width + ctx.canvas.width) % ctx.canvas.width;
      const waveOffset = Math.sin(shimX * 0.045 + time * 0.0035) * 4;
      const shimY = waterY + 18 + i * 8 + waveOffset * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(shimX, shimY);
      ctx.lineTo(shimX + 22, shimY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
