// DOM-level easter-egg effects. They animate anything marked [data-fx] and always put it back.

const EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

function visibleTargets() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-fx]")).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.height > 0;
  });
}

function restore(el: HTMLElement, from: Keyframe, delay = 0) {
  const old = el.getAnimations();
  el.animate([from, { transform: "none", opacity: 1, filter: "none" }], { duration: 700, delay, easing: EMPHASIZED }).finished.then(
    () => old.forEach((a) => a.cancel()),
    () => {},
  );
}

/** Everything on screen falls to the bottom, bounces, piles up, then floats back. */
export function gravity(holdMs = 3200) {
  const els = visibleTargets().filter((el) => el.getBoundingClientRect().bottom < innerHeight);
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    const dy = innerHeight - r.bottom - 2;
    const rot = (Math.random() - 0.5) * 28;
    const end = `translateY(${dy}px) rotate(${rot}deg)`;
    el.animate(
      [
        { transform: "none", easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
        { transform: end, offset: 0.55, easing: "cubic-bezier(0, 0.55, 0.45, 1)" },
        { transform: `translateY(${dy - Math.min(70, dy * 0.18)}px) rotate(${rot * 0.85}deg)`, offset: 0.72, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
        { transform: end, offset: 0.86, easing: "cubic-bezier(0, 0.55, 0.45, 1)" },
        { transform: `translateY(${dy - Math.min(18, dy * 0.05)}px) rotate(${rot}deg)`, offset: 0.93, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
        { transform: end },
      ],
      { duration: 1400, delay: Math.random() * 260, fill: "forwards" },
    );
    setTimeout(() => restore(el, { transform: end }, Math.random() * 200), holdMs);
  });
}

/** Half of everything turns to dust. Then it comes back. */
export function snap(holdMs = 3000) {
  const els = visibleTargets();
  const doomed = els.filter((_, i) => i % 2 === 0 || Math.random() < 0.2);
  const rects: DOMRect[] = [];
  doomed.forEach((el, i) => {
    rects.push(el.getBoundingClientRect());
    const gone: Keyframe = { opacity: 0, filter: "blur(8px)", transform: "translate(60px, -40px) skewX(-8deg)" };
    el.animate([{ opacity: 1, filter: "blur(0)", transform: "none" }, gone], { duration: 1300, delay: i * 140, easing: "ease-in", fill: "forwards" });
    setTimeout(() => restore(el, gone, i * 80), holdMs + doomed.length * 140);
  });
  dust(rects);
  return doomed.length;
}

function dust(rects: DOMRect[]) {
  const canvas = document.createElement("canvas");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  Object.assign(canvas.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "85" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const color = getComputedStyle(document.documentElement).getPropertyValue("--on-surface-variant").trim() || "#5f6368";
  const motes = rects.flatMap((r, i) =>
    Array.from({ length: 70 }, () => ({
      x: r.left + Math.random() * r.width,
      y: r.top + Math.random() * r.height,
      vx: 0.6 + Math.random() * 2.2,
      vy: -0.4 - Math.random() * 1.6,
      s: 1 + Math.random() * 2.5,
      born: i * 140 + Math.random() * 900,
    })),
  );
  const t0 = performance.now();
  const frame = (now: number) => {
    const t = now - t0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    for (const m of motes) {
      const age = t - m.born;
      if (age < 0) continue;
      const life = Math.max(0, 1 - age / 1400);
      ctx.globalAlpha = life;
      ctx.fillRect(m.x + m.vx * age * 0.06, m.y + m.vy * age * 0.06, m.s, m.s);
    }
    if (t < 3200) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
