import type { HTMLMotionProps } from 'motion/react';
import { useAnimationTiming } from './useAnimationTiming';

const EASE_OUT = [0.4, 0, 0.2, 1] as const;

/**
 * Open: scale 0.95 → 1 + fade in. Close: the reverse, slightly faster.
 * Spread `overlay` on the backdrop and `card` on the dialog surface; the
 * exit only plays when the modal is rendered inside an <AnimatePresence>.
 */
export function useModalMotion(): { overlay: HTMLMotionProps<'div'>; card: HTMLMotionProps<'div'> } {
  const t = useAnimationTiming();
  return {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: t.s('modalOpen'), ease: EASE_OUT } },
      exit: { opacity: 0, transition: { duration: t.s('modalClose'), ease: EASE_OUT } },
    },
    card: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: t.s('modalOpen'), ease: EASE_OUT } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: t.s('modalClose'), ease: EASE_OUT } },
    },
  };
}
