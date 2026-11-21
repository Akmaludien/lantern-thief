// The three floors of the Ember Archive.
// Each level is plain data: walls and cover block sight and movement, guards
// patrol waypoint loops, one relic waits to be stolen, and the exit stays
// locked until the relic is taken. Coordinates are canvas pixels (1280 x 800).

export const TILE = 40;
export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 800;

function borderWalls() {
  return [
    { x: 0, y: 0, w: 1280, h: 40 },
    { x: 0, y: 760, w: 1280, h: 40 },
    { x: 0, y: 0, w: 40, h: 800 },
    { x: 1240, y: 0, w: 40, h: 800 },
  ];
}

export const LEVELS = [
  {
    id: 1,
    name: 'Entrance Hall',
    subtitle: 'Learn the dark — two guards, one relic',
    relicName: 'Ember Idol',
    darkness: 0.55,
    spawn: { x: 120, y: 680 },
    exit: { x: 1180, y: 340, w: 60, h: 120 },
    relic: { x: 1120, y: 120 },
    walls: [
      ...borderWalls(),
      { x: 400, y: 200, w: 40, h: 240 },
      { x: 700, y: 480, w: 280, h: 40 },
      { x: 840, y: 120, w: 40, h: 200 },
    ],
    cover: [
      { x: 560, y: 160, w: 80, h: 60, kind: 'chest' },
      { x: 880, y: 600, w: 80, h: 60, kind: 'chest' },
      { x: 640, y: 280, w: 40, h: 40, kind: 'pillar' },
      { x: 960, y: 160, w: 120, h: 40, kind: 'shelf' },
      { x: 200, y: 420, w: 120, h: 40, kind: 'shelf' },
    ],
    guards: [
      {
        waypoints: [
          { x: 300, y: 150 },
          { x: 900, y: 150 },
          { x: 900, y: 520 },
          { x: 300, y: 520 },
        ],
        pause: 1.2,
      },
      {
        waypoints: [
          { x: 620, y: 640 },
          { x: 1080, y: 640 },
          { x: 1080, y: 320 },
          { x: 620, y: 320 },
        ],
        pause: 1.6,
      },
    ],
  },
  {
    id: 2,
    name: 'Gallery',
    subtitle: 'More shelves, more eyes — three guards, one relic',
    relicName: 'Moon Pearl',
    darkness: 0.62,
    spawn: { x: 120, y: 680 },
    exit: { x: 1180, y: 340, w: 60, h: 120 },
    relic: { x: 150, y: 120 },
    walls: [
      ...borderWalls(),
      { x: 320, y: 120, w: 40, h: 300 },
      { x: 760, y: 360, w: 40, h: 320 },
      { x: 480, y: 560, w: 320, h: 40 },
    ],
    cover: [
      { x: 200, y: 300, w: 120, h: 40, kind: 'shelf' },
      { x: 560, y: 180, w: 120, h: 40, kind: 'shelf' },
      { x: 900, y: 240, w: 120, h: 40, kind: 'shelf' },
      { x: 1040, y: 560, w: 120, h: 40, kind: 'shelf' },
      { x: 420, y: 640, w: 80, h: 60, kind: 'chest' },
      { x: 880, y: 120, w: 80, h: 60, kind: 'chest' },
      { x: 640, y: 420, w: 40, h: 40, kind: 'pillar' },
      { x: 1080, y: 400, w: 40, h: 40, kind: 'pillar' },
    ],
    guards: [
      {
        waypoints: [
          { x: 240, y: 180 },
          { x: 640, y: 180 },
          { x: 640, y: 480 },
          { x: 240, y: 480 },
        ],
        pause: 1.0,
      },
      {
        waypoints: [
          { x: 880, y: 120 },
          { x: 1160, y: 120 },
          { x: 1160, y: 620 },
          { x: 880, y: 620 },
        ],
        pause: 1.4,
      },
      {
        waypoints: [
          { x: 480, y: 660 },
          { x: 800, y: 660 },
          { x: 800, y: 300 },
          { x: 480, y: 300 },
        ],
        pause: 1.8,
      },
    ],
  },
  {
    id: 3,
    name: 'Vault',
    subtitle: 'Four guards, tight patrols, almost no light',
    relicName: 'Gilded Key',
    darkness: 0.78,
    spawn: { x: 120, y: 120 },
    exit: { x: 1180, y: 340, w: 60, h: 120 },
    relic: { x: 640, y: 400 },
    walls: [
      ...borderWalls(),
      { x: 280, y: 160, w: 40, h: 240 },
      { x: 560, y: 80, w: 40, h: 320 },
      { x: 840, y: 400, w: 40, h: 320 },
      { x: 480, y: 520, w: 360, h: 40 },
      { x: 960, y: 160, w: 40, h: 240 },
    ],
    cover: [
      { x: 200, y: 480, w: 100, h: 50, kind: 'shelf' },
      { x: 420, y: 240, w: 100, h: 50, kind: 'shelf' },
      { x: 700, y: 600, w: 100, h: 50, kind: 'shelf' },
      { x: 1000, y: 300, w: 100, h: 50, kind: 'shelf' },
      { x: 640, y: 480, w: 40, h: 40, kind: 'pillar' },
      { x: 1120, y: 640, w: 40, h: 40, kind: 'pillar' },
      { x: 180, y: 300, w: 80, h: 60, kind: 'chest' },
    ],
    guards: [
      {
        waypoints: [
          { x: 200, y: 200 },
          { x: 500, y: 200 },
          { x: 500, y: 460 },
          { x: 200, y: 460 },
        ],
        pause: 0.9,
      },
      {
        waypoints: [
          { x: 660, y: 140 },
          { x: 920, y: 140 },
          { x: 920, y: 460 },
          { x: 660, y: 460 },
        ],
        pause: 1.1,
      },
      {
        waypoints: [
          { x: 420, y: 620 },
          { x: 760, y: 620 },
          { x: 760, y: 320 },
          { x: 420, y: 320 },
        ],
        pause: 1.3,
      },
      {
        waypoints: [
          { x: 1000, y: 560 },
          { x: 1160, y: 560 },
          { x: 1160, y: 200 },
          { x: 1000, y: 200 },
        ],
        pause: 1.0,
      },
    ],
  },
];

// Rectangles that block both movement and line of sight.
export function solidRects(level) {
  return [...level.walls, ...level.cover];
}
