import { AnimatePresence, motion, type Transition } from 'motion/react';
import type { Player, PlayerId } from '@/engine';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import { getTokenPoint } from './layout';
import { PlayerToken } from './PlayerToken';
import styles from './Board.module.css';

const TOKEN_HALF = 9;

interface TokenLayerProps {
  players: Player[];
  displayPositions: Partial<Record<PlayerId, number>>;
  /** Player currently hopping space-by-space (driven by useTokenAnimation). */
  steppingPlayerId: PlayerId | null;
}

/**
 * Tokens live on one absolutely positioned layer over the grid so they can
 * travel between tiles instead of teleporting between tile DOM nodes.
 */
export function TokenLayer({ players, displayPositions, steppingPlayerId }: TokenLayerProps) {
  const t = useAnimationTiming();

  const byPosition = new Map<number, PlayerId[]>();
  for (const player of players) {
    const position = displayPositions[player.id] ?? player.boardPosition;
    byPosition.set(position, [...(byPosition.get(position) ?? []), player.id]);
  }

  return (
    <div className={styles.tokenLayer}>
      <AnimatePresence>
        {players.map((player) => {
          const position = displayPositions[player.id] ?? player.boardPosition;
          const sharing = byPosition.get(position) ?? [player.id];
          const point = getTokenPoint(position, sharing.indexOf(player.id), sharing.length);
          const isStepping = player.id === steppingPlayerId;

          let transition: Transition;
          if (isStepping) {
            transition = { duration: t.s('tokenStep'), ease: 'easeOut' };
          } else if (player.isInJail) {
            // Sent to jail: travel straight to the Jail corner and bounce to a stop.
            transition = { type: 'spring', visualDuration: t.s('sentToJail'), bounce: 0.5 };
          } else {
            transition = { duration: t.s('tokenSettle'), ease: 'easeOut' };
          }

          return (
            <motion.div
              key={player.id}
              data-token={player.id}
              className={styles.tokenSlot}
              initial={false}
              animate={{ x: point.x - TOKEN_HALF, y: point.y - TOKEN_HALF, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4, transition: { duration: t.s('bankruptTileFade') } }}
              transition={transition}
            >
              {/* Re-keyed per space so each step replays a small hop. */}
              <motion.div
                key={isStepping ? position : 'rest'}
                initial={false}
                animate={isStepping ? { y: [0, -12, 0], scale: [1, 1.18, 1] } : { y: 0, scale: 1 }}
                transition={{ duration: t.s('tokenStep'), ease: 'easeOut' }}
              >
                <PlayerToken player={player} />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
