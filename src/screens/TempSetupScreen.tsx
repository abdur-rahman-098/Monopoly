import { useState } from 'react';
import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { Button } from '@/components/shared/Button';
import styles from './TempSetupScreen.module.css';

const TOKEN_IDS = ['watch', 'yacht', 'ring', 'crown'];

interface TempSetupScreenProps {
  onStart: (state: GameState) => void;
}

export function TempSetupScreen({ onStart }: TempSetupScreenProps) {
  const [names, setNames] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addPlayer() {
    if (names.length < 4) {
      setNames((prev) => [...prev, '']);
    }
  }

  function removePlayer(index: number) {
    if (names.length > 2) {
      setNames((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function handleStart() {
    const trimmed = names.map((n) => n.trim());
    if (trimmed.some((n) => n.length === 0)) {
      setError('Every player needs a name.');
      return;
    }
    setError(null);

    const setups = trimmed.map((name, index) => ({
      name,
      tokenId: TOKEN_IDS[index] ?? `token-${index}`,
    }));

    let state = GameEngine.createNewGame(setups);
    state = GameEngine.initializeDeckOrder(state);
    state = GameEngine.finalizePlayerOrder(state);
    onStart(state);
  }

  return (
    <div className={styles.screen}>
      <p className="text-display" style={{ color: 'var(--colour-gold)' }}>
        BOROUGH
      </p>
      <p className="text-h3" style={{ color: 'var(--colour-text-muted)', marginBottom: 32 }}>
        Milestone 4 will replace this with a proper setup screen.
      </p>

      <div className={styles.form}>
        {names.map((name, index) => (
          <div className={styles.row} key={index}>
            <input
              className={styles.input}
              placeholder={`Player ${index + 1} name`}
              value={name}
              onChange={(e) => updateName(index, e.target.value)}
              maxLength={20}
            />
            {names.length > 2 && (
              <button type="button" className={styles.remove} onClick={() => removePlayer(index)}>
                ×
              </button>
            )}
          </div>
        ))}

        {error && (
          <p className="text-label" style={{ color: 'var(--colour-danger)' }}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={addPlayer} disabled={names.length >= 4}>
            Add Player
          </Button>
          <Button variant="primary" onClick={handleStart}>
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}
