import { motion } from 'motion/react';
import type { ColourGroup, GameState, Player } from '@/engine';
import { PROPERTIES } from '@/engine';
import { COLOUR_GROUP_VAR, PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { MoneyDelta } from '@/components/shared/MoneyDelta';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './PlayerPanel.module.css';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  state: GameState;
  /** Cash as currently shown — may lag engine cash while a transfer animation is in flight. */
  displayCash: number;
  cashDelta: number | null;
  onDismissDelta: () => void;
  /** Plays the BANKRUPT stamp (bankruptcy sequence step 1). */
  isBeingEliminated?: boolean;
}

function ownedColourGroups(player: Player, state: GameState): ColourGroup[] {
  const groups = new Set<ColourGroup>();
  for (const property of PROPERTIES) {
    if (state.ownership[property.id]?.ownerId === player.id) {
      groups.add(property.colourGroup);
    }
  }
  return Array.from(groups);
}

export function PlayerPanel({
  player,
  isActive,
  state,
  displayCash,
  cashDelta,
  onDismissDelta,
  isBeingEliminated = false,
}: PlayerPanelProps) {
  const t = useAnimationTiming();
  const propertyCount = Object.values(state.ownership).filter((record) => record.ownerId === player.id).length;
  const colour = PLAYER_COLOUR_VAR[player.id];
  const groups = ownedColourGroups(player, state);
  const isBankrupt = player.status === 'bankrupt' || isBeingEliminated;

  return (
    <div
      className={[styles.panel, isActive && !isBankrupt ? styles.active : ''].join(' ')}
      data-player-panel={player.id}
    >
      <div className={styles.header}>
        <span className={styles.swatch} style={{ background: colour }} />
        <span className={styles.name}>{player.name}</span>
      </div>

      <div className={styles.cashRow} data-cash={player.id}>
        <span className={styles.cash}>${displayCash.toLocaleString()}</span>
        {cashDelta !== null && <MoneyDelta amount={cashDelta} onDone={onDismissDelta} />}
      </div>

      <span className={styles.propertyCount}>
        {propertyCount} {propertyCount === 1 ? 'PROPERTY' : 'PROPERTIES'}
      </span>

      <div className={styles.badgeRow}>
        {isBankrupt ? (
          <span className={[styles.badge, styles.bankrupt].join(' ')}>BANKRUPT</span>
        ) : player.isInJail ? (
          <span className={[styles.badge, styles.jail].join(' ')}>IN JAIL</span>
        ) : isActive ? (
          <span className={[styles.badge, styles.yourTurn].join(' ')}>YOUR TURN</span>
        ) : (
          <span className={[styles.badge, styles.waiting].join(' ')}>WAITING</span>
        )}
      </div>

      {groups.length > 0 && (
        <div className={styles.bandBar} data-bands={player.id}>
          {groups.map((group) => (
            <span key={group} className={styles.band} style={{ background: COLOUR_GROUP_VAR[group] }} />
          ))}
        </div>
      )}

      {isBeingEliminated && (
        <motion.div
          className={styles.bankruptStamp}
          initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ duration: t.s('bankruptStamp'), ease: [0.2, 0.9, 0.3, 1.25] }}
        >
          <span>BANKRUPT</span>
        </motion.div>
      )}
    </div>
  );
}
