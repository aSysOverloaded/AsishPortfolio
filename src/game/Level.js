/* ==========================================================================
   LEVEL SETUP, GRID MAP & COLLISION DETECTOR: CAPTAIN CLAW LEVEL CONTROLLER
   ========================================================================== */

import { Coin, Gem, TreasureChest, Ladder, Decoration } from "./Items.js";

// Character-based layout representation of our level. 
// Grid: 100 columns wide by 18 rows high.
// Legends:
// '#' = Solid Dock/Platform block
// 'L' = Ladder climb block
// 'D' = Ground dirt/rock block
// '-' = Floating deck planks
const TILE_SIZE = 32;
const MAP_ROWS = 18;
const MAP_COLS = 100;

// Programmatically constructing the level layouts grid to ensure precise platforming
const LEVEL_GRID = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(0));

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
// Elevated stepping stone blocks
LEVEL_GRID[14][26] = 1;
LEVEL_GRID[12][29] = 1;
LEVEL_GRID[11][32] = 1;

// A double hanging bridge
for (let c = 35; c <= 45; c++) {
  LEVEL_GRID[10][c] = 4; // Hanging bridge planks (solid platform)
}
// Ladders on right of the bridge
for (let r = 10; r <= 15; r++) {
  LEVEL_GRID[r][48] = 3; // Ladder down to floor level
}
for (let c = 47; c <= 49; c++) {
  LEVEL_GRID[16][c] = 1; // solid ground under ladder
  LEVEL_GRID[17][c] = 2;
}

// 4. Temple ruins project shrines (Cols 52 to 74)
// Jumps over deep water pools
for (let c = 52; c <= 57; c++) {
  LEVEL_GRID[15][c] = 5; // Mossy stone temple brick
  LEVEL_GRID[16][c] = 6; // Dark mossy support stone
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

// Ship high platform deck (Cols 89 to 98)
for (let c = 89; c <= 98; c++) {
  LEVEL_GRID[9][c] = 1; // Wooden upper ship deck
}
for (let r = 9; r <= 14; r++) {
  LEVEL_GRID[r][89] = 3; // Ladder climbing up to ship deck, extending through deck
}


export class Level {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.width = MAP_COLS * TILE_SIZE;
    this.height = MAP_ROWS * TILE_SIZE;
    
    // Parallax background scroll multipliers
    this.skyScroll = 0.05;
    this.cloudScroll = 0.15;
    this.islandScroll = 0.35;

    // Collectibles & Entities Array
    this.entities = [];
    this.ladders = [];
    this.decorations = [];

    // Prepopulate level details
    this.initializeEntities();
  }

  isSolid(col, row) {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    const tile = LEVEL_GRID[row][col];
    // Tile codes 1, 2, 4, 5, 6 are solid platform surfaces
    return tile === 1 || tile === 2 || tile === 4 || tile === 5 || tile === 6;
  }

  isLadderAt(x, y) {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    return LEVEL_GRID[row][col] === 3;
  }

  initializeEntities() {
    // 1. Interactive Modals Chests
    // Chest 1: About me - placed on the starting docks tower platform
    this.entities.push(new TreasureChest(510, 250, "about-modal", "Scroll of Genesis (About Me)", "about"));

    // Chest 2: Skills - placed on the middle elevated skills valley platform
    this.entities.push(new TreasureChest(1010, 314, "skills-modal", "Cove Vault (Skills)", "skills"));

    // Chest 3: Projects ledger - placed in the first ruins platform podium
    this.entities.push(new TreasureChest(1728, 346, "projects-modal", "Captain's Ledger (Projects)", "projects"));

    // Chest 4: Experience chronicle - placed on the middle ruins elevated podium
    this.entities.push(new TreasureChest(1980, 410, "experience-modal", "Chronicles of Battle (Experience)", "experience"));

    // Chest 5: Contact scroll - placed on the Pirate Ship's main deck
    this.entities.push(new TreasureChest(2976, 250, "contact-modal", "Message Dispatch (Contact)", "contact"));

    // 2. Gold Coins distribution along the route
    const coinPlacements = [
      [150, 420], [200, 420], [250, 420], // starting docks path
      [512, 190], [544, 190],             // docks high planks
      [880, 350], [970, 290],             // skills stepping stones
      [1180, 230], [1280, 230], [1380, 230], // floating bridges
      [2050, 350], [2100, 320],            // ruins jumps
      [2680, 420], [2750, 420],            // pre ship deck
      [2940, 200], [3000, 200]             // ship deck
    ];
    coinPlacements.forEach(pos => {
      this.entities.push(new Coin(pos[0], pos[1]));
    });

    // 3. Glowing Skill Gems (Green, Blue, Yellow, Pink, Cyan)
    const gemPlacements = [
      { x: 380, y: 420, color: "#61dafb", skill: "React / Next" }, // Blue
      { x: 830, y: 390, color: "#f7df1e", skill: "JavaScript" },   // Yellow
      { x: 930, y: 320, color: "#38b2ac", skill: "CSS / Tailwind" }, // Teal
      { x: 1020, y: 290, color: "#68a063", skill: "Node.js" },     // Green
      { x: 1530, y: 320, color: "#336791", skill: "Database" },    // Dark Blue
      { x: 2150, y: 260, color: "#2496ed", skill: "DevOps & Cloud" } // Azure
    ];
    gemPlacements.forEach(pos => {
      this.entities.push(new Gem(pos.x, pos.y, pos.color, pos.skill));
    });

    // 4. Climbable ladder entities (rendered behind character)
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (LEVEL_GRID[r][c] === 3) {
          // Draw standard visual ladder overlay
          this.ladders.push(new Ladder(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE));
        }
      }
    }

    // 5. Background decorations (flags, barrels, visual depth)
    this.decorations.push(new Decoration(80, 448, "barrel"));
    this.decorations.push(new Decoration(120, 448, "barrel"));
    this.decorations.push(new Decoration(30, 320, "flag"));
    this.decorations.push(new Decoration(2600, 448, "barrel"));
    this.decorations.push(new Decoration(2860, 160, "flag"));
  }

  update(player, engine) {
    this.entities.forEach(ent => ent.update(player, engine));
  }

  // Draw Level Graphics on the Canvas
  draw(ctx, cameraX) {
    // 1. Draw Parallax Background elements
    this.drawParallaxBg(ctx, cameraX);

    // 2. Draw Ladders
    this.ladders.forEach(lad => lad.draw(ctx, cameraX));

    // 3. Draw Decorations
    this.decorations.forEach(dec => dec.draw(ctx, cameraX));

    // 4. Draw Tile Map Solids
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
          // Wooden plank docks top
          ctx.fillStyle = "#523624";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.fillStyle = "#7a543b"; // trim
          ctx.fillRect(px, py, this.tileSize, 4);

          ctx.strokeStyle = "#2e1c10"; // plank borders
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 2) {
          // Dark wooden beam support underneath
          ctx.fillStyle = "#2e1c10";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.strokeStyle = "#1a0f08";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 4) {
          // Hanging bridge plank
          ctx.fillStyle = "#523624";
          ctx.fillRect(px, py, this.tileSize, 10);
          
          ctx.fillStyle = "#2e1c10"; // rope nodes
          ctx.fillRect(px + 4, py + 10, 4, 4);
          ctx.fillRect(px + this.tileSize - 8, py + 10, 4, 4);

          ctx.strokeStyle = "#1a0f08";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, this.tileSize, 10);
        } else if (tile === 5) {
          // Mossy stone brick top
          ctx.fillStyle = "#1a4d57"; // slate teal-ish stone
          ctx.fillRect(px, py, this.tileSize, this.tileSize);
          
          ctx.fillStyle = "#38b2ac"; // moss trim
          ctx.fillRect(px, py, this.tileSize, 4);

          ctx.strokeStyle = "#0d2a35";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 6) {
          // Darker stone body
          ctx.fillStyle = "#0d2a35";
          ctx.fillRect(px, py, this.tileSize, this.tileSize);

          ctx.strokeStyle = "#07171d";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        }
      }
    }
    ctx.restore();

    // 5. Draw Collectibles
    this.entities.forEach(ent => ent.draw(ctx, cameraX));

    // 6. Draw Hazards / Water under platforms
    this.drawWaterHazard(ctx, cameraX);
  }

  drawParallaxBg(ctx, cameraX) {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // A. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, "#081d26"); // deep midnight blue
    skyGrad.addColorStop(0.5, "#1b3f4f"); // dark slate sea
    skyGrad.addColorStop(1, "#361b1b"); // warm sunset horizon dust
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // B. Sun / Moon glow (Sunset effect)
    ctx.fillStyle = "rgba(255, 140, 0, 0.15)";
    ctx.beginPath();
    ctx.arc(cw * 0.7 - cameraX * this.skyScroll, ch * 0.65, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 215, 0, 0.25)";
    ctx.beginPath();
    ctx.arc(cw * 0.7 - cameraX * this.skyScroll, ch * 0.65, 45, 0, Math.PI * 2);
    ctx.fill();

    // C. Distant Islands (Parallax Layer)
    ctx.save();
    ctx.fillStyle = "#10232b";
    
    // Drawn as rolling mountain paths
    ctx.beginPath();
    ctx.moveTo(0, ch);
    const startIslandX = -cameraX * this.islandScroll;
    
    // Draw 3 distant islands
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
  }

  drawWaterHazard(ctx, cameraX) {
    const ch = ctx.canvas.height;
    
    // Animated shimmering water
    const shimer = Math.sin(Date.now() / 350) * 3;
    
    ctx.save();
    // Fill bottom water layer (Row 17 bottom half / under decks)
    const waterY = 16.5 * this.tileSize;

    // Draw deep sea overlay
    const oceanGrad = ctx.createLinearGradient(0, waterY, 0, ch);
    oceanGrad.addColorStop(0, "rgba(13, 77, 87, 0.85)"); // vibrant teal top shimmer
    oceanGrad.addColorStop(0.3, "rgba(7, 23, 29, 0.95)"); // deep bottom dark
    oceanGrad.addColorStop(1, "#041217");
    
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, waterY + shimer, ctx.canvas.width, ch - waterY);

    // Draw wave surface lines
    ctx.strokeStyle = "#38b2ac";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < ctx.canvas.width; x += 40) {
      ctx.arc(x + 20, waterY + shimer, 20, Math.PI, 0, false);
    }
    ctx.stroke();

    ctx.restore();
  }
}
