import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { GameLogEntry, GameState, PlayerId } from '@/engine';
import { PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './GameLog.module.css';

interface GameLogProps {
  state: GameState;
}

function playerColour(playerId: PlayerId): string {
  return PLAYER_COLOUR_VAR[playerId] ?? 'var(--colour-text-muted)';
}

/**
 * Full activity history, oldest first. The ACTIVITY label stays pinned; only
 * the list scrolls (flex:1 + min-height:0 lets it shrink inside the column),
 * and it follows the newest entry at the bottom.
 */
export function GameLog({ state }: GameLogProps) {
  const t = useAnimationTiming();
  const listRef = useRef<HTMLUListElement>(null);
  const [mountedCount] = useState(state.log.length);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: t.isInstant ? 'auto' : 'smooth' });
    }
  }, [state.log.length, t.isInstant]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>ACTIVITY</p>
      <ul className={styles.list} ref={listRef}>
        {state.log.map((entry: GameLogEntry, i) => (
          <motion.li
            // The log is append-only, so the index is a stable identity.
            key={i}
            className={styles.entry}
            initial={i >= mountedCount ? { opacity: 0, x: -6 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: t.s('toastIn'), ease: 'easeOut' }}
          >
            <span className={styles.diamond} style={{ background: playerColour(entry.playerId) }} />
            <span className={styles.text}>{entry.description}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
