import { useEffect, useRef, useState } from 'react';
import { animate, type AnimationPlaybackControls } from 'motion/react';
import type { PlayerId } from '@/engine';
import { useAnimationTiming } from '@/animation/useAnimationTiming';

const BOARD_SIZE = 40;

interface AnimateArgs {
  playerId: PlayerId;
  fromIndex: number;
  toIndex: number;
  /** Called as the token arrives on each space; `crossedGo` is true on the step onto GO. */
  onStep?: (index: number, crossedGo: boolean) => void;
  onComplete: () => void;
}

/**
 * Drives space-by-space token movement, independent of engine state (the
 * engine has already moved the player; this only controls where the token
 * is *displayed*). One Motion tween runs from 0 → steps at `tokenStep` ms
 * per space; each integer it crosses advances the displayed position, so
 * the hops stay sequential and GO fires mid-move at the moment it's crossed.
 */
export function useTokenAnimation() {
  const t = useAnimationTiming();
  const [displayPositions, setDisplayPositions] = useState<Partial<Record<PlayerId, number>>>({});
  const [animatingPlayerId, setAnimatingPlayerId] = useState<PlayerId | null>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => () => controlsRef.current?.stop(), []);

  function animateMove({ playerId, fromIndex, toIndex, onStep, onComplete }: AnimateArgs) {
    controlsRef.current?.stop();

    const steps = (toIndex - fromIndex + BOARD_SIZE) % BOARD_SIZE;
    let stepsTaken = 0;

    const advanceTo = (target: number) => {
      while (stepsTaken < target) {
        stepsTaken += 1;
        const index = (fromIndex + stepsTaken) % BOARD_SIZE;
        setDisplayPositions((prev) => ({ ...prev, [playerId]: index }));
        onStep?.(index, index === 0);
      }
    };

    setAnimatingPlayerId(playerId);
    setDisplayPositions((prev) => ({ ...prev, [playerId]: fromIndex }));

    const finish = () => {
      advanceTo(steps);
      controlsRef.current = null;
      setAnimatingPlayerId(null);
      setDisplayPositions((prev) => {
        const next = { ...prev };
        delete next[playerId];
        return next;
      });
      onComplete();
    };

    if (steps === 0 || t.isInstant) {
      finish();
      return;
    }

    // Each step lands at the *start* of its slot (+1 offset) so the first hop
    // begins immediately; the final slot lets the last hop settle.
    controlsRef.current = animate(0, steps, {
      duration: (steps * t.ms('tokenStep')) / 1000,
      ease: 'linear',
      onUpdate: (value) => advanceTo(Math.min(steps, Math.floor(value) + 1)),
      onComplete: finish,
    });
  }

  return { displayPositions, animatingPlayerId, animate: animateMove };
}
