import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import type { AnimationSpeed } from '@/animation/config';
import styles from './Settings.module.css';

const SPEED_OPTIONS: Array<{ value: AnimationSpeed; label: string }> = [
  { value: 'slow', label: 'SLOW' },
  { value: 'normal', label: 'NORMAL' },
  { value: 'fast', label: 'FAST' },
  { value: 'instant', label: 'OFF' },
];

export interface GameSettings {
  animationSpeed: AnimationSpeed;
  showRentCalculations: boolean;
  confirmBeforeBuying: boolean;
}

interface SettingsProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onBack: () => void;
}

export function Settings({ settings, onSave, onBack }: SettingsProps) {
  const [local, setLocal] = useState(settings);

  function handleBack() {
    onSave(local);
    onBack();
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className="text-h1" style={{ color: 'var(--colour-text)', marginBottom: 40 }}>Settings</h1>

        <div className={styles.group}>
          <h2 className={styles.groupTitle}>SOUND</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Music Volume</span>
            <span className={styles.comingSoon}>Coming soon</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Effects Volume</span>
            <span className={styles.comingSoon}>Coming soon</span>
          </div>
        </div>

        <div className={styles.group}>
          <h2 className={styles.groupTitle}>GAMEPLAY</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Animation Speed</span>
            <div className={styles.segmented}>
              {SPEED_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={[styles.segment, local.animationSpeed === value ? styles.segmentActive : ''].join(' ')}
                  onClick={() => setLocal({ ...local, animationSpeed: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Show Rent Calculations</span>
            <button
              type="button"
              className={[styles.toggle, local.showRentCalculations ? styles.toggleOn : ''].join(' ')}
              onClick={() => setLocal({ ...local, showRentCalculations: !local.showRentCalculations })}
              aria-label="Toggle show rent calculations"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Confirm Before Buying</span>
            <button
              type="button"
              className={[styles.toggle, local.confirmBeforeBuying ? styles.toggleOn : ''].join(' ')}
              onClick={() => setLocal({ ...local, confirmBeforeBuying: !local.confirmBeforeBuying })}
              aria-label="Toggle confirm before buying"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>

        <div className={styles.group}>
          <h2 className={styles.groupTitle}>DISPLAY</h2>
          <div className={styles.row}>
            <span className={styles.comingSoon}>Reserved for future options</span>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleBack}>
            BACK
          </Button>
        </div>
      </div>
    </div>
  );
}
