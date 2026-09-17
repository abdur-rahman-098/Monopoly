import type { GameState, PlayerId } from '@/engine';
import { ALL_PURCHASABLES, GameEngine } from '@/engine';
import { COLOUR_GROUP_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import styles from './MortgageModal.module.css';

interface MortgageModalProps {
  state: GameState;
  playerId: PlayerId;
  onClose: () => void;
  onMortgage: (propertyId: string) => void;
  onUnmortgage: (propertyId: string) => void;
}

export function MortgageModal({ state, playerId, onClose, onMortgage, onUnmortgage }: MortgageModalProps) {
  const player = state.players.find((p) => p.id === playerId);
  const owned = ALL_PURCHASABLES.filter((asset) => state.ownership[asset.id]?.ownerId === playerId);

  return (
    <Modal onClose={onClose}>
      <h1 className={styles.title}>MORTGAGE</h1>
      <p className={styles.subtitle}>
        Cash: ${player?.cash.toLocaleString() ?? 0}
      </p>

      <div className={styles.list}>
        {owned.length === 0 && <p className={styles.empty}>You do not own any properties.</p>}

        {owned.map((asset) => {
          const record = state.ownership[asset.id];
          if (!record) return null;
          const canMortgage = GameEngine.canMortgage(playerId, asset.id, state);
          const canUnmortgage = record.isMortgaged && (player?.cash ?? 0) >= asset.mortgageValue;
          const groupColour = asset.type === 'street' ? COLOUR_GROUP_VAR[asset.colourGroup] : undefined;

          return (
            <div className={styles.row} key={asset.id}>
              {groupColour && <span className={styles.swatch} style={{ background: groupColour }} />}
              <div className={styles.info}>
                <span className={styles.propName}>{asset.name}</span>
                <span className={styles.propStatus}>
                  {record.isMortgaged
                    ? `MORTGAGED · Unmortgage $${asset.mortgageValue}`
                    : record.buildings > 0
                      ? 'HAS BUILDINGS'
                      : `Mortgage Value $${asset.mortgageValue}`}
                </span>
              </div>
              <div className={styles.btnArea}>
                {!record.isMortgaged && (
                  <Button
                    variant="secondary"
                    onClick={() => onMortgage(asset.id)}
                    disabled={!canMortgage}
                    tooltip={record.buildings > 0 ? 'Sell buildings first' : undefined}
                  >
                    MORTGAGE
                  </Button>
                )}
                {record.isMortgaged && (
                  <Button
                    variant="primary"
                    onClick={() => onUnmortgage(asset.id)}
                    disabled={!canUnmortgage}
                    tooltip={!canUnmortgage ? 'Insufficient cash' : undefined}
                  >
                    UNMORTGAGE
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <Button variant="primary" onClick={onClose}>DONE</Button>
      </div>
    </Modal>
  );
}
