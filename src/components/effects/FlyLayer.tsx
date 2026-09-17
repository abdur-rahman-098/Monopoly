import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useAnimate } from 'motion/react';
import styles from './FlyLayer.module.css';

export interface Flyer {
  id: number;
  /** CSS selectors for the elements the item travels between (measured at launch). */
  from: string;
  to: string;
  content: ReactNode;
  durationS: number;
  onArrive?: () => void;
}

interface FlyLayerProps {
  flyers: Flyer[];
  onDone: (id: number) => void;
}

/**
 * Viewport-level layer for things that visibly travel between two parts of
 * the UI (rent between cash displays, trade assets between player panels).
 * Positions come from getBoundingClientRect, so it works across the scaled
 * game frame.
 */
export function FlyLayer({ flyers, onDone }: FlyLayerProps) {
  return (
    <div className={styles.layer}>
      {flyers.map((flyer) => (
        <FlyingItem key={flyer.id} flyer={flyer} onDone={onDone} />
      ))}
    </div>
  );
}

function centreOf(selector: string): { x: number; y: number } | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function FlyingItem({ flyer, onDone }: { flyer: Flyer; onDone: (id: number) => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const flyerRef = useRef(flyer);
  const onDoneRef = useRef(onDone);

  useLayoutEffect(() => {
    const { id, from, to, durationS, onArrive } = flyerRef.current;
    const start = centreOf(from);
    const end = centreOf(to);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onArrive?.();
      onDoneRef.current(id);
    };

    if (!start || !end || !scope.current) {
      finish();
      return;
    }

    // Travel on a gentle arc: lift at the midpoint, grow slightly, then land.
    const lift = Math.min(120, Math.abs(end.x - start.x) * 0.25 + 40);
    const controls = animate(
      scope.current,
      {
        x: [start.x, (start.x + end.x) / 2, end.x],
        y: [start.y, Math.min(start.y, end.y) - lift, end.y],
        scale: [0.7, 1.15, 0.9],
        opacity: [0, 1, 1, 0.85],
      },
      { duration: durationS, ease: 'easeInOut' }
    );
    controls.then(finish);
    return () => controls.stop();
  }, [animate, scope]);

  return (
    <div ref={scope} className={styles.item} style={{ opacity: 0 }}>
      <div className={styles.inner}>{flyer.content}</div>
    </div>
  );
}

export function FlyerCash({ amount }: { amount: number }) {
  return <span className={styles.cash}>${amount.toLocaleString()}</span>;
}

export function FlyerChips({ colours }: { colours: string[] }) {
  return (
    <>
      {colours.map((colour, i) => (
        <span key={i} className={styles.chip} style={{ background: colour }} />
      ))}
    </>
  );
}
