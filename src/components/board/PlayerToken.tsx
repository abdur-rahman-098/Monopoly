import type { Player } from '@/engine';
import { PLAYER_COLOUR_VAR } from './colourGroup';
import styles from './PlayerToken.module.css';

interface PlayerTokenProps {
  player: Player;
}

export function PlayerToken({ player }: PlayerTokenProps) {
  return <div className={styles.token} style={{ background: PLAYER_COLOUR_VAR[player.id] }} title={player.name} />;
}
