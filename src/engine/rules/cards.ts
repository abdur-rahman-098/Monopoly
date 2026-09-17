import { PURCHASABLE_BY_ID, STATIONS, UTILITIES } from '@/engine/data/properties';
import type { Card, CardDeckType, GameState, PlayerId, Station, Utility } from '@/engine/models/types';
import { addLogEntry, getPlayer, otherActivePlayers, updatePlayer } from '@/engine/rules/helpers';
import { sendToJail } from '@/engine/rules/jail';
import { movePlayer, movePlayerToPosition } from '@/engine/rules/movement';
import { calculateRent } from '@/engine/rules/rent';

/**
 * Deducts `amount` from the player if they can afford it; otherwise leaves
 * cash untouched and escalates the turn into the bankruptcy-resolution flow
 * so the player can liquidate assets (or declare bankruptcy) before the
 * obligation is settled by `GameEngine.payObligation`.
 */
function payOrEscalate(
  playerId: PlayerId,
  amount: number,
  description: string,
  state: GameState
): GameState {
  const player = getPlayer(playerId, state);
  const loggedState = addLogEntry(state, { playerId, description });

  if (player.cash >= amount) {
    let newState = updatePlayer(playerId, loggedState, (p) => ({ ...p, cash: p.cash - amount }));
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} paid $${amount}.`,
      cashDelta: -amount,
    });
    return newState;
  }

  return {
    ...loggedState,
    turnPhase: 'awaiting-bankruptcy-resolution',
    pendingAction: { type: 'bankruptcy-resolution', amountOwed: amount, creditorId: 'bank' },
  };
}

function findNearest(list: Array<Station | Utility>, fromPosition: number): Station | Utility {
  const sorted = [...list].sort((a, b) => a.boardIndex - b.boardIndex);
  const next = sorted.find((asset) => asset.boardIndex > fromPosition);
  const target = next ?? sorted[0];
  if (!target) {
    throw new Error('RULES: No stations/utilities are configured on the board.');
  }
  return target;
}

/**
 * Moves the player to the nearest station/utility ahead of their current
 * position (wrapping past GO if necessary), then resolves the landing:
 * unowned → purchase decision; owned by another player → rent (doubled for
 * stations, 10x the dice total for utilities, regardless of how many the
 * owner holds); owned by the player themselves → nothing further.
 */
function resolveNearestLanding(
  playerId: PlayerId,
  kind: 'station' | 'utility',
  state: GameState
): GameState {
  const player = getPlayer(playerId, state);
  const list = kind === 'station' ? STATIONS : UTILITIES;
  const target = findNearest(list, player.boardPosition);

  const movedState = movePlayerToPosition(playerId, target.boardIndex, state, true);
  const record = movedState.ownership[target.id];
  if (!record) {
    throw new Error(`RULES: No ownership record for "${target.id}".`);
  }

  if (record.ownerId === 'bank') {
    return {
      ...movedState,
      turnPhase: 'awaiting-purchase-decision',
      pendingAction: { type: 'purchase-decision', propertyId: target.id, price: target.buyPrice },
    };
  }

  if (record.ownerId === playerId) {
    return movedState;
  }

  const roll = movedState.lastDiceRoll ?? {
    die1: 1,
    die2: 1,
    total: 2,
    isDouble: true,
    isSpecialDouble: false,
  };
  const rent =
    kind === 'station'
      ? calculateRent(target.id, roll, movedState) * 2
      : roll.total * 10;

  const owner = getPlayer(record.ownerId, movedState);

  if (player.cash >= rent) {
    let newState = updatePlayer(playerId, movedState, (p) => ({ ...p, cash: p.cash - rent }));
    newState = updatePlayer(record.ownerId, newState, (p) => ({ ...p, cash: p.cash + rent }));
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} paid $${rent} rent to ${owner.name} for ${target.name}.`,
      cashDelta: -rent,
    });
    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  const loggedState = addLogEntry(movedState, {
    playerId,
    description: `${player.name} owes ${owner.name} $${rent} rent for ${target.name}.`,
  });
  return {
    ...loggedState,
    turnPhase: 'awaiting-bankruptcy-resolution',
    pendingAction: { type: 'bankruptcy-resolution', amountOwed: rent, creditorId: record.ownerId },
  };
}

export function drawCard(deckType: CardDeckType, state: GameState): { card: Card; newState: GameState } {
  const deckKey = deckType === 'chance' ? 'chanceDeck' : 'communityChestDeck';
  const deck = state[deckKey];
  const card = deck[0];
  if (!card) {
    throw new Error(`RULES: The ${deckType} deck is empty.`);
  }

  const isGoojf = card.effect.kind === 'get-out-of-jail-free';
  const remaining = deck.slice(1);
  const newDeck = isGoojf ? remaining : [...remaining, card];

  const newState: GameState = { ...state, [deckKey]: newDeck };

  return { card, newState };
}

export function executeCardEffect(card: Card, playerId: PlayerId, state: GameState): GameState {
  const player = getPlayer(playerId, state);
  const effect = card.effect;

  switch (effect.kind) {
    case 'move-to': {
      const newState = movePlayerToPosition(playerId, effect.destinationIndex, state, effect.collectGoIfPassed);
      return addLogEntry(newState, {
        playerId,
        description: `${player.name} drew: ${card.text}`,
      });
    }
    case 'move-relative': {
      const { newState } = movePlayer(playerId, effect.spaces, state);
      return addLogEntry(newState, {
        playerId,
        description: `${player.name} drew: ${card.text}`,
      });
    }
    case 'collect': {
      let newState = updatePlayer(playerId, state, (p) => ({ ...p, cash: p.cash + effect.amount }));
      newState = addLogEntry(newState, {
        playerId,
        description: `${player.name} drew: ${card.text}`,
        cashDelta: effect.amount,
      });
      return newState;
    }
    case 'pay': {
      return payOrEscalate(playerId, effect.amount, `${player.name} drew: ${card.text}`, state);
    }
    case 'collect-from-each': {
      let newState = state;
      const others = otherActivePlayers(playerId, state);
      for (const other of others) {
        newState = updatePlayer(other.id, newState, (p) => ({ ...p, cash: p.cash - effect.amount }));
      }
      newState = updatePlayer(playerId, newState, (p) => ({
        ...p,
        cash: p.cash + effect.amount * others.length,
      }));
      newState = addLogEntry(newState, {
        playerId,
        description: `${player.name} drew: ${card.text}`,
        cashDelta: effect.amount * others.length,
      });
      return newState;
    }
    case 'pay-per-building': {
      let houses = 0;
      let hotels = 0;
      for (const record of Object.values(state.ownership)) {
        if (record.ownerId !== playerId) continue;
        const asset = PURCHASABLE_BY_ID[record.propertyId];
        if (!asset || asset.type !== 'street') continue;
        if (record.buildings === 5) hotels += 1;
        else houses += record.buildings;
      }
      const total = houses * effect.houseAmount + hotels * effect.hotelAmount;
      return payOrEscalate(playerId, total, `${player.name} drew: ${card.text}`, state);
    }
    case 'go-to-jail': {
      return sendToJail(playerId, state);
    }
    case 'get-out-of-jail-free': {
      let newState = updatePlayer(playerId, state, (p) => ({
        ...p,
        getOutOfJailFreeCards: p.getOutOfJailFreeCards + 1,
      }));
      newState = addLogEntry(newState, {
        playerId,
        description: `${player.name} drew: ${card.text}`,
      });
      return newState;
    }
    case 'move-to-nearest-station': {
      const newState = resolveNearestLanding(playerId, 'station', state);
      return addLogEntry(newState, { playerId, description: `${player.name} drew: ${card.text}` });
    }
    case 'move-to-nearest-utility': {
      const newState = resolveNearestLanding(playerId, 'utility', state);
      return addLogEntry(newState, { playerId, description: `${player.name} drew: ${card.text}` });
    }
  }
}
