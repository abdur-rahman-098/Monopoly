import { PROPERTIES, PURCHASABLE_BY_ID, STATIONS, UTILITIES } from '@/engine/data/properties';
import type { ColourGroup, DiceRoll, GameState, PlayerId } from '@/engine/models/types';

export function ownsCompleteColourGroup(
  ownerId: PlayerId,
  colourGroup: ColourGroup,
  state: GameState
): boolean {
  const groupProperties = PROPERTIES.filter((p) => p.colourGroup === colourGroup);
  return groupProperties.every((p) => {
    const record = state.ownership[p.id];
    return record !== undefined && record.ownerId === ownerId;
  });
}

export function calculateRent(
  propertyId: string,
  landingRoll: DiceRoll,
  state: GameState
): number {
  const asset = PURCHASABLE_BY_ID[propertyId];
  if (!asset) {
    throw new Error(`RULES: Unknown property id "${propertyId}".`);
  }

  const record = state.ownership[propertyId];
  if (!record) {
    throw new Error(`RULES: No ownership record found for "${propertyId}".`);
  }

  if (record.isMortgaged) {
    return 0;
  }

  if (record.ownerId === 'bank') {
    return 0;
  }

  if (asset.type === 'street') {
    if (record.buildings === 5) {
      return asset.rentWithHotel;
    }
    if (record.buildings >= 1) {
      const rent = asset.rentWithHouses[record.buildings - 1];
      if (rent === undefined) {
        throw new Error(`RULES: Invalid building count ${record.buildings} on "${propertyId}".`);
      }
      return rent;
    }
    if (ownsCompleteColourGroup(record.ownerId, asset.colourGroup, state)) {
      return asset.baseRent * 2;
    }
    return asset.baseRent;
  }

  if (asset.type === 'station') {
    const ownedStations = STATIONS.filter(
      (s) => state.ownership[s.id]?.ownerId === record.ownerId
    ).length;
    const rentTable: Record<number, number> = { 1: 25, 2: 50, 3: 100, 4: 200 };
    return rentTable[ownedStations] ?? 0;
  }

  if (asset.type === 'utility') {
    const ownedUtilities = UTILITIES.filter(
      (u) => state.ownership[u.id]?.ownerId === record.ownerId
    ).length;
    if (ownedUtilities >= 2) {
      return landingRoll.total * 10;
    }
    return landingRoll.total * 4;
  }

  throw new Error(`RULES: Unknown purchasable type for "${propertyId}".`);
}
