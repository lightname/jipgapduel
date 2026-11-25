import { getImage } from '@/lib/images';

export type ShareImageInput = {
  mode: 'daily' | 'infinite';
  dateDot: string;
  no: number;
  score: number;
  maxStreak: number;
  best: number;
  answers: boolean[];
  host: string;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderShareImage(o: ShareImageInput): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  try {
    await document.fonts?.ready;
  } catch {
    // 폰트 대기 불가 시 폴백 폰트로 진행
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const logo = await loadImage(getImage('IMG-01').file);
  if (!logo) return null;

  const fontFamily = '"Pretendard Variable", Pretendard, sans-serif';

  ctx.fillStyle = '#F6F5F1';
  ctx.fillRect(0, 0, 1080, 1080);

  drawRoundedRect(ctx, 70, 70, 940, 940, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.drawImage(logo, 130, 130, 96, 96);

  ctx.fillStyle = '#17181C';
  ctx.font = `800 56px ${fontFamily}`;
  ctx.fillText('집값대결', 246, 196);

  ctx.fillStyle = '#5B5F6A';
  ctx.font = `500 36px ${fontFamily}`;
  const metaLine = o.mode === 'daily' ? `${o.dateDot} 데일리 #${o.no}` : `${o.dateDot} 무한 모드`;
  ctx.fillText(metaLine, 130, 300);

  ctx.fillStyle = '#17181C';
  ctx.font = `800 88px ${fontFamily}`;
  const scoreLine = o.mode === 'daily' ? `10문제 중 ${o.score}개` : `연속 ${o.score}개 정답`;
  ctx.fillText(scoreLine, 130, 420);

  ctx.font = `600 44px ${fontFamily}`;
  const subLine = o.mode === 'daily' ? `최고 연속 ${o.maxStreak}개` : `최고 기록 ${o.best}개`;
  ctx.fillText(subLine, 130, 500);

  const visible = o.answers.slice(0, 30);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 40px ${fontFamily}`;

  for (let i = 0; i < visible.length; i++) {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 130 + col * (72 + 12);
    const y = 580 + row * (72 + 12);
    drawRoundedRect(ctx, x, y, 72, 72, 12);
    ctx.fillStyle = visible[i] ? '#15803D' : '#C62828';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(visible[i] ? '✓' : '✗', x + 36, y + 38);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (o.answers.length > 30) {
    ctx.fillStyle = '#5B5F6A';
    ctx.font = `700 32px ${fontFamily}`;
    ctx.fillText(`+${o.answers.length - 30}`, 130, 868);
  }

  ctx.fillStyle = '#5B5F6A';
  ctx.font = `500 32px ${fontFamily}`;
  ctx.fillText(`집값대결 · ${o.host}`, 130, 950);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
