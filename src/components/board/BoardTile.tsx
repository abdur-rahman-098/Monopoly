import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { BoardSpace, OwnershipRecord } from '@/engine';
import { GameEngine } from '@/engine';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import { COLOUR_GROUP_VAR, PLAYER_COLOUR_VAR } from './colourGroup';
import { getTileLayout } from './layout';
import styles from './BoardTile.module.css';

const SPECIAL_LABELS: Partial<Record<BoardSpace['type'], { symbol: string; label?: string }>> = {
  go: { symbol: 'GO', label: 'COLLECT $200' },
  'jail-visiting': { symbol: 'JAIL', label: 'JUST VISITING' },
  'free-parking': { symbol: 'FREE', label: 'PARKING' },
  'go-to-jail': { symbol: 'GO TO', label: 'JAIL' },
  chance: { symbol: '?' },
  'community-chest': { symbol: 'CC' },
  'income-tax': { symbol: 'TAX', label: '$200' },
  'super-tax': { symbol: 'TAX', label: '$100' },
};

interface BoardTileProps {
  space: BoardSpace;
  ownership?: OwnershipRecord | undefined;
  onClick: () => void;
  /** Increments each time a token passes GO here; a new value replays the +$200 flash. */
  goFlashKey: number;
  /** Delay (seconds) before this tile's ownership visuals fade out — staggers the bankruptcy wave. */
  releaseDelay: number;
}

const HOTEL = 5;

export function BoardTile({ space, ownership, onClick, goFlashKey, releaseDelay }: BoardTileProps) {
  const t = useAnimationTiming();
  const layout = getTileLayout(space.index);
  const asset = space.propertyId ? GameEngine.getProperty(space.propertyId) : null;
  const isStreet = asset?.type === 'street';
  const isMortgaged = ownership?.isMortgaged ?? false;
  const ownerId = ownership && ownership.ownerId !== 'bank' ? ownership.ownerId : null;
  const buildings = ownership && !isMortgaged ? ownership.buildings : 0;

  // Remember the previous building count so a hotel upgrade can sequence
  // houses-out → hotel-in, and a hotel sale can do the reverse.
  const [prevBuildings, setPrevBuildings] = useState(buildings);
  const [buildingChange, setBuildingChange] = useState<'none' | 'to-hotel' | 'from-hotel'>('none');
  if (prevBuildings !== buildings) {
    setPrevBuildings(buildings);
    setBuildingChange(buildings === HOTEL ? 'to-hotel' : prevBuildings === HOTEL ? 'from-hotel' : 'none');
  }

  const houseCount = buildings > 0 && buildings < HOTEL ? buildings : 0;
  const springIn = {
    type: 'spring' as const,
    bounce: 0.45,
    visualDuration: t.s('housePlace'),
    delay: buildingChange === 'from-hotel' ? t.s('buildingSell') : 0,
  };
  const houseExit = {
    scale: 0,
    opacity: 0,
    transition: {
      duration: buildingChange === 'to-hotel' ? t.s('hotelHousesOut') : t.s('buildingSell'),
      delay: releaseDelay,
      ease: 'easeIn' as const,
    },
  };

  const tileClasses = [
    styles.tile,
    layout.side === 'corner' ? styles.corner : styles[layout.side],
    space.propertyId ? styles.interactive : '',
  ].join(' ');

  return (
    <button
      type="button"
      className={tileClasses}
      style={{ gridRow: layout.row, gridColumn: layout.col }}
      onClick={onClick}
      data-tile={space.index}
    >
      {isStreet && asset && asset.type === 'street' && (
        <div
          className={[styles.strip, styles[`strip-${layout.side}`]].join(' ')}
          style={{ background: COLOUR_GROUP_VAR[asset.colourGroup] }}
        />
      )}

      <div className={styles.body}>
        {layout.side === 'corner' ? (
          <>
            <span className={styles.cornerSymbol}>{SPECIAL_LABELS[space.type]?.symbol ?? space.name}</span>
            {SPECIAL_LABELS[space.type]?.label && (
              <span className={styles.cornerLabel}>{SPECIAL_LABELS[space.type]!.label}</span>
            )}
          </>
        ) : space.propertyId ? (
          <>
            <span className={styles.name}>{space.name}</span>
            {asset && <span className={styles.price}>${asset.buyPrice}</span>}
          </>
        ) : (
          <>
            <span className={styles.specialSymbol}>{SPECIAL_LABELS[space.type]?.symbol ?? space.name}</span>
            <span className={styles.specialLabel}>{space.name}</span>
          </>
        )}
      </div>

      <AnimatePresence>
        {isMortgaged && (
          <motion.div
            key="mortgaged"
            className={styles.mortgageOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: t.s('mortgage'), ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: t.s('mortgage'), delay: releaseDelay, ease: 'easeOut' } }}
          >
            <span className={styles.mortgagedLabel}>MORTGAGED</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ownerId && (
          <motion.div
            key={ownerId}
            className={styles.ownerBar}
            style={{ background: PLAYER_COLOUR_VAR[ownerId] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: t.s('propertyPurchase'), ease: 'easeOut' } }}
            exit={{
              opacity: 0,
              transition: { duration: t.s('bankruptTileFade'), delay: releaseDelay, ease: 'easeOut' },
            }}
          />
        )}
      </AnimatePresence>

      <div className={styles.buildings}>
        <AnimatePresence>
          {Array.from({ length: houseCount }, (_, i) => (
            <motion.span
              key={`house-${i}`}
              className={styles.house}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: springIn }}
              exit={houseExit}
            />
          ))}
          {buildings === HOTEL && (
            <motion.span
              key="hotel"
              className={styles.hotel}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: {
                  type: 'spring',
                  bounce: 0.45,
                  visualDuration: t.s('hotelIn'),
                  delay: buildingChange === 'to-hotel' ? t.s('hotelHousesOut') : 0,
                },
              }}
              exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: t.s('buildingSell'), delay: releaseDelay, ease: 'easeIn' },
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {goFlashKey > 0 && (
        <div key={goFlashKey} className={styles.goFlash}>
          +$200
        </div>
      )}
    </button>
  );
}
