import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { TokenIcon } from '@/components/tokens/TokenIcon';
import styles from './PlayerSetup.module.css';

export interface PlayerConfig {
  name: string;
  colour: string;
  colourName: string;
  tokenId: string;
}

const DEFAULT_PLAYERS: PlayerConfig[] = [
  { name: 'Player 1', colour: '#e84560', colourName: 'Crimson', tokenId: '' },
  { name: 'Player 2', colour: '#4a7fe8', colourName: 'Cobalt', tokenId: '' },
];

const PLAYER_COLOURS = [
  { colour: '#e84560', name: 'Crimson' },
  { colour: '#4a7fe8', name: 'Cobalt' },
  { colour: '#4ac48a', name: 'Jade' },
  { colour: '#e8a838', name: 'Amber' },
];

interface PlayerSetupProps {
  onStart: (players: PlayerConfig[]) => void;
  onBack: () => void;
}

export function PlayerSetup({ onStart, onBack }: PlayerSetupProps) {
  const [players, setPlayers] = useState<PlayerConfig[]>(DEFAULT_PLAYERS);
  const [error, setError] = useState<string | null>(null);

  function updatePlayer(index: number, updates: Partial<PlayerConfig>) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  }

  function addPlayer() {
    if (players.length >= 4) return;
    const usedColours = new Set(players.map((p) => p.colour));
    const nextColour = PLAYER_COLOURS.find((c) => !usedColours.has(c.colour)) ?? PLAYER_COLOURS[players.length]!;
    setPlayers((prev) => [
      ...prev,
      {
        name: `Player ${prev.length + 1}`,
        colour: nextColour.colour,
        colourName: nextColour.name,
        tokenId: '',
      },
    ]);
  }

  function removePlayer(index: number) {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStart() {
    const trimmed = players.map((p) => ({ ...p, name: p.name.trim() }));
    if (trimmed.some((p) => p.name.length === 0)) {
      setError('Every player needs a name.');
      return;
    }
    setError(null);
    onStart(trimmed);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className="text-h1" style={{ color: 'var(--colour-text)' }}>New Game</h1>
        <p className={styles.subtitle}>2 to 4 players. Add players to begin.</p>
      </div>

      <div className={styles.grid}>
        {players.map((player, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.slotLabel} style={{ color: player.colour }}>
              PLAYER {index + 1}
            </div>

            <div className={styles.tokenPreview}>
              {player.tokenId ? (
                <TokenIcon tokenId={player.tokenId} colour={player.colour} size={48} />
              ) : (
                <span className={styles.tokenPlaceholder} style={{ color: player.colour }}>?</span>
              )}
            </div>

            <div className={styles.nameSection}>
              <span className={styles.nameLabel}>NAME</span>
              <input
                className={styles.nameInput}
                value={player.name}
                onChange={(e) => updatePlayer(index, { name: e.target.value })}
                maxLength={20}
              />
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.colourInfo}>
                <span className={styles.colourSwatch} style={{ background: player.colour }} />
                <span className={styles.colourName}>{player.colourName}</span>
              </div>
              <span className={styles.readyBadge}>READY</span>
            </div>

            {players.length > 2 && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removePlayer(index)}
                aria-label={`Remove ${player.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {players.length < 4 && (
          <button type="button" className={styles.addCard} onClick={addPlayer}>
            <div className={styles.addIcon}>+</div>
            <span className={styles.addLabel}>Add Player</span>
            <span className={styles.addOptional}>OPTIONAL</span>
          </button>
        )}
      </div>

      {error && (
        <p className="text-label" style={{ color: 'var(--colour-danger)', marginTop: 16 }}>
          {error}
        </p>
      )}

      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <span className="text-label" style={{ color: 'var(--colour-text-muted)' }}>
            {players.length} PLAYERS · $1,500 STARTING CASH
          </span>
        </div>
        <div className={styles.footerActions}>
          <Button variant="secondary" onClick={onBack}>
            BACK
          </Button>
          <Button variant="primary" onClick={handleStart}>
            START GAME
          </Button>
        </div>
      </div>
    </div>
  );
}
