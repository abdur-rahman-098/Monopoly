import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '@/engine/data/cards';
import { ALL_PURCHASABLES } from '@/engine/data/properties';
import type { GameState, OwnershipRecord, Player } from '@/engine/models/types';

function baseOwnership(): Record<string, OwnershipRecord> {
  const ownership: Record<string, OwnershipRecord> = {};
  for (const asset of ALL_PURCHASABLES) {
    ownership[asset.id] = {
      propertyId: asset.id,
      ownerId: 'bank',
      isMortgaged: false,
      buildings: 0,
    };
  }
  return ownership;
}

function basePlayers(): Player[] {
  return [
    {
      id: 'player-1',
      name: 'Player One',
      tokenId: 'token-1',
      cash: 1500,
      boardPosition: 0,
      status: 'active',
      isInJail: false,
      jailTurnsUsed: 0,
      getOutOfJailFreeCards: 0,
    },
    {
      id: 'player-2',
      name: 'Player Two',
      tokenId: 'token-2',
      cash: 1500,
      boardPosition: 0,
      status: 'active',
      isInJail: false,
      jailTurnsUsed: 0,
      getOutOfJailFreeCards: 0,
    },
  ];
}

interface TestStateOverrides {
  players?: (players: GameState) => GameState['players'];
  ownership?: (ownership: Record<string, OwnershipRecord>) => Record<string, OwnershipRecord>;
  state?: Partial<GameState>;
}

export function makeTestState(overrides: TestStateOverrides = {}): GameState {
  const initial: GameState = {
    gameId: 'test-game',
    gamePhase: 'playing',
    players: basePlayers(),
    eliminatedPlayers: [],
    currentPlayerIndex: 0,
    turnPhase: 'awaiting-roll',
    ownership: baseOwnership(),
    lastDiceRoll: null,
    chanceDeck: [...CHANCE_CARDS],
    communityChestDeck: [...COMMUNITY_CHEST_CARDS],
    activeTradeProposal: null,
    pendingAction: null,
    log: [],
    winner: null,
  };

  let state = initial;
  if (overrides.players) {
    state = { ...state, players: overrides.players(state) };
  }
  if (overrides.ownership) {
    state = { ...state, ownership: overrides.ownership(state.ownership) };
  }
  if (overrides.state) {
    state = { ...state, ...overrides.state };
  }
  return state;
}
