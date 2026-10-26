"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

// A tiny homage to The Knight: run, jump, collect the four brand-colour gems.
// Coyote time and jump buffering are in, because that's what makes a jump feel right.

const W = 480;
const H = 270;
const TILE = 16;
const GRAVITY = 0.42;
const SPEED = 2.1;
const JUMP = -7.2;

// x, y, w, h in tiles
const SOLIDS = [
  [0, 15, 14, 2],
  [17, 15, 10, 2],
  [30, 15, 20, 2],
  [53, 15, 18, 2],
  [9, 11, 4, 1],
  [22, 10, 4, 1],
  [36, 11, 3, 1],
  [42, 8, 4, 1],
  [58, 10, 4, 1],
  [70, 12, 1, 3],
].map(([x, y, w, h]) => ({ x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE }));

const GEMS = [
  { x: 11, y: 9, c: "#4285f4" },
  { x: 24, y: 8, c: "#ea4335" },
  { x: 44, y: 6, c: "#fbbc04" },
  { x: 60, y: 8, c: "#34a853" },
].map((g) => ({ x: g.x * TILE + 4, y: g.y * TILE + 4, c: g.c }));

const WORLD_W = 71 * TILE;

type State = { x: number; y: number; vx: number; vy: number; ground: boolean; coyote: number; buffer: number; face: 1 | -1; got: boolean[]; won: boolean; t: number };

const fresh = (): State => ({ x: 24, y: 200, vx: 0, vy: 0, ground: false, coyote: 0, buffer: 0, face: 1, got: GEMS.map(() => false), won: false, t: 0 });

export function KnightGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const keys = useRef({ left: false, right: false, held: false, pressed: false });
  const state = useRef<State>(fresh());

  useEffect(() => {
    if (!playing) return;
    const ctx = canvas.current!.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const step = () => {
      const s = state.current;
      const k = keys.current;
      s.t++;
      s.vx = (k.right ? SPEED : 0) - (k.left ? SPEED : 0);
      if (s.vx) s.face = s.vx > 0 ? 1 : -1;
      if (k.pressed) {
        s.buffer = 6;
        k.pressed = false;
      } else s.buffer = Math.max(0, s.buffer - 1);
      s.coyote = s.ground ? 6 : Math.max(0, s.coyote - 1);
      if (s.buffer > 0 && s.coyote > 0) {
        s.vy = JUMP;
        s.buffer = 0;
        s.coyote = 0;
      }
      if (!k.held && s.vy < -2.5) s.vy += GRAVITY; // variable jump height
      s.vy = Math.min(s.vy + GRAVITY, 9);

      s.x += s.vx;
      for (const b of SOLIDS) if (hit(s, b)) s.x = s.vx > 0 ? b.x - 12 : b.x + b.w;
      s.x = Math.max(0, Math.min(WORLD_W - 12, s.x));
      s.y += s.vy;
      s.ground = false;
      for (const b of SOLIDS)
        if (hit(s, b)) {
          if (s.vy > 0) {
            s.y = b.y - 16;
            s.ground = true;
          } else s.y = b.y + b.h;
          s.vy = 0;
        }
      if (s.y > H + 40) Object.assign(s, { x: 24, y: 200, vx: 0, vy: 0 });
      GEMS.forEach((g, i) => {
        if (!s.got[i] && Math.abs(s.x + 6 - (g.x + 4)) < 12 && Math.abs(s.y + 8 - (g.y + 4)) < 14) {
          s.got[i] = true;
          setScore(s.got.filter(Boolean).length);
        }
      });
      if (!s.won && s.got.every(Boolean)) s.won = true;
    };

    const draw = () => {
      const s = state.current;
      const cam = Math.max(0, Math.min(WORLD_W - W, s.x - W / 2));
      ctx.fillStyle = "#202124";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2b2d31";
      for (let i = 0; i < 12; i++) ctx.fillRect(((i * 97 - cam * 0.3) % (W + 60)) - 30, 60 + ((i * 37) % 80), 40, 120);
      ctx.save();
      ctx.translate(-Math.round(cam), 0);
      for (const b of SOLIDS) {
        ctx.fillStyle = "#3c4043";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "#5f6368";
        ctx.fillRect(b.x, b.y, b.w, 3);
      }
      GEMS.forEach((g, i) => {
        if (s.got[i]) return;
        const bob = Math.sin(s.t / 10 + i) * 2;
        ctx.fillStyle = g.c;
        ctx.beginPath();
        ctx.moveTo(g.x + 4, g.y + bob);
        ctx.lineTo(g.x + 8, g.y + 4 + bob);
        ctx.lineTo(g.x + 4, g.y + 8 + bob);
        ctx.lineTo(g.x, g.y + 4 + bob);
        ctx.fill();
      });
      // knight
      const x = Math.round(s.x);
      const y = Math.round(s.y);
      ctx.fillStyle = "#9aa0a6";
      ctx.fillRect(x + 2, y, 8, 7);
      ctx.fillStyle = "#202124";
      ctx.fillRect(x + (s.face > 0 ? 5 : 3), y + 3, 4, 1);
      ctx.fillStyle = "#ea4335";
      ctx.fillRect(x + (s.face > 0 ? 3 : 7), y - 2, 3, 3);
      ctx.fillStyle = "#4285f4";
      ctx.fillRect(x + 1, y + 7, 10, 6);
      ctx.fillStyle = "#dadce0";
      ctx.fillRect(s.face > 0 ? x + 11 : x - 1, y + 4, 1, 8);
      ctx.fillStyle = "#5f6368";
      const stride = s.ground && s.vx ? Math.floor(s.t / 5) % 2 : 0;
      ctx.fillRect(x + 2, y + 13, 3, 3 - stride);
      ctx.fillRect(x + 7, y + 13, 3, 3 - (1 - stride) * (s.vx ? 1 : 0));
      ctx.restore();
      if (s.won) {
        ctx.fillStyle = "rgba(32,33,36,.75)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "600 20px var(--font-gsf), system-ui";
        ctx.textAlign = "center";
        ctx.fillText("All four gems. The jump feels right.", W / 2, H / 2);
      }
    };

    const loop = (now: number) => {
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= 1000 / 60) {
        step();
        acc -= 1000 / 60;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const press = (key: "left" | "right" | "jump", down: boolean, repeat = false) => {
    const k = keys.current;
    if (key === "jump") {
      if (down && !repeat) k.pressed = true;
      k.held = down;
    } else k[key] = down;
  };

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const map: Record<string, "left" | "right" | "jump"> = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "jump", w: "jump", W: "jump", " ": "jump" };
    const key = map[e.key];
    if (!key) return;
    e.preventDefault();
    press(key, down, e.repeat);
  };

  return (
    <div ref={wrap} tabIndex={0} onKeyDown={(e) => onKey(e, true)} onKeyUp={(e) => onKey(e, false)} className="absolute inset-0 outline-none" aria-label="The Knight mini game. Arrow keys to move, space to jump." role="application">
      <canvas ref={canvas} width={W} height={H} className="h-full w-full" style={{ imageRendering: "pixelated" }} />
      {!playing ? (
        <button
          type="button"
          data-cursor="Play"
          onClick={() => {
            state.current = fresh();
            setScore(0);
            setPlaying(true);
            wrap.current?.focus();
          }}
          className="absolute inset-0 grid place-items-center bg-[#202124]/70 text-white"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-g-blue">
              <Icon name="play" size={32} />
            </span>
            <span className="text-[15px] font-medium">Press ▶ to play</span>
          </span>
        </button>
      ) : (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 font-mono text-[12px] text-white">gems {score}/4</span>
          <div className="absolute inset-x-3 bottom-3 flex justify-between sm:hidden">
            <div className="flex gap-2">
              <button aria-label="Left" className="h-12 w-12 rounded-full bg-white/15 text-white" onPointerDown={(e) => { e.preventDefault(); press("left", true); }} onPointerUp={() => press("left", false)} onPointerLeave={() => press("left", false)}>◀</button>
              <button aria-label="Right" className="h-12 w-12 rounded-full bg-white/15 text-white" onPointerDown={(e) => { e.preventDefault(); press("right", true); }} onPointerUp={() => press("right", false)} onPointerLeave={() => press("right", false)}>▶</button>
            </div>
            <button aria-label="Jump" className="h-12 w-16 rounded-full bg-g-blue/80 text-[13px] font-medium text-white" onPointerDown={(e) => { e.preventDefault(); press("jump", true); }} onPointerUp={() => press("jump", false)} onPointerLeave={() => press("jump", false)}>Jump</button>
          </div>
        </>
      )}
    </div>
  );
}

function hit(s: { x: number; y: number }, b: { x: number; y: number; w: number; h: number }) {
  return s.x < b.x + b.w && s.x + 12 > b.x && s.y < b.y + b.h && s.y + 16 > b.y;
}
