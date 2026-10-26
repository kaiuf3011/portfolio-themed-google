import { prefersReducedMotion } from "@/lib/motion";

const COLORS = ["#4285f4", "#ea4335", "#fbbc04", "#34a853"];

/** Brand-colour confetti burst from a point. 60 particles max, ~1s, then the canvas removes itself. */
export function confetti(x: number, y: number, count = 60) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "90" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: Math.min(count, 60) }, (_, i) => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 6 + Math.random() * 9;
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      r: 3 + Math.random() * 4,
      c: COLORS[i % 4],
      shape: i % 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
    };
  });

  const start = performance.now();
  const frame = (now: number) => {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 0.6) / 0.5);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      if (p.shape === 0) ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      else if (p.shape === 1) ctx.roundRect(-p.r, -p.r / 2, p.r * 2, p.r, p.r / 2);
      else ctx.roundRect(-p.r, -p.r, p.r * 2, p.r * 2, 2);
      ctx.fill();
      ctx.restore();
    }
    if (t < 1.1) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
