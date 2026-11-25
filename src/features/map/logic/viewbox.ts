import { project } from './projection';

type Box = { x: number; y: number; w: number; h: number };
const bboxCache = new Map<string, Box>();

export function pathBox(path: string): Box {
  const hit = bboxCache.get(path);
  if (hit) return hit;
  const nums = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]);
    x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]);
    y1 = Math.max(y1, nums[i + 1]);
  }
  const b = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  bboxCache.set(path, b);
  return b;
}

export function union(boxes: Box[]): Box {
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function viewBoxFor(sgg: { code: string; path: string }[], sggCode: string): string {
  const seoul = sggCode.startsWith('11');
  const filtered = seoul ? sgg.filter((s) => s.code.startsWith('11')) : sgg;
  const scope = filtered.length > 0 ? filtered : sgg;
  const b = union(scope.map((s) => pathBox(s.path)));
  const pad = seoul ? 0.1 : 0.05;
  const w = Math.max(b.w, (b.h * 4) / 3);
  const h = (w * 3) / 4;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return `${cx - (w * (1 + pad)) / 2} ${cy - (h * (1 + pad)) / 2} ${w * (1 + pad)} ${h * (1 + pad)}`;
}

export const dot = (lng: number, lat: number) => project(lng, lat);
