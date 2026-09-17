import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { COLOUR_GROUP_LABEL, COLOUR_GROUP_VAR, PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { motion } from 'motion/react';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './PropertyDrawer.module.css';

interface PropertyDrawerProps {
  propertyId: string;
  state: GameState;
  onClose: () => void;
}

export function PropertyDrawer({ propertyId, state, onClose }: PropertyDrawerProps) {
  const asset = GameEngine.getProperty(propertyId);
  const record = state.ownership[propertyId];
  const owner = record ? state.players.find((p) => p.id === record.ownerId) : null;
  const ownerColour = owner ? PLAYER_COLOUR_VAR[owner.id] : undefined;
  const t = useAnimationTiming();
  const open = { duration: t.s('modalOpen'), ease: [0.4, 0, 0.2, 1] as const };
  const close = { duration: t.s('modalClose'), ease: [0.4, 0, 0.2, 1] as const };

  return (
    <>
      <motion.div
        className={styles.scrim}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: open }}
        exit={{ opacity: 0, transition: close }}
      />
      <motion.div
        className={styles.drawer}
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: open }}
        exit={{ x: '100%', transition: close }}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {asset.type === 'street' && (
          <div className={styles.colourBand} style={{ background: COLOUR_GROUP_VAR[asset.colourGroup] }} />
        )}

        <h1 className={styles.name}>{asset.name}</h1>
        <p className={styles.type}>
          {asset.type === 'street' ? COLOUR_GROUP_LABEL[asset.colourGroup] : asset.type === 'station' ? 'STATION' : 'UTILITY'}
        </p>

        <div className={styles.ownerSection}>
          {owner ? (
            <div className={styles.ownerTag}>
              <span className={styles.ownerDot} style={{ background: ownerColour }} />
              <span className={styles.ownerName}>{owner.name}</span>
            </div>
          ) : (
            <span className={styles.unowned}>UNOWNED</span>
          )}
          {record?.isMortgaged && (
            <span className={styles.mortgagedBadge}>MORTGAGED</span>
          )}
          {record && record.buildings > 0 && (
            <span className={styles.buildingBadge}>
              {record.buildings === 5 ? 'HOTEL' : `${record.buildings} HOUSE${record.buildings > 1 ? 'S' : ''}`}
            </span>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.row}>
          <span>Purchase Price</span>
          <span>${asset.buyPrice}</span>
        </div>

        {asset.type === 'street' && (
          <>
            <div className={styles.sectionLabel}>RENT SCHEDULE</div>
            <div className={`${styles.row} ${record?.buildings === 0 || !record ? styles.rowActive : ''}`}>
              <span>Base Rent</span>
              <span>${asset.baseRent}</span>
            </div>
            {asset.rentWithHouses.map((rent, i) => (
              <div key={i} className={`${styles.row} ${record?.buildings === i + 1 ? styles.rowActive : ''}`}>
                <span>{i + 1} House{i > 0 ? 's' : ''}</span>
                <span>${rent}</span>
              </div>
            ))}
            <div className={`${styles.row} ${record?.buildings === 5 ? styles.rowActive : ''}`}>
              <span>Hotel</span>
              <span>${asset.rentWithHotel}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <span>House Cost</span>
              <span>${asset.houseCost}</span>
            </div>
          </>
        )}

        {asset.type === 'station' && (
          <>
            <div className={styles.sectionLabel}>RENT SCHEDULE</div>
            <div className={styles.row}><span>1 Station</span><span>$25</span></div>
            <div className={styles.row}><span>2 Stations</span><span>$50</span></div>
            <div className={styles.row}><span>3 Stations</span><span>$100</span></div>
            <div className={styles.row}><span>4 Stations</span><span>$200</span></div>
          </>
        )}

        {asset.type === 'utility' && (
          <>
            <div className={styles.sectionLabel}>RENT SCHEDULE</div>
            <div className={styles.row}><span>1 Owned</span><span>4× dice</span></div>
            <div className={styles.row}><span>2 Owned</span><span>10× dice</span></div>
          </>
        )}

        <div className={styles.divider} />
        <div className={styles.row}>
          <span>Mortgage Value</span>
          <span>${asset.mortgageValue}</span>
        </div>
      </motion.div>
    </>
  );
}
