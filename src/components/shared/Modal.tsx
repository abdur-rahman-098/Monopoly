import { useEffect, type ReactNode } from 'react';
import styles from './Modal.module.css';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
  variant?: 'default' | 'danger';
}

export function Modal({ children, onClose, variant = 'default' }: ModalProps) {
  const modalMotion = useModalMotion();
  useEffect(() => {
    if (!onClose) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose!();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div className={styles.overlay} onClick={onClose} {...modalMotion.overlay}>
      <motion.div
        className={[styles.card, variant === 'danger' ? styles.danger : ''].join(' ')}
        onClick={(e) => e.stopPropagation()}
        {...modalMotion.card}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
