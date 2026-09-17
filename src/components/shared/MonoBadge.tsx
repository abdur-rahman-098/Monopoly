import styles from './MonoBadge.module.css';

interface MonoBadgeProps {
  label: string;
  colour?: 'gold' | 'success' | 'warning' | 'danger' | 'muted' | 'faint';
}

export function MonoBadge({ label, colour = 'gold' }: MonoBadgeProps) {
  return (
    <span className={[styles.badge, styles[colour]].join(' ')}>
      {label}
    </span>
  );
}
