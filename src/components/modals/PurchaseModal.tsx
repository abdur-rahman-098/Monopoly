import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { COLOUR_GROUP_LABEL, COLOUR_GROUP_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { motion } from 'motion/react';
import { useModalMotion } from '@/animation/useModalMotion';
import styles from './PurchaseModal.module.css';

interface PurchaseModalProps {
  propertyId: string;
  price: number;
  state: GameState;
  onBuy: () => void;
  onPass: () => void;
}

export function PurchaseModal({ propertyId, price, state, onBuy, onPass }: PurchaseModalProps) {
  const modalMotion = useModalMotion();
  const asset = GameEngine.getProperty(propertyId);
  const player = GameEngine.getCurrentPlayer(state);
  const afterCash = player.cash - price;
  const canAfford = player.cash >= price;

  return (
    <motion.div className={styles.overlay} {...modalMotion.overlay}>
      <motion.div className={styles.sheet} {...modalMotion.card}>
        {asset.type === 'street' && (
          <div className={styles.colourBand} style={{ background: COLOUR_GROUP_VAR[asset.colourGroup] }} />
        )}

        <div className={styles.header}>
          <h1 className={styles.propertyName}>{asset.name}</h1>
          <p className={styles.propertyType}>
            {asset.type === 'street'
              ? COLOUR_GROUP_LABEL[asset.colourGroup]
              : asset.type === 'station'
                ? 'STATION'
                : 'UTILITY'}
          </p>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>PURCHASE PRICE</span>
          <span className={styles.priceValue}>${price}</span>
        </div>

        {asset.type === 'street' && (
          <div className={styles.rentTable}>
            <div className={styles.rentRow}>
              <span>Base Rent</span>
              <span>${asset.baseRent}</span>
            </div>
            {asset.rentWithHouses.map((rent, i) => (
              <div className={styles.rentRow} key={i}>
                <span>{i + 1} House{i > 0 ? 's' : ''}</span>
                <span>${rent}</span>
              </div>
            ))}
            <div className={styles.rentRow}>
              <span>Hotel</span>
              <span>${asset.rentWithHotel}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.rentRow}>
              <span>House Cost</span>
              <span>${asset.houseCost}</span>
            </div>
          </div>
        )}

        {asset.type === 'station' && (
          <div className={styles.rentTable}>
            <div className={styles.rentRow}><span>1 Station</span><span>$25</span></div>
            <div className={styles.rentRow}><span>2 Stations</span><span>$50</span></div>
            <div className={styles.rentRow}><span>3 Stations</span><span>$100</span></div>
            <div className={styles.rentRow}><span>4 Stations</span><span>$200</span></div>
          </div>
        )}

        {asset.type === 'utility' && (
          <div className={styles.rentTable}>
            <div className={styles.rentRow}><span>1 Owned</span><span>4× dice</span></div>
            <div className={styles.rentRow}><span>2 Owned</span><span>10× dice</span></div>
          </div>
        )}

        <div className={styles.cashInfo}>
          <div className={styles.rentRow}>
            <span>Your Cash</span>
            <span>${player.cash.toLocaleString()}</span>
          </div>
          <div className={styles.rentRow}>
            <span>After Purchase</span>
            <span style={{ color: afterCash < 200 ? 'var(--colour-warning)' : 'var(--colour-text)' }}>
              ${afterCash.toLocaleString()}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={onBuy} disabled={!canAfford} tooltip="Insufficient cash">
            BUY FOR ${price}
          </Button>
          <Button variant="ghost" onClick={onPass}>
            PASS
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
