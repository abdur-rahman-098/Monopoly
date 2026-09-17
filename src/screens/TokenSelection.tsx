import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { TokenIcon, TOKEN_LIST } from '@/components/tokens/TokenIcon';
import type { PlayerConfig } from './PlayerSetup';
import styles from './TokenSelection.module.css';

interface TokenSelectionProps {
  players: PlayerConfig[];
  onConfirm: (players: PlayerConfig[]) => void;
  onBack: () => void;
}

export function TokenSelection({ players, onConfirm, onBack }: TokenSelectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const currentPlayer = players[currentIndex]!;
  const takenTokens = new Map<string, number>();
  for (const [playerIdx, tokenId] of Object.entries(selections)) {
    takenTokens.set(tokenId, Number(playerIdx));
  }

  function handleConfirmToken() {
    if (!selectedToken) return;
    const newSelections = { ...selections, [currentIndex]: selectedToken };
    setSelections(newSelections);

    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedToken(null);
    } else {
      const finalPlayers = players.map((p, i) => ({
        ...p,
        tokenId: newSelections[i] ?? TOKEN_LIST[i]!.id,
      }));
      onConfirm(finalPlayers);
    }
  }

  const isLastPlayer = currentIndex === players.length - 1;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.playerIndicator} style={{ color: currentPlayer.colour }}>
          PLAYER {currentIndex + 1}
        </div>
        <h1 className="text-h1" style={{ color: 'var(--colour-text)' }}>Choose your token</h1>
        <p className={styles.subtitle}>One token per player. Taken tokens are unavailable.</p>
      </div>

      <div className={styles.tokenGrid}>
        {TOKEN_LIST.map((token) => {
          const takenByIdx = takenTokens.get(token.id);
          const isTaken = takenByIdx !== undefined && takenByIdx !== currentIndex;
          const isSelected = selectedToken === token.id;
          const takenByPlayer = isTaken ? players[takenByIdx] : null;

          return (
            <button
              key={token.id}
              type="button"
              className={[
                styles.tokenCard,
                isSelected ? styles.selected : '',
                isTaken ? styles.taken : '',
              ].join(' ')}
              onClick={() => !isTaken && setSelectedToken(token.id)}
              disabled={isTaken}
            >
              <div className={styles.tokenIconWrap}>
                <TokenIcon
                  tokenId={token.id}
                  colour={isTaken ? 'var(--colour-text-dim)' : isSelected ? currentPlayer.colour : 'var(--colour-text)'}
                  size={64}
                />
              </div>
              <span className={styles.tokenName}>{token.name}</span>
              {isTaken && takenByPlayer && (
                <span className={styles.takenLabel}>TAKEN BY {takenByPlayer.name.toUpperCase()}</span>
              )}
              {!isTaken && (
                <span className={styles.availableLabel}>
                  {isSelected ? 'SELECTED' : 'AVAILABLE'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <span className={styles.colourSwatch} style={{ background: currentPlayer.colour }} />
          <span className="text-label" style={{ color: 'var(--colour-text-muted)' }}>
            {currentPlayer.name}
          </span>
        </div>
        <div className={styles.footerActions}>
          <Button variant="secondary" onClick={onBack}>
            BACK
          </Button>
          <Button variant="primary" onClick={handleConfirmToken} disabled={!selectedToken}>
            {isLastPlayer ? 'START GAME' : 'CONFIRM'}
          </Button>
        </div>
      </div>
    </div>
  );
}
