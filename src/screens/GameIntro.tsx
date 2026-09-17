import { Button } from '@/components/shared/Button';
import { TokenIcon } from '@/components/tokens/TokenIcon';
import type { PlayerConfig } from './PlayerSetup';
import styles from './GameIntro.module.css';

interface GameIntroProps {
  players: PlayerConfig[];
  onBegin: () => void;
}

export function GameIntro({ players, onBegin }: GameIntroProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.boardOutline} />

      <div className={styles.content}>
        <h1 className={styles.title}>BOROUGH</h1>

        <div className={styles.roster}>
          {players.map((player, index) => (
            <div key={index} className={styles.playerRow}>
              <span className={styles.slotLabel} style={{ color: player.colour }}>
                P{index + 1}
              </span>
              <TokenIcon tokenId={player.tokenId} colour={player.colour} size={32} />
              <span className={styles.playerName}>{player.name}</span>
              <span className={styles.colourSwatch} style={{ background: player.colour }} />
            </div>
          ))}
        </div>

        <p className={styles.tagline}>OWN THE CITY. OUTLAST EVERYONE.</p>

        <div className={styles.buttonWrap}>
          <Button variant="primary" size="large" onClick={onBegin}>
            BEGIN
          </Button>
        </div>
      </div>
    </div>
  );
}
