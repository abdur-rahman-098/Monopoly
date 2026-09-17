import { useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import styles from './GameMenu.module.css';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';

interface GameMenuProps {
  onResume: () => void;
  onRules: () => void;
  onSettings: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function GameMenu({ onResume, onRules, onSettings, onRestart, onQuit }: GameMenuProps) {
  const modalMotion = useModalMotion();
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onResume();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume]);

  if (confirm === 'restart') {
    return (
      <ConfirmModal
        title="Restart Game"
        body="All progress will be lost. Are you sure?"
        confirmLabel="RESTART"
        confirmVariant="danger"
        onConfirm={() => { setConfirm(null); onRestart(); }}
        onCancel={() => setConfirm(null)}
      />
    );
  }

  if (confirm === 'quit') {
    return (
      <ConfirmModal
        title="Quit to Main Menu"
        body="All progress will be lost. Are you sure?"
        confirmLabel="QUIT"
        confirmVariant="danger"
        onConfirm={() => { setConfirm(null); onQuit(); }}
        onCancel={() => setConfirm(null)}
      />
    );
  }

  return (
    <motion.div className={styles.overlay} {...modalMotion.overlay}>
      <motion.div className={styles.menu} {...modalMotion.card}>
        <h1 className={styles.title}>MENU</h1>
        <div className={styles.buttons}>
          <Button variant="primary" size="large" onClick={onResume}>RESUME</Button>
          <Button variant="secondary" size="large" onClick={onRules}>RULES</Button>
          <Button variant="secondary" size="large" onClick={onSettings}>SETTINGS</Button>
          <Button variant="secondary" size="large" onClick={() => setConfirm('restart')}>RESTART GAME</Button>
          <Button variant="ghost" size="large" onClick={() => setConfirm('quit')}>QUIT TO MAIN MENU</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
