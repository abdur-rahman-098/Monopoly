import styles from './MoneyDelta.module.css';

interface MoneyDeltaProps {
  amount: number;
  onDone?: () => void;
}

/** Absolutely positioned +/- cash indicator that fades in, floats up, and fades out. */
export function MoneyDelta({ amount, onDone }: MoneyDeltaProps) {
  const positive = amount >= 0;
  return (
    <div
      className={[styles.delta, positive ? styles.positive : styles.negative].join(' ')}
      onAnimationEnd={onDone}
    >
      {positive ? '+' : '-'}${Math.abs(amount)}
    </div>
  );
}
