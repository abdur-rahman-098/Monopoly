import type { GameState, TradeProposal } from '@/engine';
import { GameEngine } from '@/engine';
import { PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import styles from './TradeResponseModal.module.css';

interface TradeResponseModalProps {
  proposal: TradeProposal;
  state: GameState;
  onAccept: () => void;
  onReject: () => void;
}

function AssetList({ propertyIds, cash, goojf }: { propertyIds: string[]; cash: number; goojf: boolean }) {
  if (propertyIds.length === 0 && cash === 0 && !goojf) {
    return <span className={styles.nothing}>Nothing</span>;
  }
  return (
    <div className={styles.assetList}>
      {propertyIds.map((id) => (
        <span className={styles.assetItem} key={id}>
          {GameEngine.getProperty(id).name}
        </span>
      ))}
      {cash > 0 && <span className={styles.assetItem}>${cash.toLocaleString()} cash</span>}
      {goojf && <span className={styles.assetItem}>Get Out of Jail Free</span>}
    </div>
  );
}

export function TradeResponseModal({ proposal, state, onAccept, onReject }: TradeResponseModalProps) {
  const proposer = state.players.find((p) => p.id === proposal.proposerId);
  const recipient = state.players.find((p) => p.id === proposal.recipientId);
  const proposerColour = proposer ? PLAYER_COLOUR_VAR[proposer.id] : 'var(--colour-text)';
  const recipientColour = recipient ? PLAYER_COLOUR_VAR[recipient.id] : 'var(--colour-text)';

  return (
    <Modal>
      <h1 className={styles.title}>TRADE PROPOSAL</h1>
      <p className={styles.subtitle}>
        {proposer?.name} proposes a trade with {recipient?.name}
      </p>

      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnDot} style={{ background: proposerColour }} />
            <span className={styles.columnLabel}>{proposer?.name} OFFERS</span>
          </div>
          <AssetList
            propertyIds={proposal.offeredPropertyIds}
            cash={proposal.offeredCash}
            goojf={proposal.includesOfferedGoojf}
          />
        </div>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnDot} style={{ background: recipientColour }} />
            <span className={styles.columnLabel}>{proposer?.name} REQUESTS</span>
          </div>
          <AssetList
            propertyIds={proposal.requestedPropertyIds}
            cash={proposal.requestedCash}
            goojf={proposal.includesRequestedGoojf}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onAccept}>ACCEPT</Button>
        <Button variant="ghost" onClick={onReject}>DECLINE</Button>
      </div>
    </Modal>
  );
}
