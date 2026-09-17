import type { ColourGroup, GameState, PlayerId } from '@/engine';
import { GameEngine, PROPERTIES, STATIONS, UTILITIES } from '@/engine';
import { COLOUR_GROUP_LABEL, COLOUR_GROUP_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import styles from './PortfolioPanel.module.css';

interface PortfolioPanelProps {
  state: GameState;
  playerId: PlayerId;
  isCurrentPlayer: boolean;
  onClose: () => void;
  onBuildHouse?: (propertyId: string) => void;
  onBuildHotel?: (propertyId: string) => void;
  onSellHouse?: (propertyId: string) => void;
  onSellHotel?: (propertyId: string) => void;
  onMortgage?: (propertyId: string) => void;
  onUnmortgage?: (propertyId: string) => void;
}

interface GroupedProperty {
  id: string;
  name: string;
  type: 'street' | 'station' | 'utility';
  colourGroup?: ColourGroup | undefined;
  buildings: number;
  isMortgaged: boolean;
  canBuild: boolean;
  canSellBuilding: boolean;
  canMortgage: boolean;
  canUnmortgage: boolean;
}

function buildingLabel(buildings: number): string {
  if (buildings === 5) return 'HOTEL';
  if (buildings > 0) return `${buildings} HOUSE${buildings > 1 ? 'S' : ''}`;
  return '—';
}

export function PortfolioPanel({
  state,
  playerId,
  isCurrentPlayer,
  onClose,
  onBuildHouse,
  onBuildHotel,
  onSellHouse,
  onSellHotel,
  onMortgage,
  onUnmortgage,
}: PortfolioPanelProps) {
  const player = state.players.find((p) => p.id === playerId);

  const allAssets = [...PROPERTIES, ...STATIONS, ...UTILITIES];
  const owned: GroupedProperty[] = allAssets
    .filter((a) => state.ownership[a.id]?.ownerId === playerId)
    .map((a) => {
      const record = state.ownership[a.id]!;
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        colourGroup: a.type === 'street' ? a.colourGroup : undefined,
        buildings: record.buildings,
        isMortgaged: record.isMortgaged,
        canBuild: a.type === 'street' && GameEngine.canBuild(playerId, a.id, state),
        canSellBuilding: record.buildings > 0,
        canMortgage: GameEngine.canMortgage(playerId, a.id, state),
        canUnmortgage: record.isMortgaged && (player?.cash ?? 0) >= a.mortgageValue,
      };
    });

  const groups = new Map<string, GroupedProperty[]>();
  for (const prop of owned) {
    const key = prop.colourGroup ?? prop.type;
    const list = groups.get(key) ?? [];
    list.push(prop);
    groups.set(key, list);
  }

  const colourGroupOrder: string[] = ['brown', 'light-blue', 'pink', 'orange', 'red', 'yellow', 'green', 'dark-blue', 'station', 'utility'];
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => colourGroupOrder.indexOf(a) - colourGroupOrder.indexOf(b)
  );

  function isCompleteGroup(key: string): boolean {
    const groupProps = PROPERTIES.filter((p) => p.colourGroup === key);
    if (groupProps.length === 0) return false;
    return groupProps.every((p) => state.ownership[p.id]?.ownerId === playerId);
  }

  return (
    <Modal onClose={onClose}>
      <h1 className="text-h1" style={{ marginBottom: 4 }}>{player?.name ?? 'Portfolio'}</h1>
      <p className="text-label" style={{ color: 'var(--colour-text-muted)', marginBottom: 16 }}>
        {owned.length} PROPERTIES · ${player?.cash.toLocaleString() ?? 0} CASH
      </p>

      {owned.length === 0 && (
        <p className={styles.empty}>No properties owned.</p>
      )}

      <div className={styles.groups}>
        {sortedKeys.map((key) => {
          const props = groups.get(key)!;
          const isColour = COLOUR_GROUP_LABEL[key as ColourGroup] !== undefined;
          const groupLabel = isColour
            ? COLOUR_GROUP_LABEL[key as ColourGroup]
            : key === 'station' ? 'STATIONS' : 'UTILITIES';
          const groupColour = isColour ? COLOUR_GROUP_VAR[key as ColourGroup] : undefined;
          const complete = isColour && isCompleteGroup(key);

          return (
            <div key={key} className={styles.group}>
              <div className={styles.groupHeader}>
                {groupColour && <span className={styles.groupBand} style={{ background: groupColour }} />}
                <span className={styles.groupName}>{groupLabel}</span>
                {complete && <span className={styles.completeBadge}>COMPLETE GROUP</span>}
                {!complete && isColour && (
                  <span className={styles.incompleteBadge}>{props.length} OWNED</span>
                )}
              </div>
              {props.map((prop) => (
                <div key={prop.id} className={styles.propRow}>
                  <div className={styles.propInfo}>
                    <span className={styles.propName}>{prop.name}</span>
                    <span className={styles.propBuildings}>
                      {prop.isMortgaged ? (
                        <span style={{ color: 'var(--colour-warning)' }}>MORTGAGED</span>
                      ) : prop.type === 'street' ? (
                        buildingLabel(prop.buildings)
                      ) : null}
                    </span>
                  </div>
                  {isCurrentPlayer && (
                    <div className={styles.propActions}>
                      {prop.canBuild && prop.buildings < 4 && onBuildHouse && (
                        <Button variant="primary" onClick={() => onBuildHouse(prop.id)}>BUILD</Button>
                      )}
                      {prop.canBuild && prop.buildings === 4 && onBuildHotel && (
                        <Button variant="primary" onClick={() => onBuildHotel(prop.id)}>HOTEL</Button>
                      )}
                      {prop.canSellBuilding && prop.buildings <= 4 && prop.buildings > 0 && onSellHouse && (
                        <Button variant="secondary" onClick={() => onSellHouse(prop.id)}>SELL</Button>
                      )}
                      {prop.canSellBuilding && prop.buildings === 5 && onSellHotel && (
                        <Button variant="secondary" onClick={() => onSellHotel(prop.id)}>SELL</Button>
                      )}
                      {prop.canMortgage && onMortgage && (
                        <Button variant="secondary" onClick={() => onMortgage(prop.id)}>MORTGAGE</Button>
                      )}
                      {prop.canUnmortgage && onUnmortgage && (
                        <Button variant="secondary" onClick={() => onUnmortgage(prop.id)}>UNMORTGAGE</Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" onClick={onClose}>CLOSE</Button>
      </div>
    </Modal>
  );
}
