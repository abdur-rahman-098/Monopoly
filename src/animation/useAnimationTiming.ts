import { useContext } from 'react';
import { AnimationSpeedContext } from './AnimationContext';
import { scaledMs, scaledSeconds, type AnimationSpeed, type DurationKey } from './config';

export interface AnimationTiming {
  speed: AnimationSpeed;
  isInstant: boolean;
  /** Scaled duration in milliseconds. */
  ms: (key: DurationKey) => number;
  /** Scaled duration in seconds (Motion transitions). */
  s: (key: DurationKey) => number;
}

export function useAnimationTiming(): AnimationTiming {
  const speed = useContext(AnimationSpeedContext);
  return {
    speed,
    isInstant: speed === 'instant',
    ms: (key) => scaledMs(key, speed),
    s: (key) => scaledSeconds(key, speed),
  };
}
