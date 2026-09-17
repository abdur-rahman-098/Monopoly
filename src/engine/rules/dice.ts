import type { DiceRoll, GameState } from '@/engine/models/types';

export function rollDice(): DiceRoll {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const isDouble = die1 === die2;
  const isSpecialDouble = die1 === 6 && die2 === 6;
  return {
    die1,
    die2,
    total: die1 + die2,
    isDouble,
    isSpecialDouble,
  };
}

export function resolveDiceOutcome(roll: DiceRoll, state: GameState): GameState {
  if (roll.isSpecialDouble) {
    return {
      ...state,
      lastDiceRoll: roll,
      pendingAction: { type: 'forced-reroll' },
    };
  }

  return {
    ...state,
    lastDiceRoll: roll,
    turnPhase: 'moving',
    pendingAction: null,
  };
}
