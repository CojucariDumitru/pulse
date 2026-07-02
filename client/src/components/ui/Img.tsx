import { useState } from 'react';
import clsx from 'clsx';

interface ImgProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

/** Image with a branded fallback tile so nothing ever looks broken. */
export function Img({ src, alt, className, fallbackLabel }: ImgProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={clsx('relative flex items-center justify-center bg-coal overflow-hidden', className)}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-grid opacity-60" />
        <span className="relative font-display font-extrabold text-2xl tracking-widest text-volt/60 uppercase px-4 text-center">
          {fallbackLabel ?? 'PULSE'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx('object-cover', className)}
    />
  );
}
