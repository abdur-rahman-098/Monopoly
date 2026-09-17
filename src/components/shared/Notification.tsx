import styles from './Notification.module.css';

export type NotificationType = 'pass-go' | 'pay-rent' | 'receive-rent' | 'pay-tax' | 'low-cash';

interface NotificationProps {
  type: NotificationType;
  label: string;
  amount: number;
}

const ACCENT: Record<NotificationType, string> = {
  'pass-go': 'var(--colour-gold)',
  'pay-rent': 'var(--colour-danger)',
  'receive-rent': 'var(--colour-success)',
  'pay-tax': 'var(--colour-text-dim)',
  'low-cash': 'var(--colour-warning)',
};

const AMOUNT_COLOUR: Record<NotificationType, string> = {
  'pass-go': 'var(--colour-success)',
  'pay-rent': 'var(--colour-danger)',
  'receive-rent': 'var(--colour-success)',
  'pay-tax': 'var(--colour-text-muted)',
  'low-cash': 'var(--colour-warning)',
};

/** Presentational money notification. Entry/exit motion and dismissal live in ToastStack. */
export function Notification({ type, label, amount }: NotificationProps) {
  const prefix = type === 'pay-rent' || type === 'pay-tax' ? '-' : '+';

  return (
    <div className={styles.notification} style={{ borderLeftColor: ACCENT[type] }}>
      <span className={styles.label}>{label}</span>
      <span className={styles.amount} style={{ color: AMOUNT_COLOUR[type] }}>
        {prefix}${Math.abs(amount).toLocaleString()}
      </span>
    </div>
  );
}
