import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onNewGame: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export function MainMenu({ onNewGame, onHowToPlay, onSettings }: MainMenuProps) {
  // Randomised once per mount so the skyline doesn't jitter on re-render.
  const [buildingHeights] = useState(() =>
    Array.from({ length: 24 }, (_, i) => 20 + Math.sin(i * 1.7) * 30 + Math.random() * 20)
  );
  return (
    <div className={styles.screen}>
      <div className={styles.cityscape}>
        {buildingHeights.map((height, i) => (
          <div key={i} className={styles.building} style={{ height: `${height}%` }} />
        ))}
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>BOROUGH</h1>
        <p className={styles.tagline}>OWN THE CITY. OUTLAST EVERYONE.</p>

        <div className={styles.buttons}>
          <Button variant="primary" size="large" onClick={onNewGame}>
            NEW GAME
          </Button>
          <Button variant="secondary" onClick={onHowToPlay}>
            HOW TO PLAY
          </Button>
          <Button variant="secondary" onClick={onSettings}>
            SETTINGS
          </Button>
          <Button variant="ghost" onClick={() => window.close()}>
            QUIT
          </Button>
        </div>
      </div>

      <span className={styles.version}>v1.0</span>
    </div>
  );
}
