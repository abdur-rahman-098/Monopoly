import { PURCHASABLE_BY_ID } from '@/engine/data/properties';
import type { GameState, PlayerId } from '@/engine/models/types';
import { addLogEntry, getPlayer } from '@/engine/rules/helpers';

export function calculateLiquidationValue(playerId: PlayerId, state: GameState): number {
  const player = getPlayer(playerId, state);

  let buildingValue = 0;
  let mortgageValue = 0;

  for (const record of Object.values(state.ownership)) {
    if (record.ownerId !== playerId) continue;
    const asset = PURCHASABLE_BY_ID[record.propertyId];
    if (!asset) continue;

    if (asset.type === 'street') {
      if (record.buildings === 5) {
        buildingValue += asset.houseCost;
      } else {
        buildingValue += record.buildings * asset.houseCost;
      }
    }
    if (!record.isMortgaged) {
      mortgageValue += asset.mortgageValue;
    }
  }

  return player.cash + buildingValue + mortgageValue;
}

export function checkBankruptcy(
  playerId: PlayerId,
  amountOwed: number,
  state: GameState
): boolean {
  const player = getPlayer(playerId, state);
  if (player.cash >= amountOwed) {
    return false;
  }
  return calculateLiquidationValue(playerId, state) < amountOwed;
}

export function declareBankruptcy(playerId: PlayerId, state: GameState): GameState {
  const player = getPlayer(playerId, state);

  const newOwnership: GameState['ownership'] = { ...state.ownership };
  for (const [propertyId, record] of Object.entries(state.ownership)) {
    if (record.ownerId === playerId) {
      newOwnership[propertyId] = {
        ...record,
        ownerId: 'bank',
        isMortgaged: false,
        buildings: 0,
      };
    }
  }

  const bankruptPlayer = { ...player, status: 'bankrupt' as const };
  const remainingPlayers = state.players.filter((p) => p.id !== playerId);

  let newState: GameState = {
    ...state,
    ownership: newOwnership,
    players: remainingPlayers,
    eliminatedPlayers: [...state.eliminatedPlayers, bankruptPlayer],
  };

  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} declared bankruptcy. All properties returned to the bank.`,
  });
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} has been eliminated.`,
  });

  if (remainingPlayers.length === 1) {
    const winner = remainingPlayers[0];
    if (winner) {
      newState = {
        ...newState,
        gamePhase: 'game-over',
        winner: winner.id,
      };
      newState = addLogEntry(newState, {
        playerId: winner.id,
        description: `${winner.name} wins the game!`,
      });
    }
  }

  return newState;
}
