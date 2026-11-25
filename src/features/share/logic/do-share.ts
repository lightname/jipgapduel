export type ShareOutcome = 'shared' | 'cancelled' | 'fallback';

export async function doShare(text: string, file: File | null): Promise<ShareOutcome> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (file && nav.canShare?.({ files: [file] })) {
      await nav.share({ text, files: [file] });
      return 'shared';
    }
    if (typeof nav.share === 'function') {
      await nav.share({ text });
      return 'shared';
    }
    return 'fallback';
  } catch (e) {
    return (e as DOMException)?.name === 'AbortError' ? 'cancelled' : 'fallback';
  }
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadShareImage(blob: Blob, date: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jipgapduel-${date}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
