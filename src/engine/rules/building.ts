import { PURCHASABLE_BY_ID } from '@/engine/data/properties';
import type { GameState, PlayerId, Property } from '@/engine/models/types';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';
import { ownsCompleteColourGroup } from '@/engine/rules/rent';

export type BuildingActionResult =
  | { success: true; newState: GameState; cost: number }
  | { success: false; reason: string };

function getStreet(propertyId: string): Property {
  const asset = PURCHASABLE_BY_ID[propertyId];
  if (!asset || asset.type !== 'street') {
    throw new Error(`RULES: "${propertyId}" is not a street property.`);
  }
  return asset;
}

export function buyHouse(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult {
  const property = getStreet(propertyId);
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (!ownsCompleteColourGroup(playerId, property.colourGroup, state)) {
    return { success: false, reason: 'RULES: Player does not own the complete colour group.' };
  }
  if (record.buildings === 5) {
    return { success: false, reason: 'RULES: Property already has a hotel.' };
  }
  if (record.buildings >= 4) {
    return {
      success: false,
      reason: 'RULES: Cannot buy a 5th house — upgrade to a hotel instead.',
    };
  }
  if (player.cash < property.houseCost) {
    return { success: false, reason: 'RULES: Insufficient cash to buy a house.' };
  }

  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, buildings: record.buildings + 1 },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({ ...p, cash: p.cash - property.houseCost }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} built a house on ${property.name}.`,
    cashDelta: -property.houseCost,
  });

  return { success: true, newState, cost: property.houseCost };
}

export function upgradeToHotel(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult {
  const property = getStreet(propertyId);
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (record.buildings !== 4) {
    return {
      success: false,
      reason: `RULES: Cannot build hotel — property has ${record.buildings} houses. 4 required.`,
    };
  }
  if (player.cash < property.houseCost) {
    return { success: false, reason: 'RULES: Insufficient cash to upgrade to a hotel.' };
  }

  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, buildings: 5 },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({ ...p, cash: p.cash - property.houseCost }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} upgraded ${property.name} to a hotel.`,
    cashDelta: -property.houseCost,
  });

  return { success: true, newState, cost: property.houseCost };
}

export function sellHouse(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult {
  const property = getStreet(propertyId);
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (record.buildings < 1 || record.buildings > 4) {
    return { success: false, reason: 'RULES: Property has no houses to sell.' };
  }

  const refund = property.houseCost;
  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, buildings: record.buildings - 1 },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({ ...p, cash: p.cash + refund }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} sold a house on ${property.name}.`,
    cashDelta: refund,
  });

  return { success: true, newState, cost: refund };
}

export function sellHotel(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult {
  const property = getStreet(propertyId);
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (record.buildings !== 5) {
    return { success: false, reason: 'RULES: Property does not have a hotel.' };
  }

  const refund = property.houseCost;
  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, buildings: 0 },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({ ...p, cash: p.cash + refund }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} sold the hotel on ${property.name}.`,
    cashDelta: refund,
  });

  return { success: true, newState, cost: refund };
}
