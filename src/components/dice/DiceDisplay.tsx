import { useEffect, useRef, useState } from 'react';
import { animate, motion, useAnimate } from 'motion/react';
import type { DiceRoll } from '@/engine';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './DiceDisplay.module.css';

interface DiceDisplayProps {
  roll: DiceRoll | null;
  /** Increments once per physical roll; a new value plays the tumble. 0 = never rolled. */
  rollId: number;
  isInJail?: boolean;
  /** Fires once per rollId, when the dice have settled on their final faces. */
  onSettled?: (rollId: number) => void;
}

const PIP_LAYOUTS: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [false, false, true, false, false, false, true, false, false],
  3: [false, false, true, false, true, false, true, false, false],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

const TUMBLE_FACE_CHANGES = 7;

function randomFace(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function Die({ value, index, highlight }: { value: number | null; index: 1 | 2; highlight: boolean }) {
  const pips = value ? PIP_LAYOUTS[value] : undefined;
  return (
    <div className={[styles.die, highlight ? styles.glow : ''].join(' ')} data-die={index}>
      {pips ? (
        <div className={styles.pipGrid}>
          {pips.map((show, i) => (
            <span key={i} className={show ? styles.pip : styles.pipEmpty} />
          ))}
        </div>
      ) : (
        <span className={styles.blank}>?</span>
      )}
    </div>
  );
}

export function DiceDisplay({ roll, rollId, isInJail = false, onSettled }: DiceDisplayProps) {
  const t = useAnimationTiming();
  const [scope, animateScope] = useAnimate<HTMLDivElement>();
  const [settledRollId, setSettledRollId] = useState(rollId);
  const [tumbleFaces, setTumbleFaces] = useState<[number, number]>([1, 1]);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  const isRolling = rollId !== settledRollId;
  const showFaces = !isRolling && roll !== null;
  const isSpecialDouble = showFaces && roll.isSpecialDouble;

  useEffect(() => {
    if (rollId === 0 || rollId === settledRollId) return;
    let cancelled = false;
    const duration = t.s('diceRoll');

    let lastFaceStep = -1;
    const faces = animate(0, TUMBLE_FACE_CHANGES, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        const step = Math.floor(v);
        if (step !== lastFaceStep) {
          lastFaceStep = step;
          setTumbleFaces([randomFace(), randomFace()]);
        }
      },
    });

    const tumble = (selector: string, direction: 1 | -1) =>
      animateScope(
        selector,
        {
          rotate: [0, 400 * direction, 720 * direction],
          y: [0, -18, 0],
          scale: [1, 1.08, 1],
          filter: ['blur(0px)', 'blur(3px)', 'blur(0px)'],
        },
        { duration, ease: 'easeOut' }
      );

    Promise.all([tumble('[data-die="1"]', 1), tumble('[data-die="2"]', -1)]).then(() => {
      if (cancelled) return;
      setSettledRollId(rollId);
      onSettledRef.current?.(rollId);
    });

    return () => {
      cancelled = true;
      faces.stop();
    };
    // Only a new rollId starts a tumble.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollId]);

  // 6+6: a brief red flash on both dice communicates the forced reroll.
  useEffect(() => {
    if (!isSpecialDouble) return;
    animateScope(
      '[data-die]',
      {
        boxShadow: [
          '0 0 0 0 rgba(232, 69, 69, 0)',
          '0 0 0 6px rgba(232, 69, 69, 0.55), 0 0 36px rgba(232, 69, 69, 0.6)',
          '0 0 0 5px rgba(201, 168, 76, 0.18)',
        ],
        borderColor: ['#e84545', '#e84545', '#c9a84c'],
      },
      { duration: t.s('specialDoubleFlash'), ease: 'easeOut' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpecialDouble, settledRollId]);

  let label = '';
  let labelClass = styles.label;
  if (isRolling) {
    label = 'Rolling.';
  } else if (showFaces) {
    if (roll.isSpecialDouble && isInJail) {
      label = 'In Jail. No movement. No escape.';
      labelClass = [styles.label, styles.labelDanger].join(' ');
    } else if (roll.isSpecialDouble) {
      label = 'Double Six. No movement.';
    } else if (roll.isDouble) {
      label = 'Double. Turn ends after landing.';
    } else {
      label = `Move ${roll.total} spaces.`;
    }
  }

  const die1 = isRolling ? tumbleFaces[0] : showFaces ? roll.die1 : null;
  const die2 = isRolling ? tumbleFaces[1] : showFaces ? roll.die2 : null;

  return (
    <div className={styles.wrapper} ref={scope}>
      <div className={styles.diceRow}>
        <Die value={die1} index={1} highlight={isSpecialDouble} />
        <Die value={die2} index={2} highlight={isSpecialDouble} />
      </div>

      <div className={styles.result}>
        {showFaces && (
          <motion.span
            key={settledRollId}
            className={styles.total}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: t.s('specialDoubleFlash'), ease: 'easeOut' }}
          >
            {roll.total}
          </motion.span>
        )}
      </div>

      <p className={labelClass}>{label || ' '}</p>

      {isSpecialDouble && (
        <motion.span
          key={`again-${settledRollId}`}
          className={styles.rollAgain}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: t.s('specialDoubleFlash'), ease: 'easeOut' }}
        >
          {isInJail ? 'IN JAIL · ROLL AGAIN' : 'ROLL AGAIN'}
        </motion.span>
      )}
    </div>
  );
}
