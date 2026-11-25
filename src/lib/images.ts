import manifest from '../../public/images/manifest.json';

export type ImageId = `IMG-${string}`;
export type ImageEntry = {
  id: string;
  file: string;
  width: number;
  height: number;
  alt: string;
  status: 'placeholder' | 'final';
};

export function getImage(id: ImageId): ImageEntry {
  const e = (manifest as ImageEntry[]).find((m) => m.id === id);
  if (!e) throw new Error(`unknown image ${id}`);
  return e;
}
