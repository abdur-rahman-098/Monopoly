import { useEffect } from 'react';
import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { Button } from '@/components/shared/Button';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';
import styles from './TaxModal.module.css';

const AUTO_PAY_MS = 1000;

interface TaxModalProps {
  amount: number;
  spaceName: string;
  state: GameState;
  onPay: () => void;
}

export function TaxModal({ amount, spaceName, state, onPay }: TaxModalProps) {
  const modalMotion = useModalMotion();
  const player = GameEngine.getCurrentPlayer(state);

  useEffect(() => {
    const timer = setTimeout(onPay, AUTO_PAY_MS);
    return () => clearTimeout(timer);
  }, [onPay]);

  return (
    <motion.div className={styles.overlay} {...modalMotion.overlay}>
      <motion.div className={styles.card} {...modalMotion.card}>
        <p className={styles.taxLabel}>TAX</p>
        <h1 className={styles.spaceName}>{spaceName.toUpperCase()}</h1>

        <span className={styles.amount}>-${amount.toLocaleString()}</span>
        <span className={styles.note}>DUE TO BANK</span>

        <div className={styles.cashRow}>
          <span>Your Cash</span>
          <span>${player.cash.toLocaleString()}</span>
        </div>

        <Button variant="primary" onClick={onPay}>PAY ${amount.toLocaleString()}</Button>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ animation: `shrink ${AUTO_PAY_MS}ms linear forwards` }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
