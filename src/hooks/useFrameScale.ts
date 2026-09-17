import { useEffect, useState } from 'react';

function fit(width: number, height: number, multiplier: number): number {
  if (typeof window === 'undefined') return multiplier;
  return Math.min(window.innerWidth / width, window.innerHeight / height) * multiplier;
}

/**
 * Scale that fits a fixed-size design frame inside the window. The frame's
 * base dimensions never change; only this display scale does.
 */
export function useFrameScale(width: number, height: number, multiplier = 1): number {
  const [scale, setScale] = useState(() => fit(width, height, multiplier));

  useEffect(() => {
    const update = () => setScale(fit(width, height, multiplier));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width, height, multiplier]);

  return scale;
}
