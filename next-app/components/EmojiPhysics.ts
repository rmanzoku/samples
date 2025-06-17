import type Matter from "matter-js";

export const TIERS = [
  "\uD83E\uDE99", // 🪙
  "\uD83D\uDCB5", // 💵
  "\uD83D\uDCB3", // 💳
  "\uD83D\uDC8D", // 💍
  "\uD83D\uDCFF", // 📿
  "\uD83E\uDD47", // 🥇
  "\uD83D\uDCB0", // 💰
  "\uD83D\uDC8E", // 💎
  "\uD83C\uDF1F", // 🌟
];

export interface PhysicsHandle {
  drop: (tier: number, x: number) => void;
  update: () => void;
  getHeight: () => number;
  cleanup: () => void;
  start: () => void;
}

export async function createEmojiPhysics(
  container: HTMLElement,
  onMerge: (tier: number) => void,
  onGameOver: () => void
): Promise<PhysicsHandle> {
  const Matter: typeof import("matter-js") = await import("matter-js");
  const { Engine, World, Bodies, Body, Runner, Events, Vector } = Matter;
  const engine = Engine.create();
  const runner = Runner.create();
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const walls = [
    Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true }),
    Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true }),
    Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true }),
    Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true }),
  ];
  World.add(engine.world, walls);

  interface EmojiBody {
    body: Matter.Body & { tier: number };
    el: HTMLSpanElement;
    tier: number;
  }

  const bodies: EmojiBody[] = [];
  let overFrames = 0;

  function makeEl(tier: number) {
    const el = document.createElement("span");
    el.className = "emoji";
    el.textContent = TIERS[tier];
    el.style.fontSize = `${tierRadius(tier) * 2}px`;
    container.appendChild(el);
    return el;
  }

  function drop(tier: number, x: number) {
    const r = tierRadius(tier);
    const body = Bodies.circle(x, r, r, { restitution: 0.2, friction: 0.1 });
    // give a nudge so the piece immediately falls, preventing a quick
    // game-over when tapping rapidly
    Body.setVelocity(body, { x: 0, y: 5 });
    const typed = body as Matter.Body & { tier: number };
    typed.tier = tier;
    const el = makeEl(tier);
    el.style.left = `${x}px`;
    el.style.top = `${r}px`;
    bodies.push({ body: typed, el, tier });
    World.add(engine.world, body);
  }

  function remove(eb: EmojiBody) {
    World.remove(engine.world, eb.body);
    container.removeChild(eb.el);
    bodies.splice(bodies.indexOf(eb), 1);
  }

  function spawn(tier: number, x: number, y: number) {
    const r = tierRadius(tier);
    const body = Bodies.circle(x, y, r, { restitution: 0.2, friction: 0.1 });
    const typed = body as Matter.Body & { tier: number };
    typed.tier = tier;
    const el = makeEl(tier);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    bodies.push({ body: typed, el, tier });
    World.add(engine.world, body);
  }

  function merge(a: EmojiBody, b: EmojiBody) {
    const tier = Math.min(a.tier + 1, TIERS.length - 1);
    const x = (a.body.position.x + b.body.position.x) / 2;
    const y = (a.body.position.y + b.body.position.y) / 2;
    remove(a);
    remove(b);
    if (tier === 8) {
      for (const other of [...bodies]) {
        const dist = Vector.magnitude({
          x: other.body.position.x - x,
          y: other.body.position.y - y,
        });
        if (dist < 80) remove(other);
      }
    }
    spawn(tier, x, y);
    onMerge(tier);
  }

  const MERGE_SPEED = 1.5;
  const MERGE_FRAMES = 3;
  const mergeTimers = new Map<string, number>();

  function pairKey(a: Matter.Body, b: Matter.Body) {
    return a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
  }

  Events.on(engine, "collisionActive", (e) => {
    const processed = new Set<Matter.Body>();
    for (const pair of e.pairs) {
      const A = pair.bodyA as Matter.Body & { tier?: number };
      const B = pair.bodyB as Matter.Body & { tier?: number };
      if (A.tier === undefined || B.tier === undefined) continue;
      if (A.tier !== B.tier) continue;
      if (A.tier === 8) continue; // Super Crystals cannot merge
      if (processed.has(A) || processed.has(B)) continue;
      const speed = Math.hypot(
        A.velocity.x - B.velocity.x,
        A.velocity.y - B.velocity.y
      );
      const key = pairKey(A, B);
      if (speed < MERGE_SPEED) {
        const time = mergeTimers.get(key) ?? 0;
        mergeTimers.set(key, time + 1);
        if (time + 1 >= MERGE_FRAMES) {
          const ea = bodies.find((b) => b.body === A);
          const eb = bodies.find((b) => b.body === B);
          if (ea && eb) {
            merge(ea, eb);
            processed.add(A);
            processed.add(B);
          }
          mergeTimers.delete(key);
        }
      } else {
        mergeTimers.delete(key);
      }
    }
  });

  Events.on(engine, "collisionEnd", (e) => {
    for (const pair of e.pairs) {
      mergeTimers.delete(pairKey(pair.bodyA, pair.bodyB));
    }
  });

  function update() {
    for (const eb of bodies) {
      eb.el.style.left = `${eb.body.position.x}px`;
      eb.el.style.top = `${eb.body.position.y}px`;
    }
  }

  function getHeight(): number {
    if (!bodies.length) return 0;
    const top = Math.min(
      ...bodies.map((b) => b.body.position.y - tierRadius(b.tier))
    );
    return (height - top) / height;
  }

  function checkOver() {
    if (!bodies.length) {
      overFrames = 0;
      return;
    }
    let touchingTop = false;
    for (const b of bodies) {
      if (
        b.body.position.y - tierRadius(b.tier) <= 0 &&
        Math.abs(b.body.velocity.y) < 0.2
      ) {
        touchingTop = true;
        break;
      }
    }
    if (touchingTop) {
      overFrames++;
      if (overFrames > 10) {
        onGameOver();
      }
    } else {
      overFrames = 0;
    }
  }

  function start() {
    Runner.run(runner, engine);
    Events.on(runner, "afterTick", checkOver);
  }

  function cleanup() {
    Runner.stop(runner);
    World.clear(engine.world, false);
    Engine.clear(engine);
    for (const eb of bodies) container.removeChild(eb.el);
    bodies.length = 0;
  }

  return { drop, update, getHeight, cleanup, start };
}

export function tierRadius(tier: number) {
  const base = 14 + tier * 4;
  return tier === 8 ? base * 1.5 : base;
}

