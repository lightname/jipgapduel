import Image from 'next/image';
import { getImage, type ImageId } from '@/lib/images';

export type ImgProps = {
  id: ImageId;
  className?: string;
  priority?: boolean;
};

export function Img({ id, className, priority }: ImgProps) {
  const e = getImage(id);
  return (
    <Image
      src={e.file}
      width={e.width}
      height={e.height}
      alt={e.alt}
      priority={priority}
      className={className}
    />
  );
}
