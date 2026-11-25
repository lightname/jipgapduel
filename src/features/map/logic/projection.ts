export const FRAME = {
  minLng: 126.0,
  maxLat: 38.3,
  cosLat: 0.7934,
  k: 1000,
} as const;

export function project(lng: number, lat: number): [number, number] {
  return [
    Math.round((lng - FRAME.minLng) * FRAME.cosLat * FRAME.k * 10) / 10,
    Math.round((FRAME.maxLat - lat) * FRAME.k * 10) / 10,
  ];
}
