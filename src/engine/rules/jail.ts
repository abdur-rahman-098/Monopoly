import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '@/engine/data/cards';
import type { CardDeckType, DiceRoll, GameState, PlayerId } from '@/engine/models/types';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';

const JAIL_INDEX = 10;
export const JAIL_FINE = 50;
export const MAX_JAIL_ATTEMPTS = 3;

export function sendToJail(playerId: PlayerId, state: GameState): GameState {
  const player = getPlayer(playerId, state);

  let newState = updatePlayer(playerId, state, (p) => ({
    ...p,
    isInJail: true,
    jailTurnsUsed: 0,
    boardPosition: JAIL_INDEX,
  }));

  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} was sent to jail.`,
  });

  return { ...newState, turnPhase: 'turn-ended', pendingAction: null };
}

/**
 * Each failed roll-for-double (including a 6+6) uses one of the player's
 * MAX_JAIL_ATTEMPTS. A 6+6 still forces an immediate reroll, which is itself
 * another attempt. When the final attempt fails, the fine is taken
 * automatically and the player is released — see `applyAutomaticJailFine`.
 */
export function attemptJailEscape(
  playerId: PlayerId,
  roll: DiceRoll,
  state: GameState
): { escaped: boolean; newState: GameState } {
  const player = getPlayer(playerId, state);

  if (roll.isDouble && !roll.isSpecialDouble) {
    let newState = updatePlayer(playerId, state, (p) => ({ ...p, isInJail: false, jailTurnsUsed: 0 }));
    newState = { ...newState, lastDiceRoll: roll, turnPhase: 'moving', pendingAction: null };
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} rolled a double and escaped jail.`,
    });
    return { escaped: true, newState };
  }

  const attemptsUsed = player.jailTurnsUsed + 1;
  if (attemptsUsed >= MAX_JAIL_ATTEMPTS) {
    return { escaped: false, newState: applyAutomaticJailFine(playerId, roll, state) };
  }

  let newState = updatePlayer(playerId, state, (p) => ({ ...p, jailTurnsUsed: attemptsUsed }));
  newState = addLogEntry(
    { ...newState, lastDiceRoll: roll },
    {
      playerId,
      description: `${player.name} failed to roll a double (attempt ${attemptsUsed}/${MAX_JAIL_ATTEMPTS}).`,
    }
  );

  if (roll.isSpecialDouble) {
    return { escaped: false, newState: { ...newState, pendingAction: { type: 'forced-reroll' } } };
  }
  return { escaped: false, newState: { ...newState, turnPhase: 'turn-ended', pendingAction: null } };
}

/**
 * Third failed attempt: release the player and take the fine regardless of
 * whether they can afford it. If cash can't cover it, the standard
 * liquidation/bankruptcy flow runs first; settling that debt restores the
 * `jail-fine-applied` action so the turn's movement still happens.
 */
function applyAutomaticJailFine(playerId: PlayerId, roll: DiceRoll, state: GameState): GameState {
  const player = getPlayer(playerId, state);
  const released = { type: 'jail-fine-applied' as const, amount: JAIL_FINE, roll };

  let newState = updatePlayer(playerId, state, (p) => ({ ...p, isInJail: false, jailTurnsUsed: 0 }));
  newState = { ...newState, lastDiceRoll: roll };

  if (player.cash < JAIL_FINE) {
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} missed a third double and was released owing the $${JAIL_FINE} fine.`,
    });
    return {
      ...newState,
      turnPhase: 'awaiting-bankruptcy-resolution',
      pendingAction: {
        type: 'bankruptcy-resolution',
        amountOwed: JAIL_FINE,
        creditorId: 'bank',
        resumeAfter: released,
      },
    };
  }

  newState = updatePlayer(playerId, newState, (p) => ({ ...p, cash: p.cash - JAIL_FINE }));
  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} missed a third double — $${JAIL_FINE} was deducted and they were released.`,
    cashDelta: -JAIL_FINE,
  });
  return { ...newState, turnPhase: 'awaiting-roll', pendingAction: released };
}

export function payJailFine(playerId: PlayerId, state: GameState): GameState {
  const player = getPlayer(playerId, state);
  if (player.cash < JAIL_FINE) {
    throw new Error('RULES: Insufficient cash to pay the jail fine.');
  }

  let newState = updatePlayer(playerId, state, (p) => ({
    ...p,
    cash: p.cash - JAIL_FINE,
    isInJail: false,
    jailTurnsUsed: 0,
  }));

  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} paid $${JAIL_FINE} to leave jail.`,
    cashDelta: -JAIL_FINE,
  });

  return { ...newState, turnPhase: 'awaiting-roll', pendingAction: null };
}

/**
 * `deckType` identifies which deck's GOOJF card is being redeemed and returned
 * to the bottom. Player state only tracks a card count, not deck origin, so
 * the caller (GameEngine) supplies the deck the card came from. While held,
 * a GOOJF card is absent from its deck array (see cards.ts `drawCard`), so
 * it is looked up from the static deck definition rather than the live deck.
 */
export function useGetOutOfJailFreeCard(
  playerId: PlayerId,
  state: GameState,
  deckType: CardDeckType
): GameState {
  const player = getPlayer(playerId, state);
  if (player.getOutOfJailFreeCards < 1) {
    throw new Error('RULES: Player does not hold a Get Out of Jail Free card.');
  }

  let newState = updatePlayer(playerId, state, (p) => ({
    ...p,
    isInJail: false,
    jailTurnsUsed: 0,
    getOutOfJailFreeCards: p.getOutOfJailFreeCards - 1,
  }));

  const deckKey = deckType === 'chance' ? 'chanceDeck' : 'communityChestDeck';
  const sourceDeck = deckType === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
  const goojfCard = sourceDeck.find((c) => c.effect.kind === 'get-out-of-jail-free');
  if (goojfCard) {
    newState = { ...newState, [deckKey]: [...newState[deckKey], goojfCard] };
  }

  newState = addLogEntry(newState, {
    playerId,
    description: `${player.name} used a Get Out of Jail Free card.`,
  });

  return { ...newState, turnPhase: 'awaiting-roll', pendingAction: null };
}
