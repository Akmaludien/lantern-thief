// Guards: patrols, vision cones, suspicion, chase and hearing.
// A guard patrols its waypoint loop, grows suspicious while the player is
// inside its cone with a clear line of sight, chases at full suspicion, and
// calms back to patrol when the player stays hidden. Noise also draws a
// guard's attention, but never past the point of raising the alarm alone.

// --- geometry helpers -------------------------------------------------------

function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tEnter = 0;
  let tExit = 1;
  if (dx === 0) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let a = (rect.x - x1) / dx;
    let b = (rect.x + rect.w - x1) / dx;
    if (a > b) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    tEnter = Math.max(tEnter, a);
    tExit = Math.min(tExit, b);
    if (tEnter > tExit) return false;
  }
  if (dy === 0) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let a = (rect.y - y1) / dy;
    let b = (rect.y + rect.h - y1) / dy;
    if (a > b) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    tEnter = Math.max(tEnter, a);
    tExit = Math.min(tExit, b);
    if (tEnter > tExit) return false;
  }
  return true;
}

// True when no solid rectangle stands between the two points.
export function hasLineOfSight(x1, y1, x2, y2, solids) {
  for (const rect of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

function circleHitsRect(x, y, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - closestX;
  const dy = y - closestY;
  return dx * dx + dy * dy < radius * radius;
}

// Move a circle against solid rectangles, sliding along walls.
export function slideMove(body, dx, dy, solids) {
  const nextX = body.x + dx;
  if (!solids.some((rect) => circleHitsRect(nextX, body.y, body.radius, rect))) {
    body.x = nextX;
  }
  const nextY = body.y + dy;
  if (!solids.some((rect) => circleHitsRect(body.x, nextY, body.radius, rect))) {
    body.y = nextY;
  }
}

// --- guard -----------------------------------------------------------------

export const GUARD_VIEW_RANGE = 235;
export const GUARD_HALF_ANGLE = 0.62;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_CHASE_SPEED = 205;
export const GUARD_INVESTIGATE_SPEED = 120;

export function createGuard(definition, index) {
  const start = definition.waypoints[0];
  return {
    index,
    x: start.x,
    y: start.y,
    radius: 15,
    facing: 0,
    waypointIndex: 1,
    pauseLeft: 0,
    pauseTime: definition.pause || 1,
    suspicion: 0,
    state: 'patrol', // patrol | investigate | chase | return
    chaseLeft: 0,
    unseenLeft: 0,
    investigateTarget: null,
    waypoints: definition.waypoints,
  };
}

function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function moveToward(guard, targetX, targetY, speed, seconds, solids) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const step = Math.min(distance, speed * seconds);
  const nx = dx / distance;
  const ny = dy / distance;
  guard.facing = Math.atan2(dy, dx);
  slideMove(guard, nx * step, ny * step, solids);
  return distance <= step + 1;
}

export function updateGuard(guard, seconds, world) {
  const { player, solids } = world;
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  const angleToPlayer = Math.atan2(dy, dx);

  // How far this guard can see depends on the player's lantern: lit means
  // visible from further away, unlit means harder to spot.
  const viewRange = GUARD_VIEW_RANGE * (player.lanternOn ? 1.45 : 0.78);
  const inRange = distance < viewRange;
  const inCone = Math.abs(angleDifference(angleToPlayer, guard.facing)) < GUARD_HALF_ANGLE;
  const seen = inRange && inCone && hasLineOfSight(guard.x, guard.y, player.x, player.y, solids);
  guard.seesPlayer = seen;

  if (seen) {
    // Closer and faster targets raise suspicion faster; sneaking slows it.
    const closeness = 1 - distance / viewRange;
    const rate = (26 + 58 * closeness) * (player.sneaking ? 0.55 : 1);
    guard.suspicion = Math.min(100, guard.suspicion + rate * seconds);
    guard.unseenLeft = 0;
    // Once half-sure, the guard remembers where it last saw Wick and walks
    // over to check — a patient player who breaks line of sight early is
    // never chased for a glimpse.
    if (guard.suspicion >= 55 && guard.state === 'patrol') {
      guard.investigateTarget = { x: player.x, y: player.y };
    }
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - 22 * seconds);
  }

  if (guard.suspicion >= 100 && guard.state !== 'chase') {
    guard.state = 'chase';
    guard.chaseLeft = 4.5;
    world.onAlarm(guard);
  }

  switch (guard.state) {
    case 'patrol': {
      if (guard.suspicion >= 55 && guard.investigateTarget) {
        guard.state = 'investigate';
        break;
      }
      if (guard.pauseLeft > 0) {
        guard.pauseLeft -= seconds;
        break;
      }
      const target = guard.waypoints[guard.waypointIndex];
      if (moveToward(guard, target.x, target.y, GUARD_PATROL_SPEED, seconds, solids)) {
        guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
        guard.pauseLeft = guard.pauseTime;
      }
      break;
    }
    case 'investigate': {
      const target = guard.investigateTarget;
      if (!target) {
        guard.state = 'return';
        break;
      }
      if (moveToward(guard, target.x, target.y, GUARD_INVESTIGATE_SPEED, seconds, solids)) {
        guard.investigateTarget = null;
        guard.pauseLeft = 1.2;
        guard.state = 'return';
      }
      break;
    }
    case 'chase': {
      guard.chaseLeft -= seconds;
      moveToward(guard, player.x, player.y, GUARD_CHASE_SPEED, seconds, solids);
      if (!seen) {
        guard.unseenLeft += seconds;
        if (guard.unseenLeft > 2.5 || guard.chaseLeft <= 0) {
          guard.state = 'return';
          guard.suspicion = 45;
        }
      } else {
        guard.unseenLeft = 0;
        guard.chaseLeft = Math.max(guard.chaseLeft, 1.2);
      }
      break;
    }
    case 'return': {
      // Walk back to the nearest waypoint, then resume the patrol loop.
      // returnTarget remembers a detour once one is chosen, so the guard
      // commits to it instead of retrying a blocked waypoint every frame.
      let target = guard.returnTarget;
      if (!target) {
        let nearest = guard.waypoints[0];
        let nearestDistance = Infinity;
        for (const point of guard.waypoints) {
          const d = Math.hypot(point.x - guard.x, point.y - guard.y);
          if (d < nearestDistance) {
            nearestDistance = d;
            nearest = point;
          }
        }
        target = nearest;
      }
      const beforeX = guard.x;
      const beforeY = guard.y;
      if (moveToward(guard, target.x, target.y, GUARD_PATROL_SPEED * 1.2, seconds, solids)) {
        guard.waypointIndex = guard.waypoints.indexOf(target);
        guard.returnTarget = null;
        guard.returnStuck = 0;
        guard.state = 'patrol';
        break;
      }
      // A straight line home can run into a shelf: if the guard has made no
      // progress for a while, commit to the next waypoint in the loop
      // instead — patrol legs are open by design, so the loop always
      // unblocks. Without this a guard can stall against cover.
      const moved = Math.hypot(guard.x - beforeX, guard.y - beforeY);
      guard.returnStuck = moved < 0.2 ? (guard.returnStuck || 0) + seconds : 0;
      if (guard.returnStuck > 1.5) {
        guard.returnStuck = 0;
        const nextIndex = (guard.waypoints.indexOf(target) + 1) % guard.waypoints.length;
        guard.returnTarget = guard.waypoints[nextIndex];
      }
      break;
    }
    default:
      guard.state = 'patrol';
  }

  // Caught: a chasing guard touches the player.
  if (guard.state === 'chase' && distance < guard.radius + player.radius + 2) {
    world.onCaught(guard);
  }
}

// A noise event draws every guard in earshot toward the sound.
export function alertGuardsToNoise(guards, x, y, radius) {
  for (const guard of guards) {
    if (guard.state === 'chase') continue;
    const distance = Math.hypot(guard.x - x, guard.y - y);
    if (distance < radius + 40) {
      guard.investigateTarget = { x, y };
      guard.suspicion = Math.min(guard.suspicion + 28, 70);
      if (guard.state === 'patrol' && guard.suspicion >= 45) {
        guard.state = 'investigate';
      }
    }
  }
}
