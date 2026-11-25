import { dot, viewBoxFor } from '../logic/viewbox';

export type MiniMapProps = {
  sgg: Array<{ code: string; name: string; path: string }>;
  complex: { sggCode: string; lat: number; lng: number };
};

export function MiniMap({ sgg, complex }: MiniMapProps) {
  const vb = viewBoxFor(sgg, complex.sggCode);
  const [cx, cy] = dot(complex.lng, complex.lat);
  const others = sgg.filter((s) => s.code !== complex.sggCode);
  const target = sgg.find((s) => s.code === complex.sggCode);

  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-sm)] bg-bg">
      <svg
        viewBox={vb}
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {others.map((item) => (
          <path
            key={item.code}
            d={item.path}
            fill="var(--color-map-land)"
            stroke="var(--color-surface)"
            strokeWidth={0.75}
          />
        ))}
        {target ? (
          <path
            d={target.path}
            fill="var(--color-primary-soft)"
            stroke="var(--color-primary)"
            strokeWidth={1.5}
          />
        ) : null}
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="var(--color-secondary)"
          stroke="var(--color-surface)"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
