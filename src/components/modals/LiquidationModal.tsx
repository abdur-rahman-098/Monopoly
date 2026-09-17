import { useState } from 'react';
import type { GameState, PlayerId } from '@/engine';
import { GameEngine } from '@/engine';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import styles from './LiquidationModal.module.css';

interface LiquidationModalProps {
  state: GameState;
  playerId: PlayerId;
  amountOwed: number;
  creditorId: PlayerId | 'bank';
  onSellHouse: (propertyId: string) => void;
  onSellHotel: (propertyId: string) => void;
  onMortgage: (propertyId: string) => void;
  onPay: () => void;
  onDeclareBankruptcy: () => void;
}

type Step = 'payment-required' | 'asset-management' | 'confirm-bankruptcy';

export function LiquidationModal({
  state,
  playerId,
  amountOwed,
  creditorId,
  onSellHouse,
  onSellHotel,
  onMortgage,
  onPay,
  onDeclareBankruptcy,
}: LiquidationModalProps) {
  const [step, setStep] = useState<Step>('payment-required');
  const player = state.players.find((p) => p.id === playerId);
  const creditorName = creditorId === 'bank' ? 'the Bank' : (state.players.find((p) => p.id === creditorId)?.name ?? 'Unknown');
  const canPay = (player?.cash ?? 0) >= amountOwed;
  const options = GameEngine.getLiquidationOptions(playerId, state);
  const netWorth = GameEngine.getNetWorth(playerId, state);

  if (step === 'confirm-bankruptcy') {
    return (
      <ConfirmModal
        title="Declare Bankruptcy"
        body={`You will be eliminated from the game. All assets transfer to ${creditorName}. This cannot be undone.`}
        confirmLabel="DECLARE BANKRUPTCY"
        confirmVariant="danger"
        onConfirm={onDeclareBankruptcy}
        onCancel={() => setStep('asset-management')}
      />
    );
  }

  if (step === 'payment-required') {
    return (
      <Modal>
        <p className={styles.stepLabel}>STEP 1 OF 2</p>
        <h1 className={styles.title}>PAYMENT REQUIRED</h1>
        <div className={styles.amountBlock}>
          <span className={styles.amountValue}>${amountOwed.toLocaleString()}</span>
          <span className={styles.amountNote}>owed to {creditorName}</span>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>${player?.cash.toLocaleString() ?? 0}</span>
            <span className={styles.statLabel}>CASH</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>${netWorth.toLocaleString()}</span>
            <span className={styles.statLabel}>NET WORTH</span>
          </div>
        </div>
        <p className={styles.instruction}>
          {canPay
            ? 'You have enough cash to pay.'
            : 'You do not have enough cash. Sell buildings or mortgage properties to raise funds.'}
        </p>
        <div className={styles.actions}>
          {canPay ? (
            <Button variant="primary" onClick={onPay}>PAY ${amountOwed.toLocaleString()}</Button>
          ) : (
            <Button variant="primary" onClick={() => setStep('asset-management')}>MANAGE ASSETS</Button>
          )}
          <Button variant="ghost" onClick={() => setStep('confirm-bankruptcy')}>DECLARE BANKRUPTCY</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal>
      <p className={styles.stepLabel}>STEP 2 OF 2</p>
      <h1 className={styles.title}>ASSET MANAGEMENT</h1>
      <div className={styles.owedBar}>
        <span>Owed: ${amountOwed.toLocaleString()}</span>
        <span style={{ color: canPay ? 'var(--colour-success)' : 'var(--colour-danger)' }}>
          Cash: ${player?.cash.toLocaleString() ?? 0}
        </span>
      </div>

      <div className={styles.optionList}>
        {options.length === 0 && <p className={styles.empty}>No assets left to liquidate.</p>}
        {options.map((option) => {
          const asset = GameEngine.getProperty(option.propertyId);
          return (
            <div className={styles.optionRow} key={`${option.propertyId}-${option.action}`}>
              <div className={styles.optionInfo}>
                <span className={styles.optionName}>{asset.name}</span>
                <span className={styles.optionYield}>+${option.yieldAmount}</span>
              </div>
              <div className={styles.optionBtn}>
                {option.action === 'sell-house' && (
                  <Button variant="secondary" onClick={() => onSellHouse(option.propertyId)}>SELL HOUSE</Button>
                )}
                {option.action === 'sell-hotel' && (
                  <Button variant="secondary" onClick={() => onSellHotel(option.propertyId)}>SELL HOTEL</Button>
                )}
                {option.action === 'mortgage' && (
                  <Button variant="secondary" onClick={() => onMortgage(option.propertyId)}>MORTGAGE</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onPay} disabled={!canPay} tooltip="Still insufficient cash">
          PAY ${amountOwed.toLocaleString()}
        </Button>
        <Button variant="ghost" onClick={() => setStep('confirm-bankruptcy')}>DECLARE BANKRUPTCY</Button>
      </div>
    </Modal>
  );
}
