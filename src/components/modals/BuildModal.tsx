import type { ColourGroup, GameState, PlayerId } from '@/engine';
import { GameEngine, PROPERTIES } from '@/engine';
import { COLOUR_GROUP_LABEL, COLOUR_GROUP_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import styles from './BuildModal.module.css';

interface BuildModalProps {
  state: GameState;
  playerId: PlayerId;
  onClose: () => void;
  onBuildHouse: (propertyId: string) => void;
  onBuildHotel: (propertyId: string) => void;
  onSellHouse: (propertyId: string) => void;
  onSellHotel: (propertyId: string) => void;
}

function buildingLabel(buildings: number): string {
  if (buildings === 5) return 'HOTEL';
  if (buildings === 0) return 'VACANT';
  return `${buildings}H`;
}

export function BuildModal({
  state,
  playerId,
  onClose,
  onBuildHouse,
  onBuildHotel,
  onSellHouse,
  onSellHotel,
}: BuildModalProps) {
  const player = state.players.find((p) => p.id === playerId);
  const owned = PROPERTIES.filter((property) => state.ownership[property.id]?.ownerId === playerId);

  const groups = new Map<ColourGroup, typeof owned>();
  for (const prop of owned) {
    const list = groups.get(prop.colourGroup) ?? [];
    list.push(prop);
    groups.set(prop.colourGroup, list);
  }

  const colourOrder: ColourGroup[] = ['brown', 'light-blue', 'pink', 'orange', 'red', 'yellow', 'green', 'dark-blue'];
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => colourOrder.indexOf(a) - colourOrder.indexOf(b)
  );

  return (
    <Modal onClose={onClose}>
      <h1 className={styles.title}>BUILD</h1>
      <p className={styles.subtitle}>
        Cash: ${player?.cash.toLocaleString() ?? 0}
      </p>

      <div className={styles.groups}>
        {owned.length === 0 && <p className={styles.empty}>You do not own any streets.</p>}

        {sortedKeys.map((group) => {
          const props = groups.get(group)!;
          const groupColour = COLOUR_GROUP_VAR[group];
          const isComplete = PROPERTIES.filter((p) => p.colourGroup === group)
            .every((p) => state.ownership[p.id]?.ownerId === playerId);

          return (
            <div key={group} className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={styles.groupBand} style={{ background: groupColour }} />
                <span className={styles.groupName}>{COLOUR_GROUP_LABEL[group]}</span>
                {isComplete ? (
                  <span className={styles.completeBadge}>COMPLETE</span>
                ) : (
                  <span className={styles.incompleteBadge}>INCOMPLETE</span>
                )}
              </div>

              {props.map((property) => {
                const record = state.ownership[property.id];
                const buildings = record?.buildings ?? 0;
                const canBuild = GameEngine.canBuild(playerId, property.id, state);
                const canSell = buildings > 0;

                return (
                  <div className={styles.row} key={property.id}>
                    <div className={styles.info}>
                      <span className={styles.propName}>{property.name}</span>
                      <span className={styles.propStatus}>
                        {buildingLabel(buildings)}
                        {record?.isMortgaged ? ' · MORTGAGED' : ''}
                        {canBuild ? ` · $${property.houseCost}` : ''}
                      </span>
                    </div>
                    <div className={styles.controls}>
                      <button
                        className={styles.controlBtn}
                        onClick={() => {
                          if (buildings === 5) onSellHotel(property.id);
                          else onSellHouse(property.id);
                        }}
                        disabled={!canSell}
                        title="Sell building"
                      >
                        −
                      </button>
                      <span className={styles.buildCount}>{buildings}</span>
                      <button
                        className={styles.controlBtn}
                        onClick={() => {
                          if (buildings === 4) onBuildHotel(property.id);
                          else onBuildHouse(property.id);
                        }}
                        disabled={!canBuild}
                        title={buildings === 4 ? 'Build hotel' : 'Build house'}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
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
