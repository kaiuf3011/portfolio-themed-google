// Material-expressive-style shapes as radial functions r(θ) in [0, 1].
// Sampling every shape at the same angles makes any two shapes morphable by lerping radii.

export type ShapeName = "circle" | "cookie" | "sunny" | "burst" | "clover" | "softBurst" | "gem";

const N = 90;
const TAU = Math.PI * 2;

const tri = (x: number) => 1 - Math.abs(((x / Math.PI) % 2) - 1); // 0..1 triangle wave, period 2π

const radial: Record<ShapeName, (t: number) => number> = {
  circle: () => 1,
  cookie: (t) => 0.9 + 0.1 * Math.cos(9 * t),
  sunny: (t) => 0.8 + 0.2 * Math.pow((1 + Math.cos(8 * t)) / 2, 1.6),
  burst: (t) => 0.7 + 0.3 * Math.pow(tri(12 * t), 1.4),
  clover: (t) => 0.6 + 0.4 * Math.pow(Math.abs(Math.cos(2 * t)), 0.7),
  softBurst: (t) => 0.84 + 0.16 * Math.cos(10 * t),
  gem: (t) => 0.86 + 0.14 * Math.pow(Math.abs(Math.cos(3 * t)), 3),
};

export const shapeNames = Object.keys(radial) as ShapeName[];

export function sample(name: ShapeName): number[] {
  const f = radial[name];
  const out = new Array<number>(N);
  for (let i = 0; i < N; i++) out[i] = f((i / N) * TAU);
  // Normalise so every shape fills the box.
  const max = Math.max(...out);
  return out.map((r) => r / max);
}

const cache = new Map<ShapeName, number[]>();
export function radii(name: ShapeName) {
  let r = cache.get(name);
  if (!r) cache.set(name, (r = sample(name)));
  return r;
}

export function lerpRadii(a: number[], b: number[], t: number) {
  return a.map((r, i) => r + (b[i] - r) * t);
}

/** Closed smooth path (Catmull-Rom → cubic Bézier) centred in a size×size box. */
export function pathFromRadii(r: number[], size = 1, rotation = 0) {
  const c = size / 2;
  const pts = r.map((ri, i) => {
    const t = (i / r.length) * TAU + rotation;
    return [c + Math.cos(t) * ri * c, c + Math.sin(t) * ri * c] as const;
  });
  const n = pts.length;
  const f = (v: number) => +v.toFixed(4);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}

export function shapePath(name: ShapeName, size = 1, rotation = 0) {
  return pathFromRadii(radii(name), size, rotation);
}
