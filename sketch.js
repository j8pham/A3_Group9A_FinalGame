// ═══════════════════════════════════════════════════════════════════════════════
//  DATA BREACH — cyberpunk platformer
//  p5.js · 800 × 450 (Scaled) · hand-designed static level
// ═══════════════════════════════════════════════════════════════════════════════

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const GRAVITY = 1.0;
const MOVE_SPEED = 5.5;
const JUMP_FORCE = -15;
const TERM_VEL = 22;
const WORLD_W = 4200;

const FOCUS_RADIUS = 280;
const FOCUS_FADE_FRAMES = 90; // 1.5s fade on release
const FOCUS_COOLDOWN_FRAMES = 210; // 3.5s cooldown before reuse

const INTRO_NORMAL_F = 60;
const INTRO_SHAKE_F = 30;
const INTRO_FLASH_F = 24;

const RAIN_COUNT = 200;
const MOTE_COUNT = 55;

const COYOTE_FRAMES = 7;
const JUMP_CUT_MULT = 0.42;
const DOUBLE_JUMP_FORCE = -10;

const LIGHT_SOURCES = [
  { x: 200, y: 0, w: 300, h: 450, phase: 0.0, speed: 0.072 },
  { x: 580, y: 0, w: 180, h: 450, phase: 3.3, speed: 0.095 },
  { x: 850, y: 0, w: 240, h: 450, phase: 2.1, speed: 0.085 },
  { x: 1200, y: 0, w: 200, h: 450, phase: 1.1, speed: 0.11 },
  { x: 1480, y: 0, w: 320, h: 450, phase: 1.4, speed: 0.062 },
  { x: 1900, y: 0, w: 160, h: 450, phase: 4.2, speed: 0.13 },
  { x: 2200, y: 0, w: 260, h: 450, phase: 0.7, speed: 0.088 },
  { x: 2650, y: 0, w: 220, h: 450, phase: 2.8, speed: 0.105 },
  { x: 3000, y: 0, w: 280, h: 450, phase: 1.9, speed: 0.078 },
  { x: 3400, y: 0, w: 190, h: 450, phase: 0.5, speed: 0.12 },
  { x: 3800, y: 0, w: 350, h: 450, phase: 0.3, speed: 0.065 },
  { x: 4300, y: 0, w: 240, h: 450, phase: 1.7, speed: 0.098 },
];

// Per-level glare zones
const LEVEL1_GLARE_ZONES = [
  { x: 1900, w: 500, intensity: 6.5 },   // Hard-to-see platforms
  { x: 2700, w: 600, intensity: 3.0 },   // Spike gauntlet mild
];
const LEVEL2_GLARE_ZONES = [
  { x: 650,  w: 350, intensity: 5.0 },   // Dark spike platform area
  { x: 1900, w: 400, intensity: 6.5 },   // Hard-to-see platform
  { x: 2900, w: 600, intensity: 4.0 },   // Laser zone
];

// Per-level dark zones
const LEVEL1_DARK_ZONES = [
  { x: 1900, w: 550, intensity: 0.96 },  // Hard-to-see section
];
const LEVEL2_DARK_ZONES = [
  { x: 650,  w: 350, intensity: 0.92 },  // Spike platform darkness
  { x: 1900, w: 400, intensity: 0.96 },  // Hard-to-see platform
];

// Active zones — reassigned per level in initLevel()
let GLARE_ZONES = LEVEL1_GLARE_ZONES;
let DARK_ZONES = LEVEL1_DARK_ZONES;

const WIN_NEXT_BTN = { x: 210, y: 375, w: 175, h: 40 };
const WIN_HOME_BTN = { x: 415, y: 375, w: 175, h: 40 };

const DEATH_SHAKE_FRAMES = 18;
const DEATH_FLASH_FRAMES = 14;
const FOCUS_FLASH_FRAMES = 10;

const AFTERIMAGE_COUNT = 6;
const AFTERIMAGE_SPACING = 3;

const JAMIE_ANIM_SPEED = 8;
const JAMIE_DRAW_W = 48;
const JAMIE_DRAW_H = 48;

const SPIKE_W = 16;
const SPIKE_H = 14;
const LASER_CYCLE = 180;
const LASER_ON_FRAC = 0.6;

// ── STATIC LEVEL DATA — LEVEL 1 ──────────────────────────────────────────────
//  Zone A (0–1100):    Tutorial — learn movement, basic jump, checkpoint.
//  Zone B (1100–1700): Double-jump wall — must surmount the wall.
//  Zone C (1700–2500): Hard-to-see platforms — echolocation required, vision pickup.
//  Zone D (2500–4200): Spike gauntlet — dark wall activates, finish.

const LEVEL_PLATFORMS = [
  // Zone A — movement tutorial, comfortable gaps
  { x: 0,    y: 400, w: 500, h: 50 },   // P0 - start ground (wide)
  { x: 580,  y: 380, w: 180, h: 20 },   // P1 - first small hop
  { x: 840,  y: 365, w: 220, h: 20 },   // P2 - checkpoint platform
  { x: 1140, y: 348, w: 170, h: 20 },   // P3 - lead-up to wall
  { x: 1400, y: 330, w: 160, h: 20 },   // P4 - just before wall
  // Zone B — after wall (double-jump required)
  { x: 1700, y: 310, w: 200, h: 20 },   // P5 - landing past wall, vision pickup here
  // Zone C — hard-to-see platforms (dark zone)
  { x: 1980, y: 330, w: 180, h: 20 },   // P6 - hard-to-see platform
  { x: 2240, y: 350, w: 170, h: 20 },   // P7 - hard-to-see platform 2
  { x: 2490, y: 340, w: 180, h: 20 },   // P8 - checkpoint 2
  // Zone D — spike gauntlet
  { x: 2750, y: 370, w: 500, h: 20 },   // P9 - long spike gauntlet platform
  { x: 3330, y: 355, w: 150, h: 20 },   // P10 - spike pair
  { x: 3560, y: 340, w: 140, h: 20 },   // P11 - spike pair 2
  { x: 3780, y: 370, w: 200, h: 50 },   // P12 - finish platform
];

// Wall obstacle: tall solid barrier requiring double-jump to surmount.
const LEVEL_WALLS = [{ x: 1560, y: 210, w: 42, h: 120 }];

const LEVEL_MOVING_PLATFORMS = []; // none in Level 1

const LEVEL_ENEMIES = [
  // One enemy on hard-to-see platform in Zone C
  { x: 2240, y: 320, w: 22, h: 30, speed: 1.0, dir: 1, leftBound: 2240, rightBound: 2388, startX: 2240, startDir: 1, type: 2 },
];

// Spikes are fully static — referenced directly, never modified
const LEVEL_SPIKES = [
  // Spike gauntlet on P9 (y=370, spike y=356)
  { x: 2790, y: 356, w: 16, h: 14 },
  { x: 2808, y: 356, w: 16, h: 14 },
  { x: 2826, y: 356, w: 16, h: 14 },
  { x: 2844, y: 356, w: 16, h: 14 },
  { x: 2862, y: 356, w: 16, h: 14 },
  { x: 2880, y: 356, w: 16, h: 14 },
  // Spike pair on P10 (y=355, spike y=341)
  { x: 3370, y: 341, w: 16, h: 14 },
  { x: 3388, y: 341, w: 16, h: 14 },
  // Spike pair on P11 (y=340, spike y=326)
  { x: 3596, y: 326, w: 16, h: 14 },
  { x: 3614, y: 326, w: 16, h: 14 },
];

// No lasers in Level 1
const LEVEL_LASERS = [];

// Goal: centered on finish platform P12
const LEVEL_GOAL = { x: 3858, y: 318, w: 36, h: 52 };

const LEVEL_CHECKPOINTS = [
  { x: 940,  y: 325, w: 18, h: 40 },   // center of P2
  { x: 2571, y: 300, w: 18, h: 40 },   // center of P8
];

// Vision pickup on P5 after wall — reward for clearing the wall
const LEVEL_VISION_PICKUP = { x: 1790, y: 294, w: 16, h: 16 };

// ── LEVEL 2 DATA — "Encounter" ────────────────────────────────────────────────
//  Zone A (0–1000):    Warmup — hop, spike platform (hard to see, forced scan).
//  Zone B (1000–2000): Enemy trio — progressively faster, mixed with spikes.
//  Zone C (2000–2650): Hard-to-see platform + checkpoint + moving platform.
//  Zone D (2650–3500): Vertical lasers (flickering) + enemy.
//  Zone E (3500–4200): Finish.

const LEVEL2_PLATFORMS = [
  { x: 0,    y: 400, w: 400, h: 50 },   // P0  start ground
  { x: 480,  y: 380, w: 180, h: 20 },   // P1  first hop
  { x: 730,  y: 365, w: 200, h: 20 },   // P2  spike platform (dark zone, hard to see)
  // Enemy section
  { x: 1050, y: 355, w: 220, h: 20 },   // P3  enemy A — slow intro
  { x: 1380, y: 345, w: 200, h: 20 },   // P4  enemy B + spikes
  { x: 1690, y: 335, w: 220, h: 20 },   // P5  enemy C + spikes
  // Hard-to-see platform + checkpoint
  { x: 2020, y: 320, w: 180, h: 20 },   // P6  hard to see (encourages double jump)
  { x: 2290, y: 330, w: 170, h: 20 },   // P7  checkpoint
  // Moving platform gap
  { x: 2620, y: 340, w: 170, h: 20 },   // P8  after moving platform
  // Laser zone
  { x: 2880, y: 350, w: 600, h: 20 },   // P9  long laser platform with enemy
  // Finish
  { x: 3560, y: 370, w: 200, h: 50 },   // P10 finish
];

const LEVEL2_WALLS = []; // no wall in Level 2

const LEVEL2_MOVING_PLATFORMS = [
  // Single MP bridging gap between P7 (ends 2460) and P8 (starts 2620)
  { x: 2540, y: 332, w: 90, h: 14, speed: 1.0, axis: "x", origin: 2540, range: 80, dx: 0, dy: 0 },
];

const LEVEL2_ENEMIES = [
  // A — slow intro on P3
  { x: 1050, y: 325, w: 22, h: 30, speed: 0.85, dir: 1, leftBound: 1050, rightBound: 1248, startX: 1050, startDir: 1, type: 1 },
  // B — medium on P4
  { x: 1380, y: 315, w: 22, h: 30, speed: 1.15, dir: 1, leftBound: 1380, rightBound: 1558, startX: 1380, startDir: 1, type: 1 },
  // C — faster on P5
  { x: 1690, y: 305, w: 22, h: 30, speed: 1.40, dir: 1, leftBound: 1690, rightBound: 1888, startX: 1690, startDir: 1, type: 2 },
  // D — laser zone guard on P9
  { x: 2950, y: 320, w: 22, h: 30, speed: 1.20, dir: 1, leftBound: 2880, rightBound: 3458, startX: 2950, startDir: 1, type: 2 },
];

// Spikes on dark platform P2 + enemy platforms P4/P5
const LEVEL2_SPIKES = [
  // Spikes on dark platform P2 (y=365, spike y=351)
  { x: 808, y: 351, w: 16, h: 14 },
  { x: 826, y: 351, w: 16, h: 14 },
  // Spikes on P4 with enemy B (y=345, spike y=331)
  { x: 1460, y: 331, w: 16, h: 14 },
  { x: 1478, y: 331, w: 16, h: 14 },
  // Spikes on P5 with enemy C (y=335, spike y=321)
  { x: 1790, y: 321, w: 16, h: 14 },
  { x: 1808, y: 321, w: 16, h: 14 },
];

// Three VERTICAL lasers above P9 (flickering on/off)
const LEVEL2_LASERS = [
  { x: 3060, y: 230, w: 4, h: 120, phase: 20  },
  { x: 3180, y: 230, w: 4, h: 120, phase: 80  },
  { x: 3300, y: 230, w: 4, h: 120, phase: 140 },
];

// Goal centered on finish P10
const LEVEL2_GOAL = { x: 3638, y: 318, w: 36, h: 52 };

// Checkpoint on P7
const LEVEL2_CHECKPOINTS = [{ x: 2366, y: 290, w: 18, h: 40 }];

// Vision pickup in laser zone on P9
const LEVEL2_VISION_PICKUP = { x: 3400, y: 334, w: 16, h: 16 };

// ── LEVEL 3 DATA — "The Infiltration" ────────────────────────────────────────
//  Zone A (0–600):     Start + dark platform (forces focus).
//  Zone B (600–1200):  Early lasers — "one path is right", flickering.
//  Zone C (1200–1800):  Spikes + enemy A.
//  Zone D (1800–2600):  Moving platform gap + dark zone + enemy B.
//  Zone E (2600–3200):  Checkpoint + enemy C + MP2 + vision pickup.
//  Zone F (3200–3800):  MASSIVE spike gauntlet (signature challenge).
//  Zone G (3800–4200):  CP2 + enemy D + final lasers + goal.

const LEVEL3_PLATFORMS = [
  // Zone A — start + dark platform
  { x: 0, y: 400, w: 340, h: 50 }, // P0  start ground
  { x: 420, y: 376, w: 160, h: 20 }, // P1  first hop
  { x: 630, y: 356, w: 180, h: 20 }, // P2  hard-to-see (dark zone covers this)
  // Zone B — early laser section
  { x: 870, y: 336, w: 150, h: 20 }, // P3  pre-laser
  { x: 1060, y: 336, w: 160, h: 20 }, // P4  laser platform (2 lasers above)
  { x: 1270, y: 318, w: 160, h: 20 }, // P5  post-laser landing
  // Zone C — spikes + enemy A
  { x: 1490, y: 300, w: 200, h: 20 }, // P6  spike platform (3 spikes)
  { x: 1760, y: 282, w: 190, h: 20 }, // P7  enemy A patrol
  // Zone D — MP1 gap + dark zone + enemy B
  { x: 2010, y: 264, w: 160, h: 20 }, // P8  run-up to gap
  { x: 2450, y: 248, w: 170, h: 20 }, // P9  landing after MP1
  { x: 2640, y: 234, w: 180, h: 20 }, // P10 dark zone + enemy B
  // Zone E — checkpoint + enemy C + MP2 + pickup
  { x: 2890, y: 220, w: 170, h: 20 }, // P11 checkpoint 1 + enemy C
  { x: 3230, y: 208, w: 160, h: 20 }, // P12 vision pickup platform
  // Zone F — massive spike gauntlet
  { x: 3400, y: 224, w: 420, h: 20 }, // P13 WIDE spike platform (18 spikes)
  // Zone G — CP2 + enemy D + final lasers + finish
  { x: 3880, y: 240, w: 170, h: 20 }, // P14 CP2 + enemy D
  { x: 4060, y: 370, w: 140, h: 50 }, // P15 finish — drops to ground
];

const LEVEL3_WALLS = []; // no wall obstacles in Level 3

// Two horizontal moving platforms
const LEVEL3_MOVING_PLATFORMS = [
  // MP1: bridges gap between P8 (right: 2170) and P9 (left: 2450)
  // left edge oscillates 2160–2360; right edge 2250–2450 → just reaches P9 at max, no deep overlap
  {
    x: 2260,
    y: 252,
    w: 90,
    h: 14,
    speed: 1.1,
    axis: "x",
    origin: 2260,
    range: 100,
    dx: 0,
    dy: 0,
  },
  // MP2: bridges gap between P11 (right: 3060) and P12 (left: 3230)
  // left edge oscillates 3030–3140; right edge 3120–3230 → just reaches P12 at max
  {
    x: 3085,
    y: 210,
    w: 90,
    h: 14,
    speed: 1.2,
    axis: "x",
    origin: 3085,
    range: 55,
    dx: 0,
    dy: 0,
  },
];

const LEVEL3_ENEMIES = [
  // A — medium on P7 (x:1760, y:282)
  {
    x: 1760,
    y: 252,
    w: 22,
    h: 30,
    speed: 1.25,
    dir: 1,
    leftBound: 1760,
    rightBound: 1928,
    startX: 1760,
    startDir: 1,
    type: 1,
  },
  // B — fast on P10 (x:2640, y:234, dark zone)
  {
    x: 2640,
    y: 204,
    w: 22,
    h: 30,
    speed: 1.55,
    dir: 1,
    leftBound: 2640,
    rightBound: 2798,
    startX: 2640,
    startDir: 1,
    type: 2,
  },
  // C — medium on P11 (x:2890, y:220)
  {
    x: 2890,
    y: 190,
    w: 22,
    h: 30,
    speed: 1.2,
    dir: 1,
    leftBound: 2890,
    rightBound: 3038,
    startX: 2890,
    startDir: 1,
    type: 1,
  },
  // D — slow on P14 (x:3880, y:240), last guard
  {
    x: 3880,
    y: 210,
    w: 22,
    h: 30,
    speed: 0.95,
    dir: 1,
    leftBound: 3880,
    rightBound: 4028,
    startX: 3880,
    startDir: 1,
    type: 2,
  },
];

// Zone C: 3 spikes on P6 (x:1490, y:300 → spike y:286)
// Zone F: 18 spikes across wide P13 (x:3400, y:224 → spike y:210) — massive gauntlet
const LEVEL3_SPIKES = [
  // Zone C — spike platform P6
  { x: 1520, y: 286, w: 16, h: 14 },
  { x: 1548, y: 286, w: 16, h: 14 },
  { x: 1576, y: 286, w: 16, h: 14 },
  // Zone F — MASSIVE spike gauntlet on P13 (16 spikes, 20px spacing)
  { x: 3450, y: 210, w: 16, h: 14 },
  { x: 3470, y: 210, w: 16, h: 14 },
  { x: 3490, y: 210, w: 16, h: 14 },
  { x: 3510, y: 210, w: 16, h: 14 },
  { x: 3530, y: 210, w: 16, h: 14 },
  { x: 3550, y: 210, w: 16, h: 14 },
  { x: 3570, y: 210, w: 16, h: 14 },
  { x: 3590, y: 210, w: 16, h: 14 },
  { x: 3610, y: 210, w: 16, h: 14 },
  { x: 3630, y: 210, w: 16, h: 14 },
  { x: 3650, y: 210, w: 16, h: 14 },
  { x: 3670, y: 210, w: 16, h: 14 },
  { x: 3690, y: 210, w: 16, h: 14 },
  { x: 3710, y: 210, w: 16, h: 14 },
  { x: 3730, y: 210, w: 16, h: 14 },
  { x: 3750, y: 210, w: 16, h: 14 },
];

// Zone B: 2 early lasers above P4 (platform y=336 → laser y=281); flickering, staggered
// Zone G: 2 final lasers near goal
const LEVEL3_LASERS = [
  // Early lasers — Zone B
  { x: 1070, y: 281, w: 120, h: 4, phase: 0 },
  { x: 1070, y: 300, w: 120, h: 4, phase: 90 },
  // Final lasers — Zone G (above P14, y=240 → laser y=185)
  { x: 3890, y: 185, w: 140, h: 4, phase: 30 },
  { x: 3890, y: 205, w: 140, h: 4, phase: 120 },
];

// Goal centred on finish P15 (x:4060, y:370, w:140)
const LEVEL3_GOAL = { x: 4108, y: 318, w: 36, h: 52 };

// CP1 on P9 (x:2450, y:248, no enemy); CP2 on end of P13 after spikes (x:3400+350=3750, no enemy)
const LEVEL3_CHECKPOINTS = [
  { x: 2535, y: 208, w: 18, h: 40 },  // center of P9 (x:2450, w:170)
  { x: 3790, y: 184, w: 18, h: 40 },  // end of P13 (x:3400, w:420), after all spikes, before enemy D
];

// Vision pickup on P12 — before the massive spike gauntlet
const LEVEL3_VISION_PICKUP = { x: 3302, y: 192, w: 16, h: 16 };

// Glare and dark zones for Level 3
const LEVEL3_GLARE_ZONES = [
  { x: 1000, w: 280, intensity: 3.5 }, // Zone B — early laser glare
  { x: 2580, w: 400, intensity: 7.0 }, // Zone D — dark zone glare
  { x: 3380, w: 450, intensity: 9.5 }, // Zone F — spike gauntlet
];
const LEVEL3_DARK_ZONES = [
  { x: 560, w: 280, intensity: 0.93 }, // Zone A — hard-to-see platform
  { x: 2560, w: 380, intensity: 0.97 }, // Zone D — dark zone + enemy B
  { x: 3380, w: 440, intensity: 0.92 }, // Zone F — spike gauntlet darkness
];

const VISION_BOOST_FRAMES = 300;
const VISION_FADE_FRAMES = 60;
const DARK_WALL_SPEED = 1.2;

// ── ASSET LOADING ────────────────────────────────────────────────────────────
let buildingImgs = [];
let jamieIdle = [];
let jamieRun = [];
let jamieJump = [];
let spikeImgs = []; // [Spike_1_Sprite, Spike_2_Sprite] — 2 variants for visual variety
let enemy1Imgs = { idle: null, walk: null }; // type-1 enemy (spider)
let enemy2Imgs = { idle: null, walk: null, attack: null }; // type-2 enemy (humanoid guard)
let checkpointImg = null; // checkpoint spritesheet
let bgMusic;
let sfxJump, sfxDoubleJump, sfxFocus, sfxDeath, sfxGoal;

function preload() {
  for (let i = 2; i <= 8; i++) {
    let pad = i < 10 ? "0" + i : "" + i;
    buildingImgs.push(
      loadImage("assets/images/Buildings/Pixel Art Buildings-" + pad + ".png"),
    );
  }
  for (let i = 1; i <= 3; i++)
    jamieIdle.push(
      loadImage("assets/images/JAMIE/IDLE/Jamie_IDLE_" + i + ".png"),
    );
  for (let i = 1; i <= 4; i++)
    jamieRun.push(loadImage("assets/images/JAMIE/RUN/Jamie_RUN_" + i + ".png"));
  for (let i = 1; i <= 5; i++)
    jamieJump.push(
      loadImage("assets/images/JAMIE/JUMP/Jamie_JUMP_" + i + ".png"),
    );
  for (let i = 1; i <= 2; i++)
    spikeImgs.push(
      loadImage("assets/images/Spikes/Spike_" + i + "_Sprite.png"),
    );
  enemy1Imgs.idle = loadImage("assets/images/Enemies/Enemy_1/Enemy-1-Idle.png");
  enemy1Imgs.walk = loadImage(
    "assets/images/Enemies/Enemy_1/Enemy-1-Walking.png",
  );
  enemy2Imgs.idle = loadImage("assets/images/Enemies/Enemy_2/Enemy-2-Idle.png");
  enemy2Imgs.walk = loadImage(
    "assets/images/Enemies/Enemy_2/Enemy-2-Walking.png",
  );
  enemy2Imgs.attack = loadImage(
    "assets/images/Enemies/Enemy_2/Enemy-2-Attack.png",
  );
  checkpointImg = loadImage("assets/images/Checkpoint/Checkpoint.png");
  bgMusic = loadSound("assets/sounds/nikitakondrashev-cyberpunk-437545.mp3");
  sfxJump = loadSound("assets/sounds/Jump.mp3");
  sfxDoubleJump = loadSound("assets/sounds/Dash.mp3");
  sfxFocus = loadSound("assets/sounds/Focus.mp3");
  sfxDeath = loadSound("assets/sounds/Breach(death).mp3");
  sfxGoal = loadSound("assets/sounds/Explosion then power down.mp3");
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let player;
let platforms, movingPlatforms, walls, enemies, goal;
let spikes, lasers;
let allPlats = []; // built once: platforms + movingPlatforms + walls (updated in-place)

let camX = 0;
let playerFacing = 1;

let canDoubleJump = false;

let checkpoints = [];
let activeCheckpointIdx = -1;
let cpPulseTimers = [];

let visionPickup = null;
let visionBoostTimer = 0;

let darkWallX = -200;
let darkWallActive = false;
let darkWallTriggerX = 2900; // set per level in initLevel()
let darkWallDelay = 0;       // frames of grace after respawn before wall can re-activate

let gameState = "start";
let introTimer = 0;
let winTimer = 0;
let menuSelection = 0;
let winMenuSel = 0; // 0 = NEXT LEVEL, 1 = HOME

let focusActive = false;
let focusFade = 0;
let prevFocusKey = false;
let focusPulseR = 0;
let focusPulseOn = false;
let focusFlashTimer = 0;
let focusCooldown = 0;
let focusWasUsed = false; // tracks if echolocation was used (for cooldown trigger)

let deathCount = 0;
let deathShakeTimer = 0;
let deathFlashTimer = 0;

let coyoteTimer = 0;
let wasOnGround = false;
let jumpHeld = false;

let afterimages = [];

let bgLayer1 = [];
let bgLayer2 = [];
let rain = [];
let motes = [];

// Pre-allocated scratch objects to avoid per-frame GC pressure
const _mpFeet = { x: 0, y: 0, w: 30, h: 4 };
const _mpTop = { x: 0, y: 0, w: 0, h: 6 };

// ═══════════════════════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════════════════════

function setup() {
  createCanvas(800, 450);
  frameRate(60);
  fitCanvas();
  player = { x: 60, y: 360, w: 30, h: 40, vx: 0, vy: 0, onGround: false };
  initLevel();
  initParallax();
  initParticles();
}

function windowResized() {
  fitCanvas();
}

function fitCanvas() {
  let sc = min(windowWidth / 800, windowHeight / 450);
  document.querySelector("canvas").style.transform =
    "translate(-50%, -50%) scale(" + sc + ")";
}

// Returns mouse position in canvas coordinates regardless of CSS scale
function cmx() {
  let r = document.querySelector("canvas").getBoundingClientRect();
  return (winMouseX - r.left) * (800 / r.width);
}
function cmy() {
  let r = document.querySelector("canvas").getBoundingClientRect();
  return (winMouseY - r.top) * (450 / r.height);
}

// ── Level initialisation ───────────────────────────────────────────────────────
function initLevel() {
  // Select data source and environment settings based on currentLevel
  let pd, mpd, wd, ed, sd, ld, gd, cpd, vpd;
  if (currentLevel === 3) {
    pd = LEVEL3_PLATFORMS;
    mpd = LEVEL3_MOVING_PLATFORMS;
    wd = LEVEL3_WALLS;
    ed = LEVEL3_ENEMIES;
    sd = LEVEL3_SPIKES;
    ld = LEVEL3_LASERS;
    gd = LEVEL3_GOAL;
    cpd = LEVEL3_CHECKPOINTS;
    vpd = LEVEL3_VISION_PICKUP;
    GLARE_ZONES = LEVEL3_GLARE_ZONES;
    DARK_ZONES = LEVEL3_DARK_ZONES;
    darkWallTriggerX = 3400; // fires as player enters spike gauntlet zone
  } else if (currentLevel === 2) {
    pd = LEVEL2_PLATFORMS;
    mpd = LEVEL2_MOVING_PLATFORMS;
    wd = LEVEL2_WALLS;
    ed = LEVEL2_ENEMIES;
    sd = LEVEL2_SPIKES;
    ld = LEVEL2_LASERS;
    gd = LEVEL2_GOAL;
    cpd = LEVEL2_CHECKPOINTS;
    vpd = LEVEL2_VISION_PICKUP;
    GLARE_ZONES = LEVEL2_GLARE_ZONES;
    DARK_ZONES = LEVEL2_DARK_ZONES;
    darkWallTriggerX = 2900; // fires in laser zone
  } else {
    pd = LEVEL_PLATFORMS;
    mpd = LEVEL_MOVING_PLATFORMS;
    wd = LEVEL_WALLS;
    ed = LEVEL_ENEMIES;
    sd = LEVEL_SPIKES;
    ld = LEVEL_LASERS;
    gd = LEVEL_GOAL;
    cpd = LEVEL_CHECKPOINTS;
    vpd = LEVEL_VISION_PICKUP;
    GLARE_ZONES = LEVEL1_GLARE_ZONES;
    DARK_ZONES = LEVEL1_DARK_ZONES;
    darkWallTriggerX = 2700;
  }

  platforms = pd.map((p) => Object.assign({}, p));
  movingPlatforms = mpd.map((mp) => Object.assign({}, mp));
  walls = wd.map((w) => Object.assign({}, w));
  enemies = ed.map((e) => Object.assign({}, e));
  spikes = sd;
  lasers = ld;
  goal = Object.assign({}, gd);
  allPlats = platforms.concat(walls); // moving platforms handled separately (top-land only)
  checkpoints = cpd.map((c) => Object.assign({ activated: false }, c));
  activeCheckpointIdx = -1;
  cpPulseTimers = checkpoints.map(() => 0);
  visionPickup = Object.assign({}, vpd);
  visionBoostTimer = 0;
  darkWallX = -200;
  darkWallActive = false;
  darkWallDelay = 0;
}

// ── Parallax generation ────────────────────────────────────────────────────────
function initParallax() {
  bgLayer1 = [];
  bgLayer2 = [];
  let farIdx = [3, 4, 6];
  let x1 = -300;
  while (x1 < WORLD_W + 600) {
    let idx = farIdx[floor(random(farIdx.length))];
    let img = buildingImgs[idx];
    let sc = random(0.22, 0.38);
    bgLayer1.push({
      x: x1,
      w: img.width * sc,
      h: img.height * sc,
      imgIdx: idx,
    });
    x1 += img.width * sc + random(20, 70);
  }
  let x2 = -300;
  while (x2 < WORLD_W + 600) {
    let idx = floor(random(buildingImgs.length));
    let img = buildingImgs[idx];
    let sc = random(0.32, 0.55);
    bgLayer2.push({
      x: x2,
      w: img.width * sc,
      h: img.height * sc,
      imgIdx: idx,
    });
    x2 += img.width * sc + random(-10, 25);
  }
}

// ── Particle initialisation ────────────────────────────────────────────────────
function initParticles() {
  rain = [];
  motes = [];
  for (let i = 0; i < RAIN_COUNT; i++) {
    rain.push({
      x: random(width + 40),
      y: random(-20, height),
      speed: random(5, 9),
      len: random(12, 22),
      alpha: random(55, 110),
    });
  }
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes.push({
      x: random(width),
      y: random(height),
      vx: random(-0.5, 0.5),
      vy: random(-0.9, -0.15),
      size: random(1.5, 4),
      alpha: random(100, 210),
      pink: random() > 0.5,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════════

function draw() {
  if (gameState === "start") {
    drawStartScreen();
    return;
  }
  if (gameState === "win") {
    drawWinScreen();
    return;
  }
  if (gameState === "comingsoon") {
    drawComingSoon();
    return;
  }

  if (gameState === "winning") {
    winTimer++;
    background(12, 8, 20);
    drawParallax(true);
    push();
    translate(-camX, 0);
    drawLights();
    drawPlatforms();
    drawMovingPlatforms();
    drawWalls();
    drawGoal();
    drawEnemies();
    pop();
    updateParticles();
    drawParticles();
    drawNoise();
    drawScanlines();
    drawVignette();
    let portalSX = goal.x + goal.w / 2 - camX;
    let portalSY = goal.y + goal.h / 2;
    let r = map(winTimer, 0, 28, 0, dist(0, 0, width, height) * 1.1);
    let alph = winTimer < 18 ? map(winTimer, 0, 18, 0, 230) : 230;
    noStroke();
    fill(0, 210, 255, constrain(alph, 0, 255));
    ellipse(portalSX, portalSY, r * 2, r * 2);
    if (winTimer >= 34) gameState = "win";
    return;
  }

  updatePlayer();
  updateMovingPlatforms();
  updateCamera();

  if (gameState === "intro") {
    introTimer++;
    drawIntroScene();
    if (introTimer >= INTRO_NORMAL_F + INTRO_SHAKE_F + INTRO_FLASH_F)
      gameState = "play";
    return;
  }

  // ── PLAY ──────────────────────────────────────────────────────────────────
  updateFocus();
  updateEnemies();
  updateDarkWall();
  updateVisionPickup();
  updateCheckpoints();
  checkEnemyCollision();
  checkTrapCollision();
  if (overlaps(player, goal)) {
    gameState = "winning";
    winTimer = 0;
    playSfx(sfxGoal, 0.65);
    return;
  }

  if (deathShakeTimer > 0) deathShakeTimer--;
  if (deathFlashTimer > 0) deathFlashTimer--;

  background(12, 8, 20);
  drawParallax(true);

  push();
  let dsx = 0,
    dsy = 0;
  if (deathShakeTimer > 0) {
    let mag = map(deathShakeTimer, 0, DEATH_SHAKE_FRAMES, 0, 8);
    dsx = random(-mag, mag);
    dsy = random(-mag, mag);
  }
  translate(-camX + dsx, dsy);

  drawLights();
  drawGlareZones();
  drawPlatforms();
  drawMovingPlatforms();
  drawWalls();
  drawGoal();
  drawVisionPickup();
  drawEnemies();
  drawSpikes();
  drawLasers();
  drawAfterimages();
  drawPlayer();
  pop();
  drawDarkZones();
  drawDarkWall();
  // Checkpoints drawn AFTER dark/glare overlays so they're always visible
  push();
  translate(-camX + dsx, dsy);
  drawCheckpoints();
  pop();

  updateParticles();
  drawParticles();

  if (focusFlashTimer > 0) {
    focusFlashTimer--;
    let fa = map(focusFlashTimer, FOCUS_FLASH_FRAMES, 0, 60, 0);
    noStroke();
    fill(0, 255, 240, constrain(fa, 0, 255));
    rect(0, 0, width, height);
  }
  if (deathFlashTimer > 0) {
    let da = map(deathFlashTimer, DEATH_FLASH_FRAMES, 0, 100, 0);
    noStroke();
    fill(255, 20, 60, constrain(da, 0, 255));
    rect(0, 0, width, height);
  }

  drawDangerWarning();
  drawNoise();
  drawScanlines();
  drawVignette();
  // Echolocation highlights are drawn LAST — on top of every overlay layer
  drawEchoHighlights();
  if (currentLevel === 1) drawLevel1Instructions();
  drawHUD();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME STATES
// ═══════════════════════════════════════════════════════════════════════════════

function drawGlitchLine(y, halfW, r, g, b, maxAlpha) {
  let segments = 18;
  let segW = (halfW * 2) / segments;
  let cx = width / 2;
  for (let i = 0; i < segments; i++) {
    if (random() < 0.3) continue;
    let sx = cx - halfW + i * segW;
    let jy = y + random(-1.5, 1.5);
    let sw = segW * random(0.5, 1.0);
    let a = maxAlpha * random(0.4, 1.0);
    stroke(r, g, b, a);
    strokeWeight(random(1, 2.5));
    line(sx, jy, sx + sw, jy);
  }
  noStroke();
}

function drawStartScreen() {
  background(12, 8, 20);
  let saved = camX;
  camX = 200 + sin(frameCount * 0.005) * 200;
  drawParallax(true);
  camX = saved;
  updateParticles();
  drawParticles();

  let btnW = 180,
    btnH = 34;
  let startBtnY = 290,
    exitBtnY = 335;
  let btnX = width / 2 - btnW / 2;
  let mx = cmx(),
    my = cmy();
  if (mx >= btnX && mx <= btnX + btnW) {
    if (my >= startBtnY && my <= startBtnY + btnH) menuSelection = 0;
    if (my >= exitBtnY && my <= exitBtnY + btnH) menuSelection = 1;
  }

  let cx = width / 2;
  textAlign(CENTER, CENTER);
  noStroke();

  // Title glow layers
  let titleY = 80;
  let titleGlow = 220 + 35 * sin(frameCount * 0.04);
  fill(0, titleGlow, constrain(titleGlow - 10, 0, 255), 15);
  textSize(64);
  textStyle(BOLD);
  text("DATA BREACH", cx + 2, titleY + 2);
  text("DATA BREACH", cx - 2, titleY - 2);
  fill(0, titleGlow, constrain(titleGlow - 10, 0, 255));
  textSize(62);
  text("DATA BREACH", cx, titleY);

  drawGlitchLine(titleY - 38, 200, 255, 40, 80, 180);
  drawGlitchLine(titleY + 38, 200, 255, 40, 80, 180);

  fill(180, 140, 255);
  textSize(12);
  textStyle(NORMAL);
  text("VISION IS A LIMITED RESOURCE", cx, titleY + 60);

  // Controls
  let ctrlY = 190;
  let startX = cx - 213;
  drawKeyCluster(startX, ctrlY, ["W", "A", "S", "D"]);
  fill(160, 140, 210);
  textSize(9);
  textAlign(CENTER, TOP);
  text("MOVE", startX + 34, ctrlY + 48);

  let arrowX = startX + 120;
  drawKeyCluster(arrowX, ctrlY, ["\u2191", "\u2190", "\u2193", "\u2192"]);
  fill(160, 140, 210);
  textSize(9);
  textAlign(CENTER, TOP);
  text("MOVE", arrowX + 34, ctrlY + 48);

  let fX = startX + 270;
  drawKeyCap(fX, ctrlY + 10, 32, 28, "F");
  fill(160, 140, 210);
  textSize(8);
  textAlign(CENTER, TOP);
  text("ECHOLOCATION", fX + 16, ctrlY + 48);

  let spaceX = startX + 355;
  drawKeyCap(spaceX, ctrlY + 10, 70, 28, "SPACE");
  fill(160, 140, 210);
  textSize(9);
  textAlign(CENTER, TOP);
  text("JUMP", spaceX + 35, ctrlY + 48);

  textAlign(CENTER, CENTER);
  drawMenuButton(
    cx,
    startBtnY + btnH / 2,
    btnW,
    btnH,
    "START GAME",
    menuSelection === 0,
  );
  drawMenuButton(
    cx,
    exitBtnY + btnH / 2,
    btnW,
    btnH,
    "EXIT GAME",
    menuSelection === 1,
  );

  if (sin(frameCount * 0.07) > 0) {
    fill(160, 140, 210, 200);
    textSize(10);
    text("PRESS ENTER OR CLICK TO SELECT", cx, 395);
  }
  drawScanlines();
  drawVignette();
}

function drawKeyCap(x, y, w, h, label) {
  noStroke();
  fill(30, 25, 45, 200);
  rect(x, y, w, h, 4);
  stroke(80, 70, 110, 120);
  strokeWeight(1);
  noFill();
  rect(x, y, w, h, 4);
  noStroke();
  fill(200, 185, 240);
  textSize(11);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawKeyCluster(x, y, keys) {
  let kw = 24,
    kh = 20,
    gap = 2;
  drawKeyCap(x + kw + gap, y, kw, kh, keys[0]);
  drawKeyCap(x, y + kh + gap, kw, kh, keys[1]);
  drawKeyCap(x + kw + gap, y + kh + gap, kw, kh, keys[2]);
  drawKeyCap(x + (kw + gap) * 2, y + kh + gap, kw, kh, keys[3]);
}

function drawMenuButton(cx, cy, w, h, label, selected) {
  let bx = cx - w / 2,
    by = cy - h / 2;
  if (selected) {
    let pulse = 0.7 + 0.3 * sin(frameCount * 0.08);
    noStroke();
    fill(0, 255, 240, 12 * pulse);
    rect(bx - 4, by - 4, w + 8, h + 8, 4);
    fill(0, 255, 240, 25 * pulse);
    rect(bx, by, w, h, 3);
    drawGlitchLine(by - 3, w / 2 - 10, 255, 40, 80, 120);
    drawGlitchLine(by + h + 3, w / 2 - 10, 255, 40, 80, 120);
    stroke(0, 255, 240, 200 * pulse);
    strokeWeight(1.5);
    noFill();
    rect(bx, by, w, h, 3);
    noStroke();
    fill(0, 255, 240);
    textSize(14);
    textStyle(BOLD);
    text(label, cx, cy);
    textStyle(NORMAL);
  } else {
    noStroke();
    fill(35, 30, 50, 150);
    rect(bx, by, w, h, 3);
    stroke(70, 60, 90, 80);
    strokeWeight(1);
    noFill();
    rect(bx, by, w, h, 3);
    noStroke();
    fill(190, 170, 230);
    textSize(14);
    textStyle(BOLD);
    text(label, cx, cy);
    textStyle(NORMAL);
  }
}

function drawIntroScene() {
  let shakeEnd = INTRO_NORMAL_F + INTRO_SHAKE_F;
  let flashEnd = shakeEnd + INTRO_FLASH_F;
  let inShake = introTimer >= INTRO_NORMAL_F && introTimer < shakeEnd;
  let inFlash = introTimer >= shakeEnd;
  let sx = 0,
    sy = 0;
  if (inShake) {
    let t = (introTimer - INTRO_NORMAL_F) / INTRO_SHAKE_F;
    let mag = lerp(11, 0, t);
    sx = random(-mag, mag);
    sy = random(-mag, mag);
  }
  background(12, 8, 20);
  drawParallax(inFlash);
  updateEnemies();
  push();
  translate(-camX + sx, sy);
  if (inFlash) {
    drawLights();
    drawPlatforms();
    drawMovingPlatforms();
    drawWalls();
    drawGoal();
    drawEnemies();
  } else {
    drawPlatformsFull();
    drawMovingPlatformsFull();
    drawWallsFull();
    drawGoalFull();
    drawEnemiesFull();
  }
  drawPlayer();
  pop();
  updateParticles();
  drawParticles();
  drawScanlines();
  if (inFlash) {
    drawVignette();
    let a = map(introTimer, shakeEnd, flashEnd, 255, 0);
    noStroke();
    fill(255, 255, 255, constrain(a, 0, 255));
    rect(0, 0, width, height);
  }
}

function drawWinScreen() {
  background(12, 8, 20);
  updateParticles();
  drawParticles();
  let pcx = width / 2,
    pcy = 205;
  drawPortalVFX(pcx, pcy, 52, 82, 1.0);
  if (jamieIdle.length > 0) {
    push();
    tint(255, 255, 255, 200);
    imageMode(CENTER);
    image(jamieIdle[0], pcx, pcy + 6, 32, 32);
    imageMode(CORNER);
    pop();
  }
  textAlign(CENTER, CENTER);
  fill(0, 255, 240);
  textSize(44);
  textStyle(BOLD);
  text("DATA SECURED", pcx, 62);
  stroke(255, 50, 150, 70);
  strokeWeight(1);
  line(pcx - 190, 84, pcx + 190, 84);
  noStroke();
  fill(200, 60, 255);
  textSize(14);
  textStyle(NORMAL);
  text("OBJECTIVE COMPLETE", pcx, 308);
  fill(255, 50, 150, 180);
  textSize(11);
  text(
    deathCount === 0
      ? "FLAWLESS RUN   //   ZERO BREACHES"
      : "SYSTEM BREACHES: " + deathCount,
    pcx,
    330,
  );
  fill(45, 42, 65);
  textSize(10);
  text("ACCESS NODE REACHED   //   NEURAL LINK ESTABLISHED", pcx, 348);

  // Hover detection
  let mx = cmx(),
    my = cmy();
  if (
    mx >= WIN_NEXT_BTN.x &&
    mx <= WIN_NEXT_BTN.x + WIN_NEXT_BTN.w &&
    my >= WIN_NEXT_BTN.y &&
    my <= WIN_NEXT_BTN.y + WIN_NEXT_BTN.h
  )
    winMenuSel = 0;
  if (
    mx >= WIN_HOME_BTN.x &&
    mx <= WIN_HOME_BTN.x + WIN_HOME_BTN.w &&
    my >= WIN_HOME_BTN.y &&
    my <= WIN_HOME_BTN.y + WIN_HOME_BTN.h
  )
    winMenuSel = 1;

  // Draw both buttons
  drawWinButton(
    WIN_NEXT_BTN,
    "[ NEXT LEVEL ]",
    winMenuSel === 0,
    [0, 255, 240],
  );
  drawWinButton(
    WIN_HOME_BTN,
    "[ MAIN MENU ]",
    winMenuSel === 1,
    [160, 80, 255],
  );

  fill(100, 90, 140, 160);
  textSize(9);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text(
    "ARROW KEYS TO SELECT   //   ENTER TO CONFIRM",
    pcx,
    WIN_NEXT_BTN.y + WIN_NEXT_BTN.h + 16,
  );
  drawScanlines();
  drawVignette();
}

function drawWinButton(btn, label, selected, col) {
  let pulse = 0.7 + 0.3 * sin(frameCount * 0.08);
  let cx = btn.x + btn.w / 2,
    cy = btn.y + btn.h / 2;
  noStroke();
  if (selected) {
    fill(col[0], col[1], col[2], 18 * pulse);
    rect(btn.x - 4, btn.y - 4, btn.w + 8, btn.h + 8, 5);
    fill(col[0], col[1], col[2], 38 * pulse);
    rect(btn.x, btn.y, btn.w, btn.h, 3);
    stroke(col[0], col[1], col[2], 220 * pulse);
    strokeWeight(1.5);
    noFill();
    rect(btn.x, btn.y, btn.w, btn.h, 3);
    noStroke();
    fill(col[0], col[1], col[2]);
    textSize(13);
    textStyle(BOLD);
    text(label, cx, cy);
  } else {
    fill(30, 25, 45, 160);
    rect(btn.x, btn.y, btn.w, btn.h, 3);
    stroke(col[0], col[1], col[2], 70);
    strokeWeight(1);
    noFill();
    rect(btn.x, btn.y, btn.w, btn.h, 3);
    noStroke();
    fill(col[0] * 0.7, col[1] * 0.7, col[2] * 0.7, 190);
    textSize(13);
    textStyle(BOLD);
    text(label, cx, cy);
  }
  textStyle(NORMAL);
}

function drawComingSoon() {
  winTimer++;
  background(12, 8, 20);
  updateParticles();
  drawParticles();
  let pcx = width / 2,
    pcy = height / 2;
  let t = winTimer;
  // Fade in 0–40, hold 40–280, fade out 280–340
  let alpha =
    t < 40 ? map(t, 0, 40, 0, 255) : t > 280 ? map(t, 280, 340, 255, 0) : 255;
  let a = constrain(alpha, 0, 255);

  textAlign(CENTER, CENTER);
  noStroke();

  // Outer glow panel
  fill(0, 210, 255, a * 0.05);
  rect(pcx - 260, pcy - 90, 520, 180, 10);
  fill(0, 210, 255, a * 0.1);
  rect(pcx - 255, pcy - 85, 510, 170, 8);
  stroke(0, 210, 255, a * 0.45);
  strokeWeight(1.5);
  noFill();
  rect(pcx - 255, pcy - 85, 510, 170, 8);
  noStroke();

  // "GAME COMPLETE" headline
  fill(0, 210, 255, a * 0.12);
  textSize(46);
  textStyle(BOLD);
  text("GAME COMPLETE", pcx + 2, pcy - 34 + 2);
  fill(0, 210, 255, a);
  textSize(44);
  textStyle(BOLD);
  text("GAME COMPLETE", pcx, pcy - 34);

  // Subtitle
  fill(160, 80, 255, a);
  textSize(13);
  textStyle(NORMAL);
  text("THE BREACH IS SEALED. JAMIE VANISHES INTO THE GRID.", pcx, pcy + 12);

  // Death count callout (only if player died at least once)
  if (deathCount > 0) {
    fill(255, 40, 100, a * 0.75);
    textSize(10);
    text("BREACHES SUSTAINED: " + deathCount, pcx, pcy + 36);
  } else {
    fill(0, 255, 180, a * 0.75);
    textSize(10);
    text("NO BREACHES SUSTAINED — FLAWLESS RUN", pcx, pcy + 36);
  }

  // Footer
  fill(80, 70, 110, a * 0.65);
  textSize(9);
  text("RETURNING TO MAIN MENU...", pcx, pcy + 62);

  drawScanlines();
  drawVignette();
  if (winTimer >= 340) resetGame();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FOCUS MECHANIC
// ═══════════════════════════════════════════════════════════════════════════════

function updateFocus() {
  let fHeld = keyIsDown(70);
  let canFocus = player.onGround && abs(player.vx) < 0.5 && focusCooldown <= 0;

  // Cooldown tick
  if (focusCooldown > 0) {
    focusCooldown--;
    if (focusCooldown === 0 && focusWasUsed) {
      playSfx(sfxDoubleJump, 0.25); // "echolocation ready" chime
      focusWasUsed = false;
    }
  }

  if (fHeld && canFocus) {
    if (!focusActive) {
      focusPulseOn = true;
      focusPulseR = 0;
      focusFlashTimer = FOCUS_FLASH_FRAMES;
      playSfx(sfxFocus, 0.5);
    }
    focusActive = true;
  } else {
    // Start cooldown when releasing after use
    if (focusActive && !fHeld) {
      focusCooldown = FOCUS_COOLDOWN_FRAMES;
      focusWasUsed = true;
    }
    focusActive = false;
  }
  focusFade = focusActive ? 1.0 : max(0, focusFade - 1 / FOCUS_FADE_FRAMES);
  prevFocusKey = fHeld;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PHYSICS & COLLISION
// ═══════════════════════════════════════════════════════════════════════════════

function updatePlayer() {
  let speed = focusActive ? MOVE_SPEED * 0.3 : MOVE_SPEED;

  player.vx = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    player.vx = -speed;
    playerFacing = -1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player.vx = speed;
    playerFacing = 1;
  }

  // Afterimage trail
  let trailRate = AFTERIMAGE_SPACING;
  if (
    gameState === "play" &&
    abs(player.vx) > 0.5 &&
    frameCount % trailRate === 0
  ) {
    afterimages.push({ x: player.x, y: player.y, age: 0 });
    if (afterimages.length > AFTERIMAGE_COUNT) afterimages.shift();
  }

  player.vy += GRAVITY;
  if (player.vy > TERM_VEL) player.vy = TERM_VEL;

  // Variable jump height
  if (
    jumpHeld &&
    !keyIsDown(UP_ARROW) &&
    !keyIsDown(87) &&
    !keyIsDown(32) &&
    player.vy < 0
  ) {
    player.vy *= JUMP_CUT_MULT;
    jumpHeld = false;
  }

  // Coyote time
  if (player.onGround) {
    coyoteTimer = COYOTE_FRAMES;
    wasOnGround = true;
    canDoubleJump = false;
  } else if (wasOnGround) {
    coyoteTimer--;
    if (coyoteTimer <= 0) wasOnGround = false;
  }
  player.onGround = false;

  // Horizontal collision
  player.x += player.vx;
  for (let p of allPlats) {
    if (overlaps(player, p)) {
      player.x = player.vx > 0 ? p.x - player.w : p.x + p.w;
      player.vx = 0;
    }
  }
  player.x = constrain(player.x, 0, WORLD_W - player.w);

  // Vertical collision — static platforms + walls
  player.y += player.vy;
  for (let p of allPlats) {
    if (overlaps(player, p)) {
      if (player.vy > 0) {
        player.y = p.y - player.h;
        player.onGround = true;
      } else {
        player.y = p.y + p.h;
      }
      player.vy = 0;
    }
  }
  // Moving platforms — top-land only, skip if already grounded on static platform
  for (let mp of movingPlatforms) {
    if (!player.onGround && overlaps(player, mp) && player.vy >= 0) {
      player.y = mp.y - player.h;
      player.onGround = true;
      player.vy = 0;
    }
  }

  if (player.y > height + 200) triggerDeath();
}

function updateMovingPlatforms() {
  for (let mp of movingPlatforms) {
    let prevX = mp.x,
      prevY = mp.y;
    let t = frameCount * mp.speed * 0.02;
    if (mp.axis === "x") mp.x = mp.origin + sin(t) * mp.range;
    else mp.y = mp.origin + sin(t) * mp.range;
    mp.dx = mp.x - prevX;
    mp.dy = mp.y - prevY;
  }
  // Stick player to moving platform surface
  _mpFeet.x = player.x;
  _mpFeet.y = player.y + player.h;
  for (let mp of movingPlatforms) {
    _mpTop.x = mp.x;
    _mpTop.y = mp.y - 2;
    _mpTop.w = mp.w;
    if (player.onGround && overlaps(_mpFeet, _mpTop)) {
      player.x += mp.dx;
      player.y += mp.dy;
      // Prevent MP push from overlapping static platforms
      for (let p of allPlats) {
        if (overlaps(player, p)) {
          if (mp.dx > 0) player.x = p.x - player.w;
          else if (mp.dx < 0) player.x = p.x + p.w;
        }
      }
      break;
    }
  }
}

function updateEnemies() {
  for (let e of enemies) {
    e.x += e.speed * e.dir;
    if (e.x >= e.rightBound) {
      e.x = e.rightBound;
      e.dir = -1;
    }
    if (e.x <= e.leftBound) {
      e.x = e.leftBound;
      e.dir = 1;
    }
  }
}

function checkEnemyCollision() {
  for (let e of enemies) {
    if (overlaps(player, e)) {
      triggerDeath();
      return;
    }
  }
}

function checkTrapCollision() {
  for (let s of spikes) {
    if (overlaps(player, s)) {
      triggerDeath();
      return;
    }
  }
  for (let l of lasers) {
    let cycle = (frameCount + l.phase) % LASER_CYCLE;
    if (cycle < LASER_CYCLE * LASER_ON_FRAC && overlaps(player, l)) {
      triggerDeath();
      return;
    }
  }
}

function triggerDeath() {
  playSfx(sfxDeath, 0.6);
  deathCount++;
  deathShakeTimer = DEATH_SHAKE_FRAMES;
  deathFlashTimer = DEATH_FLASH_FRAMES;
  if (activeCheckpointIdx >= 0) {
    let cp = checkpoints[activeCheckpointIdx];
    player.x = cp.x - player.w / 2;
    player.y = cp.y - player.h;
  } else {
    player.x = 60;
    player.y = 360;
  }
  player.vx = 0;
  player.vy = 0;
  focusActive = false;
  focusFade = 0;
  prevFocusKey = false;
  focusPulseOn = false;
  focusPulseR = 0;
  focusCooldown = 0;
  focusWasUsed = false;
  afterimages = [];
  coyoteTimer = 0;
  wasOnGround = false;
  jumpHeld = false;
  canDoubleJump = false;
  darkWallX = -200;
  darkWallActive = false;
  darkWallDelay = 180; // 3 second grace period before wall can re-activate
  // Restore vision pickup so the player can collect it again after death
  if (!visionPickup) {
    let vpd = currentLevel === 3 ? LEVEL3_VISION_PICKUP
            : currentLevel === 2 ? LEVEL2_VISION_PICKUP
            : LEVEL_VISION_PICKUP;
    visionPickup = Object.assign({}, vpd);
  }
  visionBoostTimer = 0;
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════════════════════════════

function keyPressed() {
  if (gameState === "comingsoon") {
    resetGame();
    return;
  }
  if (gameState === "win") {
    if (keyCode === LEFT_ARROW || keyCode === 65) {
      winMenuSel = 0;
      return;
    }
    if (keyCode === RIGHT_ARROW || keyCode === 68) {
      winMenuSel = 1;
      return;
    }
    if (keyCode === ENTER) {
      if (winMenuSel === 0) startNextLevel();
      else resetGame();
      return;
    }
    return;
  }
  if (gameState === "start") {
    if (keyCode === DOWN_ARROW || keyCode === 83) {
      menuSelection = (menuSelection + 1) % 2;
      return;
    }
    if (keyCode === UP_ARROW || keyCode === 87) {
      menuSelection = (menuSelection + 1) % 2;
      return;
    }
    if (keyCode === ENTER || keyCode === 32) {
      if (menuSelection === 0) {
        gameState = "intro";
        introTimer = 0;
        startMusic();
      }
      return;
    }
    return;
  }
  if (keyCode === UP_ARROW || keyCode === 87 || keyCode === 32) {
    if (player.onGround || (wasOnGround && coyoteTimer > 0)) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      wasOnGround = false;
      coyoteTimer = 0;
      jumpHeld = true;
      canDoubleJump = true;
      playSfx(sfxJump, 0.45);
    } else if (canDoubleJump) {
      player.vy = DOUBLE_JUMP_FORCE;
      jumpHeld = true;
      canDoubleJump = false;
      playSfx(sfxDoubleJump, 0.35);
    }
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW || keyCode === 87 || keyCode === 32)
    jumpHeld = false;
}

function mousePressed() {
  let mx = cmx(),
    my = cmy();
  if (gameState === "start") {
    let btnW = 180,
      btnH = 34,
      btnX = width / 2 - 90,
      startBtnY = 290;
    if (
      mx >= btnX &&
      mx <= btnX + btnW &&
      my >= startBtnY &&
      my <= startBtnY + btnH
    ) {
      gameState = "intro";
      introTimer = 0;
      startMusic();
    }
    return;
  }
  if (gameState === "comingsoon") {
    resetGame();
    return;
  }
  if (gameState === "win") {
    if (
      mx >= WIN_NEXT_BTN.x &&
      mx <= WIN_NEXT_BTN.x + WIN_NEXT_BTN.w &&
      my >= WIN_NEXT_BTN.y &&
      my <= WIN_NEXT_BTN.y + WIN_NEXT_BTN.h
    ) {
      startNextLevel();
      return;
    }
    if (
      mx >= WIN_HOME_BTN.x &&
      mx <= WIN_HOME_BTN.x + WIN_HOME_BTN.w &&
      my >= WIN_HOME_BTN.y &&
      my <= WIN_HOME_BTN.y + WIN_HOME_BTN.h
    ) {
      resetGame();
      return;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════════════════════════════

function updateCamera() {
  camX = constrain(player.x - width / 3, 0, WORLD_W - width);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Parallax city skyline
// ═══════════════════════════════════════════════════════════════════════════════

function drawParallax(lowVis) {
  let dim = lowVis ? 0.14 : 0.95;
  let off1 = camX * 0.08;
  for (let b of bgLayer1) {
    let sx = b.x - off1;
    if (sx + b.w < -20 || sx > width + 20) continue;
    push();
    tint(255, 255, 255, 120 * dim);
    image(buildingImgs[b.imgIdx], sx, height - b.h, b.w, b.h);
    pop();
  }
  let off2 = camX * 0.25;
  for (let b of bgLayer2) {
    let sx = b.x - off2;
    if (sx + b.w < -20 || sx > width + 20) continue;
    push();
    tint(255, 255, 255, 180 * dim);
    image(buildingImgs[b.imgIdx], sx, height - b.h, b.w, b.h);
    pop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Particles
// ═══════════════════════════════════════════════════════════════════════════════

function updateParticles() {
  for (let r of rain) {
    r.y += r.speed;
    r.x -= r.speed * 0.12;
    if (r.y > height + 20) {
      r.y = random(-30, -10);
      r.x = random(-10, width + 40);
    }
    if (r.x < -30) r.x = width + random(10, 30);
  }
  for (let m of motes) {
    m.x += m.vx;
    m.y += m.vy;
    if (m.y < -10 || m.x < -10 || m.x > width + 10) {
      m.x = random(width);
      m.y = height + random(5, 15);
    }
  }
}

function drawParticles() {
  for (let r of rain) {
    stroke(100, 150, 240, r.alpha);
    strokeWeight(1);
    line(r.x, r.y, r.x + r.len * 0.12, r.y - r.len);
  }
  noStroke();
  for (let m of motes) {
    fill(m.pink ? color(255, 50, 150, m.alpha) : color(0, 255, 240, m.alpha));
    ellipse(m.x, m.y, m.size, m.size);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Glare & Lights
// ═══════════════════════════════════════════════════════════════════════════════

function drawLights() {
  noStroke();
  for (let l of LIGHT_SOURCES) {
    let a = map(sin(frameCount * l.speed + l.phase), -1, 1, 70, 220);
    fill(255, 245, 210, a);
    rect(l.x, l.y, l.w, l.h);
  }
}

function drawGlareZones() {
  for (let gz of GLARE_ZONES) {
    if (gz.x + gz.w < camX - 50 || gz.x > camX + width + 50) continue;
    let t = frameCount;
    for (let i = 0; i < 3; i++) {
      let pulse = 0.5 + 0.5 * sin(t * (0.04 + i * 0.012) + i * 1.3);
      let a = constrain(pulse * 35 * gz.intensity, 0, 255);
      noStroke();
      fill(255, 240, 200, a);
      let ox = gz.x + i * 40,
        ow = gz.w - i * 80;
      if (ow > 0) rect(ox, 0, ow, height);
    }
    let bandW = gz.w * 0.3;
    let bPulse = 0.4 + 0.6 * sin(t * 0.06 + gz.x * 0.01);
    fill(255, 255, 240, constrain(bPulse * 25 * gz.intensity, 0, 255));
    rect(gz.x + gz.w / 2 - bandW / 2, 0, bandW, height);
  }
}

function drawDarkZones() {
  noStroke();
  let vf = visionFloor(); // 0 = no boost, 1 = full boost
  for (let dz of DARK_ZONES) {
    let sx = dz.x - camX;
    if (sx + dz.w < 0 || sx > width) continue;
    let fadeW = 60;
    let eff = dz.intensity * (1 - vf * 0.6); // reduce by up to 60% when boosted
    fill(0, 0, 0, 255 * eff);
    rect(sx + fadeW, 0, max(0, dz.w - fadeW * 2), height);
    for (let f = 0; f < fadeW; f += 4) {
      let a = map(f, 0, fadeW, 0, 255 * eff);
      fill(0, 0, 0, a);
      rect(sx + f, 0, 4, height);
      rect(sx + dz.w - f - 4, 0, 4, height);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Neon platforms
// ═══════════════════════════════════════════════════════════════════════════════

function drawPlatformNeon(p, a, hi) {
  noStroke();
  fill(0, 255, 140, 22 * a);
  rect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
  fill(12, 45, 32, 210 * a);
  rect(p.x, p.y, p.w, p.h);
  fill(0, 255, 140, 90 * a);
  rect(p.x, p.y, p.w, 2);
  fill(0, 255, 140, 28 * a);
  rect(p.x, p.y + 2, p.w, min(5, p.h - 2));
  stroke(0, 255, 140, 230 * a);
  strokeWeight(2.5);
  line(p.x, p.y, p.x + p.w, p.y);
  stroke(0, 255, 140, 65 * a);
  strokeWeight(1);
  line(p.x, p.y, p.x, p.y + p.h);
  line(p.x + p.w, p.y, p.x + p.w, p.y + p.h);
  stroke(0, 255, 140, 30 * a);
  line(p.x, p.y + p.h, p.x + p.w, p.y + p.h);
  if (hi > 0) {
    stroke(0, 255, 240, hi * 220);
    strokeWeight(2);
    noFill();
    rect(p.x - 1, p.y - 1, p.w + 2, p.h + 2);
  }
}

function drawMovingPlatformNeon(p, a, hi) {
  noStroke();
  fill(80, 40, 255, 18 * a);
  rect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
  fill(22, 12, 55, 210 * a);
  rect(p.x, p.y, p.w, p.h);
  fill(120, 80, 255, 85 * a);
  rect(p.x, p.y, p.w, 2);
  fill(120, 80, 255, 25 * a);
  rect(p.x, p.y + 2, p.w, min(5, p.h - 2));
  stroke(120, 80, 255, 230 * a);
  strokeWeight(2.5);
  line(p.x, p.y, p.x + p.w, p.y);
  stroke(120, 80, 255, 65 * a);
  strokeWeight(1);
  line(p.x, p.y, p.x, p.y + p.h);
  line(p.x + p.w, p.y, p.x + p.w, p.y + p.h);
  stroke(120, 80, 255, 30 * a);
  line(p.x, p.y + p.h, p.x + p.w, p.y + p.h);
  if (hi > 0) {
    stroke(0, 255, 240, hi * 220);
    strokeWeight(2);
    noFill();
    rect(p.x - 1, p.y - 1, p.w + 2, p.h + 2);
  }
}

function drawPlatformsFull() {
  for (let p of platforms) drawPlatformNeon(p, 1.0, 0);
  noStroke();
}
function drawMovingPlatformsFull() {
  for (let mp of movingPlatforms) drawMovingPlatformNeon(mp, 1.0, 0);
  noStroke();
}

// ── Walls — always fully visible, pink/magenta neon (the known obstacle) ──────
function drawWallNeon(w) {
  noStroke();
  fill(255, 50, 160, 20);
  rect(w.x - 4, w.y - 4, w.w + 8, w.h + 8);
  fill(55, 10, 35, 215);
  rect(w.x, w.y, w.w, w.h);
  fill(255, 70, 170, 80);
  rect(w.x, w.y, w.w, 3); // top highlight
  fill(255, 70, 170, 35);
  rect(w.x, w.y + 3, 3, w.h - 3); // left edge glow
  fill(255, 70, 170, 35);
  rect(w.x + w.w - 3, w.y + 3, 3, w.h - 3); // right edge glow
  stroke(255, 50, 160, 240);
  strokeWeight(2.5);
  line(w.x, w.y, w.x + w.w, w.y); // top neon line
  stroke(255, 50, 160, 160);
  strokeWeight(1.5);
  line(w.x, w.y, w.x, w.y + w.h); // left neon line
  line(w.x + w.w, w.y, w.x + w.w, w.y + w.h); // right neon line
  stroke(255, 50, 160, 60);
  strokeWeight(1);
  line(w.x, w.y + w.h, w.x + w.w, w.y + w.h); // bottom
  noStroke();
}

function drawWalls() {
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let w of walls) {
    if (w.x + w.w < vL || w.x > vR) continue;
    drawWallNeon(w);
  }
  noStroke();
}

function drawWallsFull() {
  for (let w of walls) drawWallNeon(w);
  noStroke();
}

function drawPlatforms() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let p of platforms) {
    if (p.x + p.w < vL || p.x > vR) continue;
    let hi =
      focusFade > 0 && distToRect(pcx, pcy, p.x, p.y, p.w, p.h) <= FOCUS_RADIUS
        ? focusFade
        : 0;
    drawPlatformNeon(p, lerp(lerp(0.05, 0.55, visionFloor()), 1.0, hi), hi);
  }
  noStroke();
}

function drawMovingPlatforms() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  for (let mp of movingPlatforms) {
    let hi =
      focusFade > 0 &&
      distToRect(pcx, pcy, mp.x, mp.y, mp.w, mp.h) <= FOCUS_RADIUS
        ? focusFade
        : 0;
    drawMovingPlatformNeon(
      mp,
      lerp(lerp(0.05, 0.55, visionFloor()), 1.0, hi),
      hi,
    );
  }
  noStroke();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Player (Jamie sprite + neon effects)
// ═══════════════════════════════════════════════════════════════════════════════

function drawAfterimages() {
  for (let i = 0; i < afterimages.length; i++) {
    let ai = afterimages[i];
    ai.age++;
    let fade = map(ai.age, 0, 20, 50, 0);
    if (fade <= 0) {
      afterimages.splice(i, 1);
      i--;
      continue;
    }
    if (jamieIdle.length > 0) {
      let cx = ai.x + player.w / 2,
        cy = ai.y + player.h / 2;
      push();
      tint(0, 255, 240, fade * 0.6);
      imageMode(CENTER);
      if (playerFacing < 0) {
        scale(-1, 1);
        cx = -cx;
      }
      image(jamieIdle[0], cx, cy, JAMIE_DRAW_W, JAMIE_DRAW_H);
      imageMode(CORNER);
      pop();
    }
  }
}

function drawPlayer() {
  let px = player.x,
    py = player.y,
    pw = player.w,
    ph = player.h;
  let cx = px + pw / 2,
    cy = py + ph / 2;
  noStroke();
  fill(0, 255, 240, 14);
  rect(px - 5, py - 5, pw + 10, ph + 10);
  fill(0, 255, 240, 28);
  rect(px - 2, py - 2, pw + 4, ph + 4);

  // Sprite selection
  let frame = null;
  if (!player.onGround && jamieJump.length > 0) {
    let ji =
      player.vy < -4
        ? 0
        : player.vy < 0
          ? 1
          : player.vy < 2
            ? 2
            : player.vy < 6
              ? 3
              : 4;
    frame = jamieJump[min(ji, jamieJump.length - 1)];
  } else if (abs(player.vx) > 0.5 && jamieRun.length > 0) {
    frame = jamieRun[floor(frameCount / 6) % jamieRun.length];
  } else if (jamieIdle.length > 0) {
    frame = jamieIdle[floor(frameCount / JAMIE_ANIM_SPEED) % jamieIdle.length];
  }

  if (frame) {
    push();
    imageMode(CENTER);
    if (playerFacing < 0) {
      scale(-1, 1);
      image(frame, -cx, cy, JAMIE_DRAW_W, JAMIE_DRAW_H);
    } else {
      image(frame, cx, cy, JAMIE_DRAW_W, JAMIE_DRAW_H);
    }
    imageMode(CORNER);
    pop();
  } else {
    fill(16, 10, 28);
    rect(px, py, pw, ph);
    stroke(0, 255, 240, 220);
    strokeWeight(2);
    line(px + 4, py + 9, px + pw - 4, py + 9);
  }

  stroke(0, 255, 240, 35);
  strokeWeight(1);
  line(px, py, px, py + ph);
  line(px + pw, py, px + pw, py + ph);
  noStroke();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Enemies
// ═══════════════════════════════════════════════════════════════════════════════

function drawEnemyNeon(e, a, hi) {
  let ex = e.x,
    ey = e.y,
    ew = e.w,
    eh = e.h;
  let pcx = player.x + player.w / 2;
  let inAttackRange = e.type === 2 && abs(e.x + ew / 2 - pcx) < 90;

  // Pick sprite sheet and per-animation frame speed (game frames per sprite frame)
  let img, fSpeed;
  if (e.type === 2) {
    img = inAttackRange ? enemy2Imgs.attack : enemy2Imgs.walk;
    fSpeed = 12; // 200ms × 60fps ÷ 1000 = 12
    if (!img || img.width === 0) img = enemy2Imgs.idle;
  } else {
    img = enemy1Imgs.walk;
    fSpeed = 8; // 130ms × 60fps ÷ 1000 ≈ 8
    if (!img || img.width === 0) img = enemy1Imgs.idle;
  }

  if (img && img.width > 0) {
    let frameH = img.width; // square frames — same pattern as Jamie/spikes
    let numF = max(1, floor(img.height / frameH));
    let frame = floor(frameCount / fSpeed) % numF;
    push();
    tint(255, 255 * a);
    if (e.dir === -1) {
      // Flip horizontally to face left
      translate(ex + ew, ey);
      scale(-1, 1);
      image(img, 0, 0, ew, eh, 0, frame * frameH, img.width, frameH);
    } else {
      image(img, ex, ey, ew, eh, 0, frame * frameH, img.width, frameH);
    }
    noTint();
    pop();
  } else {
    // Fallback geometry if sprites not loaded
    noStroke();
    fill(255, 70, 20, 60 * a);
    rect(ex - 3, ey - 3, ew + 6, eh + 6);
    fill(55, 14, 4, 210 * a);
    rect(ex, ey, ew, eh);
    fill(255, 160, 80, 120 * a);
    rect(ex + 1, ey + 6, ew - 2, 3);
    stroke(255, 70, 20, 230 * a);
    strokeWeight(1.5);
    line(ex, ey, ex + ew, ey);
    stroke(255, 70, 20, 255 * a);
    strokeWeight(2.5);
    line(ex + 3, ey + 8, ex + ew - 3, ey + 8);
  }

  if (hi > 0) {
    noFill();
    stroke(0, 255, 240, hi * 200);
    strokeWeight(2);
    rect(ex - 1, ey - 1, ew + 2, eh + 2);
  }
  noStroke();
}

function drawEnemiesFull() {
  for (let e of enemies) drawEnemyNeon(e, 1.0, 0);
}

function drawEnemies() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let e of enemies) {
    if (e.x + e.w < vL || e.x > vR) continue;
    let hi =
      focusFade > 0 && distToRect(pcx, pcy, e.x, e.y, e.w, e.h) <= FOCUS_RADIUS
        ? focusFade
        : 0;
    drawEnemyNeon(e, lerp(lerp(0.04, 0.5, visionFloor()), 1.0, hi), hi);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Traps
// ═══════════════════════════════════════════════════════════════════════════════

function drawSpikes() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let i = 0; i < spikes.length; i++) {
    let s = spikes[i];
    if (s.x + s.w < vL || s.x > vR) continue;
    let hi =
      focusFade > 0 && distToRect(pcx, pcy, s.x, s.y, s.w, s.h) <= FOCUS_RADIUS
        ? focusFade
        : 0;
    let a = lerp(0.04, 1.0, hi);

    if (spikeImgs.length === 2) {
      // Alternate between Spike_1 and Spike_2 for visual variety; animate at 150ms ≈ 9 frames
      let img = spikeImgs[i % 2];
      let frameH = img.width; // frames are square
      let numF = max(1, floor(img.height / frameH));
      let frame = floor(frameCount / 9) % numF;
      tint(255, 255 * a);
      image(img, s.x, s.y, s.w, s.h, 0, frame * frameH, img.width, frameH);
      noTint();
    } else {
      // Fallback geometry if sprites not loaded
      let cx = s.x + s.w / 2;
      noStroke();
      fill(255, 80, 40, 22 * a);
      triangle(
        cx,
        s.y - 2,
        s.x - 2,
        s.y + s.h + 2,
        s.x + s.w + 2,
        s.y + s.h + 2,
      );
      fill(80, 20, 10, 210 * a);
      triangle(cx, s.y, s.x, s.y + s.h, s.x + s.w, s.y + s.h);
      stroke(255, 120, 40, 190 * a);
      strokeWeight(1.5);
      line(s.x, s.y + s.h, cx, s.y);
      line(cx, s.y, s.x + s.w, s.y + s.h);
    }

    // Cyan echolocation outline drawn on top of sprite
    if (hi > 0) {
      let cx = s.x + s.w / 2;
      stroke(0, 255, 240, hi * 180);
      strokeWeight(1);
      line(s.x, s.y + s.h, cx, s.y);
      line(cx, s.y, s.x + s.w, s.y + s.h);
      noStroke();
    }
  }
}

function drawLasers() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let l of lasers) {
    if (l.x + l.w < vL || l.x > vR) continue;
    let cycle = (frameCount + l.phase) % LASER_CYCLE;
    let isOn = cycle < LASER_CYCLE * LASER_ON_FRAC;
    let hi =
      focusFade > 0 && distToRect(pcx, pcy, l.x, l.y, l.w, l.h) <= FOCUS_RADIUS
        ? focusFade
        : 0;
    let vis = lerp(0.06, 1.0, hi);
    let vertical = l.h > l.w;
    if (isOn) {
      let flicker = 0.7 + 0.3 * sin(frameCount * 0.5);
      noStroke();
      if (vertical) {
        fill(255, 20, 60, 10 * vis);
        rect(l.x - 14, l.y - 8, l.w + 28, l.h + 16);
        fill(255, 40, 80, 25 * vis);
        rect(l.x - 8, l.y - 4, l.w + 16, l.h + 8);
        fill(255, 20, 60, 18 * vis);
        rect(l.x - 6, l.y - 2, l.w + 12, l.h + 4);
        fill(255, 40, 80, 230 * vis * flicker);
        rect(l.x, l.y, l.w, l.h);
        fill(255, 220, 200, 140 * vis * flicker);
        rect(l.x + 1, l.y, 2, l.h);
      } else {
        fill(255, 20, 60, 10 * vis);
        rect(l.x - 8, l.y - 14, l.w + 16, l.h + 28);
        fill(255, 40, 80, 25 * vis);
        rect(l.x - 4, l.y - 8, l.w + 8, l.h + 16);
        fill(255, 20, 60, 18 * vis);
        rect(l.x - 2, l.y - 6, l.w + 4, l.h + 12);
        fill(255, 40, 80, 230 * vis * flicker);
        rect(l.x, l.y, l.w, l.h);
        fill(255, 220, 200, 140 * vis * flicker);
        rect(l.x, l.y + 1, l.w, 2);
      }
    } else {
      let dotA = (cycle / (LASER_CYCLE * (1 - LASER_ON_FRAC))) * 120 * vis;
      noStroke();
      fill(255, 40, 80, dotA);
      if (vertical) {
        ellipse(l.x + 2, l.y + 3, 5, 5);
        ellipse(l.x + 2, l.y + l.h - 3, 5, 5);
        stroke(255, 40, 80, dotA * 0.3);
        strokeWeight(1);
        for (let dy = 0; dy < l.h; dy += 12)
          line(l.x + 2, l.y + dy, l.x + 2, l.y + min(dy + 5, l.h));
      } else {
        ellipse(l.x + 3, l.y + 2, 5, 5);
        ellipse(l.x + l.w - 3, l.y + 2, 5, 5);
        stroke(255, 40, 80, dotA * 0.3);
        strokeWeight(1);
        for (let dx = 0; dx < l.w; dx += 12)
          line(l.x + dx, l.y + 2, l.x + min(dx + 5, l.w), l.y + 2);
      }
      noStroke();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Danger warning
// ═══════════════════════════════════════════════════════════════════════════════

function drawDangerWarning() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let closestDist = Infinity;
  for (let e of enemies) {
    let d = distToRect(pcx, pcy, e.x, e.y, e.w, e.h);
    if (d < closestDist) closestDist = d;
  }
  if (closestDist < 150) {
    let intensity = constrain(map(closestDist, 150, 30, 0, 1), 0, 1);
    let a = intensity * (0.6 + 0.4 * sin(frameCount * 0.15)) * 55;
    let ctx = drawingContext;
    let g = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.25,
      width / 2,
      height / 2,
      height * 0.75,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(255,20,60," + (a / 255).toFixed(3) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Goal (portal)
// ═══════════════════════════════════════════════════════════════════════════════

function drawPortalVFX(cx, cy, rx, ry, intensity) {
  let t = frameCount;
  noStroke();
  for (let i = 3; i >= 1; i--) {
    fill(80, 30, 180, 18 * i * intensity);
    ellipse(cx, cy, (rx + 18 * i) * 2, (ry + 11 * i) * 2);
  }
  let drift = 0.5 + 0.5 * sin(t * 0.04);
  fill(
    lerp(0, 80, drift),
    lerp(200, 40, drift),
    lerp(220, 255, drift),
    40 * intensity,
  );
  ellipse(cx, cy, rx * 2, ry * 2);
  for (let ly = cy - ry + 5; ly < cy + ry - 3; ly += 7) {
    let span = sqrt(max(0, 1 - sq((ly - cy) / ry))) * rx * 0.88;
    stroke(
      0,
      255,
      240,
      28 * (0.4 + 0.6 * sin(t * 0.13 + ly * 0.22)) * intensity,
    );
    strokeWeight(1);
    line(cx - span, ly, cx + span, ly);
  }
  noStroke();
  for (let i = 0; i < 5; i++) {
    let angle = t * 0.038 + (i * TWO_PI) / 5;
    fill(0, 255, 240, 190 * intensity);
    ellipse(cx + cos(angle) * (rx + 4), cy + sin(angle) * (ry + 3), 3.5, 3.5);
  }
  let pulse = 0.8 + 0.2 * sin(t * 0.09);
  stroke(0, 255, 240, 210 * pulse * intensity);
  strokeWeight(2.5);
  noFill();
  ellipse(cx, cy, rx * 2, ry * 2);
  stroke(160, 50, 255, 140 * pulse * intensity);
  strokeWeight(1.5);
  ellipse(cx, cy, (rx + 4) * 2, (ry + 3) * 2);
  for (let step = 0; step < 5; step++) {
    let ly = cy - ry - 4 - step * 7,
      prog = step / 4;
    stroke(0, 255, 240, lerp(55, 0, prog) * intensity);
    strokeWeight(1);
    line(cx - lerp(rx * 0.28, 0, prog), ly, cx + lerp(rx * 0.28, 0, prog), ly);
  }
  noStroke();
  for (let i = 1; i <= 3; i++) {
    fill(0, 255, 240, lerp(18, 4, i / 3) * intensity);
    ellipse(cx, cy + ry + i * 5, rx * lerp(1.6, 0.4, i / 3), 4);
  }
  noStroke();
}

function drawGoalFull() {
  drawGoalNeon(1.0, 0);
}

function drawGoalNeon(a, hi) {
  let cx = goal.x + goal.w / 2,
    cy = goal.y + goal.h / 2;
  drawPortalVFX(cx, cy, goal.w / 2, goal.h / 2, a);
  if (hi > 0) {
    stroke(0, 255, 240, hi * 180);
    strokeWeight(2);
    noFill();
    ellipse(cx, cy, (goal.w / 2 + 7) * 2, (goal.h / 2 + 6) * 2);
    noStroke();
  }
}

function drawGoal() {
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let hi =
    focusFade > 0 &&
    distToRect(pcx, pcy, goal.x, goal.y, goal.w, goal.h) <= FOCUS_RADIUS
      ? focusFade
      : 0;
  drawGoalNeon(lerp(0.2, 1.0, hi), hi);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Focus pulse + indicator
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
//  ECHOLOCATION HIGHLIGHT PASS
//  Drawn AFTER every overlay (dark zones, noise, vignette) so highlights are
//  always visible regardless of how hostile the background is.
// ═══════════════════════════════════════════════════════════════════════════════

function drawEchoHighlights() {
  // Always draw the focus pulse + indicator on top of overlays
  push();
  translate(-camX, 0);
  drawFocusPulse();
  drawFocusIndicator();
  pop();

  // Object outlines only active while scan is fading
  if (focusFade <= 0) return;

  let hi = focusFade;
  let pcx = player.x + player.w / 2,
    pcy = player.y + player.h / 2;
  let vL = camX - 50,
    vR = camX + width + 50;

  push();
  translate(-camX, 0);

  // ── Platforms — green neon outline ──────────────────────────────────────────
  for (let p of platforms) {
    if (p.x + p.w < vL || p.x > vR) continue;
    if (distToRect(pcx, pcy, p.x, p.y, p.w, p.h) > FOCUS_RADIUS) continue;
    noFill();
    stroke(0, 255, 140, hi * 55);
    strokeWeight(12);
    rect(p.x, p.y, p.w, p.h);
    stroke(0, 255, 140, hi * 180);
    strokeWeight(2);
    rect(p.x, p.y, p.w, p.h);
    // Extra-bright top edge — the surface you land on
    stroke(0, 255, 240, hi * 255);
    strokeWeight(3);
    line(p.x, p.y, p.x + p.w, p.y);
    stroke(0, 255, 240, hi * 80);
    strokeWeight(8);
    line(p.x, p.y, p.x + p.w, p.y);
  }

  // ── Moving platforms — purple neon outline ───────────────────────────────────
  for (let mp of movingPlatforms) {
    if (distToRect(pcx, pcy, mp.x, mp.y, mp.w, mp.h) > FOCUS_RADIUS) continue;
    noFill();
    stroke(120, 80, 255, hi * 55);
    strokeWeight(12);
    rect(mp.x, mp.y, mp.w, mp.h);
    stroke(120, 80, 255, hi * 180);
    strokeWeight(2);
    rect(mp.x, mp.y, mp.w, mp.h);
    stroke(0, 255, 240, hi * 255);
    strokeWeight(3);
    line(mp.x, mp.y, mp.x + mp.w, mp.y);
    stroke(0, 255, 240, hi * 80);
    strokeWeight(8);
    line(mp.x, mp.y, mp.x + mp.w, mp.y);
  }

  // ── Enemies — red danger outline + crosshair ─────────────────────────────────
  for (let e of enemies) {
    if (e.x + e.w < vL || e.x > vR) continue;
    if (distToRect(pcx, pcy, e.x, e.y, e.w, e.h) > FOCUS_RADIUS) continue;
    noFill();
    stroke(255, 30, 20, hi * 90);
    strokeWeight(16);
    rect(e.x - 2, e.y - 2, e.w + 4, e.h + 4);
    stroke(255, 60, 20, hi * 255);
    strokeWeight(2);
    rect(e.x, e.y, e.w, e.h);
    // Crosshair to flag the threat centre
    let ecx = e.x + e.w / 2,
      ecy = e.y + e.h / 2;
    stroke(255, 60, 20, hi * 200);
    strokeWeight(1.5);
    line(ecx - 10, ecy, ecx + 10, ecy);
    line(ecx, ecy - 10, ecx, ecy + 10);
  }

  // ── Spikes — orange triangle outline ─────────────────────────────────────────
  for (let s of spikes) {
    if (s.x + s.w < vL || s.x > vR) continue;
    if (distToRect(pcx, pcy, s.x, s.y, s.w, s.h) > FOCUS_RADIUS) continue;
    let scx = s.x + s.w / 2;
    noFill();
    stroke(255, 120, 0, hi * 80);
    strokeWeight(10);
    triangle(scx, s.y, s.x, s.y + s.h, s.x + s.w, s.y + s.h);
    stroke(255, 180, 40, hi * 255);
    strokeWeight(2);
    triangle(scx, s.y, s.x, s.y + s.h, s.x + s.w, s.y + s.h);
  }

  // ── Lasers — hot-red beam highlight ──────────────────────────────────────────
  for (let l of lasers) {
    if (l.x + l.w < vL || l.x > vR) continue;
    if (distToRect(pcx, pcy, l.x, l.y, l.w, l.h) > FOCUS_RADIUS) continue;
    let isOn =
      (frameCount + l.phase) % LASER_CYCLE < LASER_CYCLE * LASER_ON_FRAC;
    let lAlpha = isOn ? 255 : 140;
    stroke(255, 30, 70, hi * lAlpha * 0.35);
    strokeWeight(14);
    line(l.x, l.y + 2, l.x + l.w, l.y + 2);
    stroke(255, 30, 70, hi * lAlpha);
    strokeWeight(isOn ? 4 : 2);
    line(l.x, l.y + 2, l.x + l.w, l.y + 2);
    // End-cap emitters
    noStroke();
    fill(255, 30, 70, hi * lAlpha);
    ellipse(l.x + 3, l.y + 2, 6, 6);
    ellipse(l.x + l.w - 3, l.y + 2, 6, 6);
  }

  // ── Goal — cyan pulse ring ────────────────────────────────────────────────────
  if (distToRect(pcx, pcy, goal.x, goal.y, goal.w, goal.h) <= FOCUS_RADIUS) {
    let gcx = goal.x + goal.w / 2,
      gcy = goal.y + goal.h / 2;
    noFill();
    stroke(0, 255, 240, hi * 70);
    strokeWeight(14);
    ellipse(gcx, gcy, goal.w + 20, goal.h + 16);
    stroke(0, 255, 240, hi * 230);
    strokeWeight(2.5);
    ellipse(gcx, gcy, goal.w + 20, goal.h + 16);
  }

  // ── Checkpoints — teal outline ────────────────────────────────────────────────
  for (let cp of checkpoints) {
    if (cp.x + cp.w < vL || cp.x > vR) continue;
    if (distToRect(pcx, pcy, cp.x, cp.y, cp.w, cp.h) > FOCUS_RADIUS) continue;
    noFill();
    stroke(0, 255, 240, hi * 50);
    strokeWeight(8);
    rect(cp.x - 1, cp.y - 1, cp.w + 2, cp.h + 2);
    stroke(0, 255, 240, hi * 200);
    strokeWeight(1.5);
    rect(cp.x - 1, cp.y - 1, cp.w + 2, cp.h + 2);
  }

  // ── Vision pickup — bright green beacon ──────────────────────────────────────
  if (visionPickup) {
    let vp = visionPickup;
    if (distToRect(pcx, pcy, vp.x, vp.y, vp.w, vp.h) <= FOCUS_RADIUS) {
      let vcx = vp.x + vp.w / 2,
        vcy = vp.y + vp.h / 2;
      noFill();
      stroke(0, 255, 200, hi * 60);
      strokeWeight(14);
      ellipse(vcx, vcy, 36, 36);
      stroke(0, 255, 200, hi * 230);
      strokeWeight(2);
      ellipse(vcx, vcy, 36, 36);
    }
  }

  noStroke();
  pop();
}

function drawFocusPulse() {
  if (!focusPulseOn) return;
  focusPulseR += 10;
  let maxR = FOCUS_RADIUS + 30;
  let alpha = map(focusPulseR, 0, maxR, 200, 0);
  if (alpha <= 0) {
    focusPulseOn = false;
    return;
  }
  let cx = player.x + player.w / 2,
    cy = player.y + player.h / 2;
  noFill();
  stroke(0, 255, 240, alpha);
  strokeWeight(2.5);
  ellipse(cx, cy, focusPulseR * 2, focusPulseR * 2);
  if (focusPulseR > 18) {
    stroke(0, 255, 240, alpha * 0.3);
    strokeWeight(1);
    ellipse(cx, cy, (focusPulseR - 18) * 2, (focusPulseR - 18) * 2);
  }
  noStroke();
}

function drawFocusIndicator() {
  let cx = player.x + player.w / 2;
  let cy = player.y + player.h + 12;
  let canFocus = player.onGround && abs(player.vx) < 0.5 && focusCooldown <= 0;
  noStroke();
  if (focusActive) {
    let pulse = 0.7 + 0.3 * sin(frameCount * 0.15);
    fill(0, 255, 240, 50 * pulse);
    ellipse(cx, cy, 18, 18);
    fill(0, 255, 240);
    ellipse(cx, cy, 7, 7);
  } else if (focusCooldown > 0) {
    // Cooldown arc indicator
    let progress = 1 - focusCooldown / FOCUS_COOLDOWN_FRAMES;
    fill(45, 40, 60, 120);
    ellipse(cx, cy, 14, 14);
    // Draw arc showing cooldown progress
    stroke(0, 255, 240, 140);
    strokeWeight(2);
    noFill();
    arc(cx, cy, 14, 14, -HALF_PI, -HALF_PI + TWO_PI * progress);
    noStroke();
    fill(80, 70, 100, 180);
    ellipse(cx, cy, 4, 4);
  } else if (canFocus) {
    fill(0, 255, 240, 35);
    ellipse(cx, cy, 14, 14);
    fill(0, 255, 240);
    ellipse(cx, cy, 6, 6);
  } else {
    fill(45, 40, 60, 120);
    ellipse(cx, cy, 8, 8);
  }
  noStroke();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — HUD
// ═══════════════════════════════════════════════════════════════════════════════

// Level 1 contextual hints — fade in/out based on player world-x
function drawLevel1Instructions() {
  // [triggerX, fadeRange, text]
  const hints = [
    [  60, 180, "← → MOVE"],
    [ 200, 200, "W / ↑  JUMP"],
    [ 700, 250, "DOUBLE TAP  ↑  TO DOUBLE JUMP"],
    [1400, 220, "DOUBLE JUMP to clear the wall!"],
    [1760, 260, "SPACE — ECHOLOCATION  (scan your surroundings)"],
    [2700, 300, "Watch out for SPIKES!"],
  ];

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  for (let [tx, fade, msg] of hints) {
    let dist = abs(player.x - tx);
    if (dist > fade) continue;
    let a = map(dist, fade, 0, 0, 200);
    // pill background
    let tw = textWidth(msg) + 24;
    noStroke();
    fill(10, 6, 18, a * 0.85);
    rect(width / 2 - tw / 2, height - 68, tw, 26, 6);
    // cyan border
    stroke(0, 220, 240, a * 0.5);
    strokeWeight(1);
    noFill();
    rect(width / 2 - tw / 2, height - 68, tw, 26, 6);
    noStroke();
    // text
    fill(0, 220, 240, a);
    textSize(12);
    text(msg, width / 2, height - 55);
  }
  textStyle(NORMAL);
  textAlign(LEFT, BASELINE);
}

function drawHUD() {
  drawProgressBar();
  // Double jump indicator — top-left
  let dx = 14,
    dy = 10,
    dw = 72,
    dh = 22;
  noStroke();
  if (canDoubleJump) {
    let pulse = 0.7 + 0.3 * sin(frameCount * 0.12);
    fill(160, 80, 255, 35 * pulse);
    rect(dx - 2, dy - 2, dw + 4, dh + 4, 5);
    fill(160, 80, 255, 50);
    rect(dx, dy, dw, dh, 4);
    stroke(160, 80, 255, 180 * pulse);
    strokeWeight(1);
    noFill();
    rect(dx, dy, dw, dh, 4);
    noStroke();
    fill(200, 160, 255, 230);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("2x JUMP", dx + dw / 2, dy + dh / 2);
  } else {
    fill(30, 25, 45, 180);
    rect(dx, dy, dw, dh, 4);
    stroke(60, 50, 80, 120);
    strokeWeight(1);
    noFill();
    rect(dx, dy, dw, dh, 4);
    noStroke();
    fill(80, 70, 100, 180);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("JUMP", dx + dw / 2, dy + dh / 2);
  }
  textStyle(NORMAL);
  textAlign(LEFT, BASELINE);

  // Death counter — top-right
  if (deathCount === 0) return;
  textAlign(RIGHT, TOP);
  noStroke();
  fill(255, 40, 100, 25);
  rect(width - 110, 8, 100, 24, 3);
  fill(255, 40, 100, 180);
  textSize(11);
  textStyle(BOLD);
  text("BREACHES: " + deathCount, width - 16, 14);
  textStyle(NORMAL);
  textAlign(LEFT, BASELINE);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISUAL — Screen-space overlays
// ═══════════════════════════════════════════════════════════════════════════════

function drawNoise() {
  let ctx = drawingContext;
  // Digital static — random bright specks that overwhelm the mid-ground
  for (let i = 0; i < 220; i++) {
    let nx = random(width),
      ny = random(height);
    let na = random(6, 28);
    let hue = random() > 0.55 ? "0,200,255" : "200,50,255";
    ctx.fillStyle = "rgba(" + hue + "," + (na / 255).toFixed(3) + ")";
    ctx.fillRect(nx | 0, ny | 0, random(1, 4) | 0, 1);
  }
  // Horizontal interference bands — brief flickers of white-ish noise
  for (let i = 0; i < 6; i++) {
    if (random() < 0.18) {
      let by = random(height),
        bh = random(1, 3);
      ctx.fillStyle =
        "rgba(160,200,255," + random(0.015, 0.055).toFixed(3) + ")";
      ctx.fillRect(0, by | 0, width, bh | 0);
    }
  }
}

function drawScanlines() {
  let ctx = drawingContext;
  ctx.fillStyle = "rgba(0,0,0,0.025)";
  for (let y = 0; y < height; y += 3) ctx.fillRect(0, y, width, 1);
}

function drawVignette() {
  let ctx = drawingContext;
  let g = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.1,
    width / 2,
    height / 2,
    height * 0.82,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.45, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RESET + UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

// Levels: 1 = "The Breach" (tutorial), 2 = "Encounter" (enemies + lasers), 3 = "The Infiltration" (moving platforms + 4-laser gauntlet)
const MAX_LEVEL = 3;
let currentLevel = 1;

function startNextLevel() {
  currentLevel++;
  if (currentLevel > MAX_LEVEL) {
    // All levels complete — show coming-soon screen then return to menu
    currentLevel = 1;
    gameState = "comingsoon";
    winTimer = 0;
    return;
  }
  _doLevelStart();
}

function _doLevelStart() {
  if (bgMusic && bgMusic.isPlaying()) bgMusic.stop();
  player.x = 60;
  player.y = 360;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  playerFacing = 1;
  initLevel();
  camX = 0;
  focusActive = false;
  focusFade = 0;
  prevFocusKey = false;
  focusPulseOn = false;
  focusPulseR = 0;
  focusFlashTimer = 0;
  focusCooldown = 0;
  focusWasUsed = false;
  deathCount = 0;
  deathShakeTimer = 0;
  deathFlashTimer = 0;
  afterimages = [];
  coyoteTimer = 0;
  wasOnGround = false;
  jumpHeld = false;
  canDoubleJump = false;
  activeCheckpointIdx = -1;
  darkWallX = -200;
  darkWallActive = false;
  winMenuSel = 0;
  gameState = "intro";
  introTimer = 0;
  winTimer = 0;
  startMusic();
}

function resetGame() {
  if (bgMusic && bgMusic.isPlaying()) bgMusic.stop();
  if (sfxDeath && sfxDeath.isPlaying()) sfxDeath.stop();
  if (sfxGoal && sfxGoal.isPlaying()) sfxGoal.stop();
  if (sfxFocus && sfxFocus.isPlaying()) sfxFocus.stop();
  currentLevel = 1;
  player.x = 60;
  player.y = 360;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  playerFacing = 1;
  initLevel();
  camX = 0;
  focusActive = false;
  focusFade = 0;
  prevFocusKey = false;
  focusPulseOn = false;
  focusPulseR = 0;
  focusFlashTimer = 0;
  focusCooldown = 0;
  focusWasUsed = false;
  deathCount = 0;
  deathShakeTimer = 0;
  deathFlashTimer = 0;
  afterimages = [];
  coyoteTimer = 0;
  wasOnGround = false;
  jumpHeld = false;
  canDoubleJump = false;
  activeCheckpointIdx = -1;
  darkWallX = -200;
  darkWallActive = false;
  menuSelection = 0;
  winMenuSel = 0;
  gameState = "start";
  introTimer = 0;
  winTimer = 0;
}

function playSfx(snd, vol) {
  if (!snd) return;
  if (snd.isPlaying()) snd.stop();
  snd.setVolume(vol);
  snd.play();
}

function startMusic() {
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.setVolume(0.33);
    bgMusic.loop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CHECKPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

function updateCheckpoints() {
  for (let i = 0; i < checkpoints.length; i++) {
    let cp = checkpoints[i];
    if (!cp.activated && overlaps(player, cp)) {
      cp.activated = true;
      activeCheckpointIdx = i;
      cpPulseTimers[i] = 90; // extended pulse for more charm
      playSfx(sfxFocus, 0.45);
    }
    if (cpPulseTimers[i] > 0) cpPulseTimers[i]--;
  }
}

function drawCheckpoints() {
  let vL = camX - 50,
    vR = camX + width + 50;
  for (let i = 0; i < checkpoints.length; i++) {
    let cp = checkpoints[i];
    if (cp.x + cp.w < vL || cp.x > vR) continue;
    let baseA = cp.activated ? 1.0 : 0.45;

    // Sprite rendering
    if (checkpointImg && checkpointImg.width > 0) {
      let frameH = checkpointImg.width;
      let numF = max(1, floor(checkpointImg.height / frameH));
      let frame = floor(frameCount / 10) % numF; // 160ms at 60fps = 10 frames
      push();
      tint(255, 255 * baseA);
      image(
        checkpointImg,
        cp.x,
        cp.y,
        cp.w,
        cp.h,
        0,
        frame * frameH,
        checkpointImg.width,
        frameH,
      );
      noTint();
      pop();
    } else {
      // Fallback geometry
      noStroke();
      fill(80, 200, 220, 180 * baseA);
      rect(cp.x, cp.y, cp.w, cp.h);
    }

    // Activation pulse — three staggered expanding rings + floating "+SAVED" text
    if (cpPulseTimers[i] > 0) {
      let t = cpPulseTimers[i];
      let cx = cp.x + cp.w / 2, cy = cp.y + cp.h / 2;
      noFill();
      // Ring 1 (first to expand)
      let r1 = map(t, 90, 0, 0, 80);
      let a1 = map(t, 90, 50, 220, 0);
      if (a1 > 0) { stroke(0, 255, 240, a1); strokeWeight(2); ellipse(cx, cy, r1 * 2, r1 * 2); }
      // Ring 2 (delayed)
      let r2 = map(t, 75, 0, 0, 80);
      let a2 = map(t, 75, 30, 200, 0);
      if (t < 75 && a2 > 0) { stroke(0, 200, 255, a2); strokeWeight(1.5); ellipse(cx, cy, r2 * 2, r2 * 2); }
      // Ring 3 (most delayed)
      let r3 = map(t, 55, 0, 0, 60);
      let a3 = map(t, 55, 10, 160, 0);
      if (t < 55 && a3 > 0) { stroke(160, 80, 255, a3); strokeWeight(1); ellipse(cx, cy, r3 * 2, r3 * 2); }
      noStroke();
      // Floating "+SAVED" text
      let ta = map(t, 90, 60, 0, 230);
      let ty = cy - map(t, 90, 0, 0, 40);
      fill(0, 255, 240, constrain(ta, 0, 230));
      textAlign(CENTER, CENTER);
      textSize(11);
      textStyle(BOLD);
      text("+SAVED", cx, ty);
      textStyle(NORMAL);
      textAlign(LEFT, BASELINE);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VISION POWER-UP
// ═══════════════════════════════════════════════════════════════════════════════

function visionFloor() {
  if (visionBoostTimer <= 0) return 0;
  if (visionBoostTimer > VISION_FADE_FRAMES) return 1.0;
  return visionBoostTimer / VISION_FADE_FRAMES;
}

function updateVisionPickup() {
  if (visionBoostTimer > 0) visionBoostTimer--;
  if (visionPickup && overlaps(player, visionPickup)) {
    visionPickup = null;
    visionBoostTimer = VISION_BOOST_FRAMES;
    playSfx(sfxFocus, 0.55);
  }
}

function drawVisionPickup() {
  if (!visionPickup) return;
  let vp = visionPickup;
  if (vp.x + vp.w < camX - 50 || vp.x > camX + width + 50) return;
  let cx = vp.x + vp.w / 2,
    cy = vp.y + vp.h / 2;
  let pulse = 0.6 + 0.4 * sin(frameCount * 0.1);
  push();
  translate(cx, cy);
  rotate(frameCount * 0.03);
  noStroke();
  fill(0, 255, 200, 40 * pulse);
  rect(-vp.w / 2 - 4, -vp.h / 2 - 4, vp.w + 8, vp.h + 8);
  fill(0, 220, 180, 200);
  beginShape();
  vertex(0, -vp.h / 2);
  vertex(vp.w / 2, 0);
  vertex(0, vp.h / 2);
  vertex(-vp.w / 2, 0);
  endShape(CLOSE);
  fill(180, 255, 240, 220 * pulse);
  beginShape();
  vertex(0, -vp.h / 4);
  vertex(vp.w / 4, 0);
  vertex(0, vp.h / 4);
  vertex(-vp.w / 4, 0);
  endShape(CLOSE);
  pop();
  noStroke();
  fill(0, 255, 200, 18 * pulse);
  rect(cx - 3, cy - vp.h * 2, 6, vp.h * 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DARKNESS WALL
// ═══════════════════════════════════════════════════════════════════════════════

function updateDarkWall() {
  if (darkWallDelay > 0) { darkWallDelay--; return; }
  if (!darkWallActive && player.x >= darkWallTriggerX) {
    darkWallActive = true;
    darkWallX = player.x - 300;
  }
  if (!darkWallActive) return;
  darkWallX += DARK_WALL_SPEED;
  if (player.x + player.w < darkWallX - 10) triggerDeath();
}

function drawDarkWall() {
  if (!darkWallActive) return;
  let sx = darkWallX - camX;
  if (sx > width) return;
  noStroke();
  fill(0, 0, 0, 240);
  rect(0, 0, min(sx, width), height);
  for (let i = 0; i < 40; i++) {
    let ex = sx + i;
    if (ex < 0 || ex > width) continue;
    fill(0, 0, 0, map(i, 0, 40, 210, 0));
    rect(ex, 0, 1, height);
  }
  if (sx >= -6 && sx <= width + 6) {
    noStroke();
    fill(255, 20, 60, 120);
    rect(sx - 2, 0, 4, height);
    fill(255, 80, 40, 60);
    rect(sx - 6, 0, 6, height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════

function drawProgressBar() {
  let barW = 300,
    barH = 6,
    barX = width / 2 - barW / 2,
    barY = 8;
  let progress = constrain(player.x / (WORLD_W - player.w), 0, 1);
  noStroke();
  fill(20, 16, 35, 200);
  rect(barX - 2, barY - 2, barW + 4, barH + 4, 3);
  fill(35, 28, 55, 180);
  rect(barX, barY, barW, barH, 2);
  let pulse = 0.85 + 0.15 * sin(frameCount * 0.08);
  fill(0, 255, 240, 200 * pulse);
  rect(barX, barY, barW * progress, barH, 2);
  if (progress > 0.01) {
    fill(255, 255, 255, 180 * pulse);
    rect(barX + barW * progress - 2, barY, 2, barH);
  }
  for (let cp of LEVEL_CHECKPOINTS) {
    let tx = barX + (cp.x / WORLD_W) * barW;
    fill(0, 255, 240, 160);
    rect(tx - 1, barY - 1, 2, barH + 2);
  }
  stroke(0, 255, 240, 80);
  strokeWeight(1);
  noFill();
  rect(barX, barY, barW, barH, 2);
  noStroke();
}

function distToRect(px, py, rx, ry, rw, rh) {
  let dx = max(rx - px, 0, px - (rx + rw));
  let dy = max(ry - py, 0, py - (ry + rh));
  return sqrt(dx * dx + dy * dy);
}
