import { PURCHASABLE_BY_ID } from '@/engine/data/properties';
import type { GameState, PlayerId } from '@/engine/models/types';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';

export function mortgageProperty(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): { success: true; newState: GameState } | { success: false; reason: string } {
  const asset = PURCHASABLE_BY_ID[propertyId];
  if (!asset) {
    throw new Error(`RULES: Unknown property id "${propertyId}".`);
  }
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (record.buildings > 0) {
    return { success: false, reason: 'RULES: Sell all buildings before mortgaging.' };
  }
  if (record.isMortgaged) {
    return { success: false, reason: 'RULES: Property is already mortgaged.' };
  }

  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, isMortgaged: true },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({
    ...p,
    cash: p.cash + asset.mortgageValue,
  }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} mortgaged ${asset.name}.`,
    cashDelta: asset.mortgageValue,
  });

  return { success: true, newState };
}

export function unmortgageProperty(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): { success: true; newState: GameState } | { success: false; reason: string } {
  const asset = PURCHASABLE_BY_ID[propertyId];
  if (!asset) {
    throw new Error(`RULES: Unknown property id "${propertyId}".`);
  }
  const record = state.ownership[propertyId];
  const player = getPlayer(playerId, state);

  if (!record || record.ownerId !== playerId) {
    return { success: false, reason: 'RULES: Player does not own this property.' };
  }
  if (!record.isMortgaged) {
    return { success: false, reason: 'RULES: Property is not mortgaged.' };
  }
  if (player.cash < asset.mortgageValue) {
    return { success: false, reason: 'RULES: Insufficient cash to unmortgage.' };
  }

  let newState: GameState = {
    ...state,
    ownership: {
      ...state.ownership,
      [propertyId]: { ...record, isMortgaged: false },
    },
  };
  newState = updatePlayer(playerId, newState, (p) => ({
    ...p,
    cash: p.cash - asset.mortgageValue,
  }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} unmortgaged ${asset.name}.`,
    cashDelta: -asset.mortgageValue,
  });

  return { success: true, newState };
}
