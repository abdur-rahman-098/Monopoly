import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';
import styles from './SpecialSpaceModal.module.css';

const AUTO_DISMISS_MS = 1200;

export type SpecialSpaceKind = 'go' | 'free-parking' | 'jail-visiting';

const COPY: Record<SpecialSpaceKind, { title: string; body: string; colour: string }> = {
  go: { title: 'GO', body: '+$200', colour: 'var(--colour-success)' },
  'free-parking': { title: 'FREE PARKING', body: 'Nothing happens.', colour: 'var(--colour-text-dim)' },
  'jail-visiting': { title: 'JUST VISITING', body: 'Nothing happens.', colour: 'var(--colour-text-dim)' },
};

interface SpecialSpaceModalProps {
  kind: SpecialSpaceKind;
  onDismiss: () => void;
}

export function SpecialSpaceModal({ kind, onDismiss }: SpecialSpaceModalProps) {
  const modalMotion = useModalMotion();
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const copy = COPY[kind];

  return (
    <motion.div className={styles.overlay} onClick={onDismiss} {...modalMotion.overlay}>
      <motion.div className={styles.card} {...modalMotion.card}>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.body} style={{ color: copy.colour }}>{copy.body}</p>
      </motion.div>
    </motion.div>
  );
}
