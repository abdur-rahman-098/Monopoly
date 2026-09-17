import { useEffect } from 'react';
import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { COLOUR_GROUP_VAR, PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';
import styles from './RentModal.module.css';

const AUTO_PAY_MS = 1500;

interface RentModalProps {
  amount: number;
  creditorId: string;
  propertyId: string;
  state: GameState;
  onPay: () => void;
}

export function RentModal({ amount, creditorId, propertyId, state, onPay }: RentModalProps) {
  const modalMotion = useModalMotion();
  const asset = GameEngine.getProperty(propertyId);
  const creditor = state.players.find((p) => p.id === creditorId);
  const player = GameEngine.getCurrentPlayer(state);
  const record = state.ownership[propertyId];
  const afterCash = player.cash - amount;
  const creditorColour = creditor ? PLAYER_COLOUR_VAR[creditor.id] : 'var(--colour-text)';

  useEffect(() => {
    const timer = setTimeout(onPay, AUTO_PAY_MS);
    return () => clearTimeout(timer);
  }, [onPay]);

  const rentRows: { label: string; value: string; active: boolean }[] = [];
  if (asset.type === 'street') {
    const buildings = record?.buildings ?? 0;
    rentRows.push({ label: 'Base Rent', value: `$${asset.baseRent}`, active: buildings === 0 });
    asset.rentWithHouses.forEach((rent, i) => {
      rentRows.push({ label: `${i + 1} House${i > 0 ? 's' : ''}`, value: `$${rent}`, active: buildings === i + 1 });
    });
    rentRows.push({ label: 'Hotel', value: `$${asset.rentWithHotel}`, active: buildings === 5 });
  }

  return (
    <motion.div className={styles.overlay} {...modalMotion.overlay}>
      <motion.div className={styles.card} {...modalMotion.card}>
        {asset.type === 'street' && (
          <div className={styles.colourBand} style={{ background: COLOUR_GROUP_VAR[asset.colourGroup] }} />
        )}

        <p className={styles.rentLabel}>RENT DUE</p>
        <h1 className={styles.propertyName}>{asset.name}</h1>

        <div className={styles.ownerRow}>
          <span className={styles.ownerDot} style={{ background: creditorColour }} />
          <span className={styles.ownerText}>Owner: {creditor?.name ?? 'Unknown'}</span>
        </div>

        <span className={styles.amount}>-${amount.toLocaleString()}</span>

        {rentRows.length > 0 && (
          <div className={styles.rentTable}>
            {rentRows.map((row, i) => (
              <div key={i} className={`${styles.rentRow} ${row.active ? styles.rentRowActive : ''}`}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {asset.type === 'station' && (
          <p className={styles.breakdown}>Station rent</p>
        )}
        {asset.type === 'utility' && (
          <p className={styles.breakdown}>Utility rent (dice-based)</p>
        )}

        <div className={styles.cashRow}>
          <span>Your Cash</span>
          <span>${player.cash.toLocaleString()}</span>
        </div>
        <div className={styles.cashRow}>
          <span>After</span>
          <span style={{ color: afterCash < 0 ? 'var(--colour-danger)' : 'var(--colour-text)' }}>
            ${afterCash.toLocaleString()}
          </span>
        </div>

        <Button variant="primary" onClick={onPay}>PAY ${amount.toLocaleString()}</Button>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ animation: `shrink ${AUTO_PAY_MS}ms linear forwards` }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
