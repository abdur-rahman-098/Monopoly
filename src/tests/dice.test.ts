import { describe, expect, it } from 'vitest';
import { resolveDiceOutcome } from '@/engine/rules/dice';
import { attemptJailEscape } from '@/engine/rules/jail';
import type { DiceRoll } from '@/engine/models/types';
import { makeTestState } from './testUtils';

function roll(die1: number, die2: number): DiceRoll {
  return {
    die1,
    die2,
    total: die1 + die2,
    isDouble: die1 === die2,
    isSpecialDouble: die1 === 6 && die2 === 6,
  };
}

describe('dice resolution', () => {
  it('normal roll (non-double): player moves, turn proceeds to moving', () => {
    const state = makeTestState();
    const result = resolveDiceOutcome(roll(2, 5), state);
    expect(result.turnPhase).toBe('moving');
    expect(result.pendingAction).toBeNull();
  });

  it('normal double (not 6+6): player moves, no forced extra roll', () => {
    const state = makeTestState();
    const result = resolveDiceOutcome(roll(3, 3), state);
    expect(result.turnPhase).toBe('moving');
    expect(result.pendingAction).toBeNull();
  });

  it('6+6: player does not move, pendingAction is forced-reroll', () => {
    const state = makeTestState();
    const result = resolveDiceOutcome(roll(6, 6), state);
    expect(result.pendingAction).toEqual({ type: 'forced-reroll' });
    expect(result.turnPhase).toBe('awaiting-roll');
  });

  it('6+6 chains: two consecutive 6+6 rolls both result in no movement', () => {
    const state = makeTestState();
    const first = resolveDiceOutcome(roll(6, 6), state);
    const second = resolveDiceOutcome(roll(6, 6), first);
    expect(second.pendingAction).toEqual({ type: 'forced-reroll' });
    expect(second.turnPhase).toBe('awaiting-roll');
  });

  it('6+6 followed by a normal roll: player moves on the normal roll', () => {
    const state = makeTestState();
    const first = resolveDiceOutcome(roll(6, 6), state);
    const second = resolveDiceOutcome(roll(4, 2), first);
    expect(second.turnPhase).toBe('moving');
    expect(second.pendingAction).toBeNull();
  });

  it('6+6 while in jail: no escape, pendingAction is forced-reroll', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const { escaped, newState } = attemptJailEscape('player-1', roll(6, 6), state);
    expect(escaped).toBe(false);
    expect(newState.pendingAction).toEqual({ type: 'forced-reroll' });
  });

  it('normal double while in jail: player escapes, moves by total', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const { escaped, newState } = attemptJailEscape('player-1', roll(4, 4), state);
    expect(escaped).toBe(true);
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.turnPhase).toBe('moving');
  });
});
