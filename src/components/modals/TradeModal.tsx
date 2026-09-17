import { useMemo, useState } from 'react';
import type { GameState, PlayerId, TradeProposal } from '@/engine';
import { ALL_PURCHASABLES } from '@/engine';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import styles from './TradeModal.module.css';

interface TradeModalProps {
  state: GameState;
  proposerId: PlayerId;
  onClose: () => void;
  onPropose: (proposal: Omit<TradeProposal, 'id' | 'status'>) => void;
}

function tradeableAssets(playerId: PlayerId, state: GameState) {
  return ALL_PURCHASABLES.filter((asset) => {
    const record = state.ownership[asset.id];
    return record && record.ownerId === playerId && !record.isMortgaged && record.buildings === 0;
  });
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function TradeModal({ state, proposerId, onClose, onPropose }: TradeModalProps) {
  const otherPlayers = state.players.filter((p) => p.id !== proposerId && p.status === 'active');
  const [recipientId, setRecipientId] = useState<PlayerId | null>(otherPlayers[0]?.id ?? null);
  const [offeredPropertyIds, setOfferedPropertyIds] = useState<string[]>([]);
  const [requestedPropertyIds, setRequestedPropertyIds] = useState<string[]>([]);
  const [offeredCash, setOfferedCash] = useState(0);
  const [requestedCash, setRequestedCash] = useState(0);
  const [includesOfferedGoojf, setIncludesOfferedGoojf] = useState(false);
  const [includesRequestedGoojf, setIncludesRequestedGoojf] = useState(false);

  const proposer = state.players.find((p) => p.id === proposerId);
  const recipient = state.players.find((p) => p.id === recipientId) ?? null;

  const proposerAssets = useMemo(() => tradeableAssets(proposerId, state), [proposerId, state]);
  const recipientAssets = useMemo(
    () => (recipientId ? tradeableAssets(recipientId, state) : []),
    [recipientId, state]
  );

  if (otherPlayers.length === 0 || !proposer) {
    return (
      <Modal onClose={onClose}>
        <h1 className="text-h1">Trade</h1>
        <p className={styles.empty}>No other players are available to trade with.</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </Modal>
    );
  }

  function handleRecipientChange(id: PlayerId) {
    setRecipientId(id);
    setRequestedPropertyIds([]);
    setRequestedCash(0);
    setIncludesRequestedGoojf(false);
  }

  function handleSubmit() {
    if (!recipientId) return;
    onPropose({
      proposerId,
      recipientId,
      offeredPropertyIds,
      offeredCash,
      requestedPropertyIds,
      requestedCash,
      includesOfferedGoojf,
      includesRequestedGoojf,
    });
  }

  const canSubmit =
    recipientId !== null &&
    offeredCash <= proposer.cash &&
    (!recipient || requestedCash <= recipient.cash) &&
    (offeredPropertyIds.length > 0 ||
      requestedPropertyIds.length > 0 ||
      offeredCash > 0 ||
      requestedCash > 0 ||
      includesOfferedGoojf ||
      includesRequestedGoojf);

  return (
    <Modal onClose={onClose}>
      <h1 className="text-h1">Propose Trade</h1>

      <div className={styles.recipientRow}>
        {otherPlayers.map((p) => (
          <Button
            key={p.id}
            variant={p.id === recipientId ? 'primary' : 'secondary'}
            onClick={() => handleRecipientChange(p.id)}
          >
            {p.name}
          </Button>
        ))}
      </div>

      {recipient && (
        <div className={styles.columns}>
          <div className={styles.column}>
            <p className={`text-label ${styles.columnTitle}`}>You Offer</p>
            <div className={styles.checklist}>
              {proposerAssets.length === 0 && <span className={styles.empty}>No tradeable properties</span>}
              {proposerAssets.map((asset) => (
                <label className={styles.checkboxRow} key={asset.id}>
                  <input
                    type="checkbox"
                    checked={offeredPropertyIds.includes(asset.id)}
                    onChange={() => setOfferedPropertyIds((prev) => toggle(prev, asset.id))}
                  />
                  <span className="text-body">{asset.name}</span>
                </label>
              ))}
            </div>
            <div className={styles.cashRow}>
              <span className="text-label">Cash</span>
              <input
                className={styles.cashInput}
                type="number"
                min={0}
                max={proposer.cash}
                value={offeredCash}
                onChange={(e) => setOfferedCash(Math.max(0, Math.min(proposer.cash, Number(e.target.value))))}
              />
            </div>
            {proposer.getOutOfJailFreeCards > 0 && (
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={includesOfferedGoojf}
                  onChange={(e) => setIncludesOfferedGoojf(e.target.checked)}
                />
                <span className="text-body">Get Out of Jail Free Card</span>
              </label>
            )}
          </div>

          <div className={styles.column}>
            <p className={`text-label ${styles.columnTitle}`}>You Request</p>
            <div className={styles.checklist}>
              {recipientAssets.length === 0 && <span className={styles.empty}>No tradeable properties</span>}
              {recipientAssets.map((asset) => (
                <label className={styles.checkboxRow} key={asset.id}>
                  <input
                    type="checkbox"
                    checked={requestedPropertyIds.includes(asset.id)}
                    onChange={() => setRequestedPropertyIds((prev) => toggle(prev, asset.id))}
                  />
                  <span className="text-body">{asset.name}</span>
                </label>
              ))}
            </div>
            <div className={styles.cashRow}>
              <span className="text-label">Cash</span>
              <input
                className={styles.cashInput}
                type="number"
                min={0}
                max={recipient.cash}
                value={requestedCash}
                onChange={(e) => setRequestedCash(Math.max(0, Math.min(recipient.cash, Number(e.target.value))))}
              />
            </div>
            {recipient.getOutOfJailFreeCards > 0 && (
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={includesRequestedGoojf}
                  onChange={(e) => setIncludesRequestedGoojf(e.target.checked)}
                />
                <span className="text-body">Get Out of Jail Free Card</span>
              </label>
            )}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          PROPOSE TRADE
        </Button>
        <Button variant="ghost" onClick={onClose}>
          CANCEL
        </Button>
      </div>
    </Modal>
  );
}
