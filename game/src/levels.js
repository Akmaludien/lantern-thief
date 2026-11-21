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
    darkness: 0.52,
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
        // North loop: stays clear of the centre wall, the book chest and
        // both shelves, so the loop actually completes.
        waypoints: [
          { x: 360, y: 120 },
          { x: 760, y: 120 },
          { x: 760, y: 460 },
          { x: 360, y: 460 },
        ],
        pause: 1.2,
      },
      {
        // South-east loop: skirts the tall wall and the south chest
        // instead of walking through them.
        waypoints: [
          { x: 620, y: 700 },
          { x: 1120, y: 700 },
          { x: 1120, y: 360 },
          { x: 620, y: 360 },
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
    darkness: 0.58,
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
        // West loop: threads the corridor west of the tall wall and the
        // low shelf, down to the south-west corner and back.
        waypoints: [
          { x: 120, y: 120 },
          { x: 280, y: 120 },
          { x: 280, y: 260 },
          { x: 170, y: 260 },
          { x: 170, y: 480 },
          { x: 120, y: 480 },
        ],
        pause: 1.0,
      },
      {
        // East loop: walks the exit door's frame instead of through the
        // door, and stays east of the south shelf.
        waypoints: [
          { x: 840, y: 220 },
          { x: 1180, y: 220 },
          { x: 1180, y: 620 },
          { x: 840, y: 620 },
        ],
        pause: 1.4,
      },
      {
        // Centre loop: between the tall wall and the centre wall, north
        // of the low wall — a tight box around the gallery's middle.
        waypoints: [
          { x: 400, y: 480 },
          { x: 700, y: 480 },
          { x: 700, y: 260 },
          { x: 400, y: 260 },
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
    darkness: 0.74,
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
        // West loop: north corridor, then down the west edge past the
        // chest and the low shelf.
        waypoints: [
          { x: 140, y: 120 },
          { x: 540, y: 120 },
          { x: 540, y: 460 },
          { x: 140, y: 460 },
        ],
        pause: 0.9,
      },
      {
        // Centre-north loop: between the two tall walls, above the
        // vault's middle wall.
        waypoints: [
          { x: 660, y: 140 },
          { x: 920, y: 140 },
          { x: 920, y: 340 },
          { x: 660, y: 340 },
        ],
        pause: 1.1,
      },
      {
        // South loop: the corridor below the low wall, between the
        // south shelf and the border.
        waypoints: [
          { x: 400, y: 680 },
          { x: 800, y: 680 },
          { x: 800, y: 740 },
          { x: 400, y: 740 },
        ],
        pause: 1.3,
      },
      {
        // East loop: down the exit side, west of the pillar, watching
        // the door without standing in it.
        waypoints: [
          { x: 920, y: 120 },
          { x: 1160, y: 120 },
          { x: 1160, y: 620 },
          { x: 920, y: 620 },
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
