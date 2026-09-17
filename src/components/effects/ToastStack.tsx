import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Notification, type NotificationType } from '@/components/shared/Notification';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './ToastStack.module.css';

export type ToastItem =
  | { id: number; kind: 'money'; type: NotificationType; label: string; amount: number; durationMs: number }
  | { id: number; kind: 'message'; message: string; durationMs: number };

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

/** Bottom-right notification stack: slides in (300ms), auto-dismisses or closes on click, slides out (200ms). */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  const t = useAnimationTiming();

  return (
    <div className={styles.stack}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          // GO passing reads as money arriving: it rises into place rather than sliding sideways.
          const rises = toast.kind === 'money' && toast.type === 'pass-go';
          return (
            <motion.div
              key={toast.id}
              layout
              className={styles.item}
              initial={rises ? { opacity: 0, y: 28 } : { opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0, y: 0, transition: { duration: t.s('toastIn'), ease: 'easeOut' } }}
              exit={{ opacity: 0, x: 48, transition: { duration: t.s('toastOut'), ease: 'easeIn' } }}
              transition={{ layout: { duration: t.s('toastOut') } }}
              onClick={() => onDismiss(toast.id)}
            >
              <AutoDismiss id={toast.id} durationMs={toast.durationMs} onDismiss={onDismiss} />
              {toast.kind === 'money' ? (
                <Notification type={toast.type} label={toast.label} amount={toast.amount} />
              ) : (
                <div className={styles.message}>{toast.message}</div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function AutoDismiss({ id, durationMs, onDismiss }: { id: number; durationMs: number; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);
  return null;
}
