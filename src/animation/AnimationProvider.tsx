import { useLayoutEffect, type ReactNode } from 'react';
import { MotionGlobalConfig } from 'motion/react';
import { AnimationSpeedContext } from './AnimationContext';
import { ANIMATION_SPEED, type AnimationSpeed } from './config';

interface AnimationProviderProps {
  speed: AnimationSpeed;
  children: ReactNode;
}

/**
 * Applies the global animation speed to both animation systems:
 * - CSS: `--anim-scale` on :root multiplies every `--dur-*` token.
 * - Motion: components read the speed from context (`useAnimationTiming`),
 *   and `instant` additionally skips all Motion animations outright.
 */
export function AnimationProvider({ speed, children }: AnimationProviderProps) {
  const isInstant = speed === 'instant';

  useLayoutEffect(() => {
    MotionGlobalConfig.skipAnimations = isInstant;
    document.documentElement.style.setProperty('--anim-scale', String(ANIMATION_SPEED[speed]));
  }, [speed, isInstant]);

  return (
    <AnimationSpeedContext.Provider value={speed}>{children}</AnimationSpeedContext.Provider>
  );
}
