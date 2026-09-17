import { describe, expect, it } from 'vitest';
import { attemptJailEscape, payJailFine, sendToJail, useGetOutOfJailFreeCard } from '@/engine/rules/jail';
import type { DiceRoll } from '@/engine/models/types';
import { GameEngine } from '@/engine/GameEngine';
import { makeTestState } from './testUtils';

function jailed(jailTurnsUsed: number, cash = 1500) {
  return makeTestState({
    players: (s) =>
      s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true, jailTurnsUsed, cash } : p)),
  });
}

function roll(die1: number, die2: number): DiceRoll {
  return {
    die1,
    die2,
    total: die1 + die2,
    isDouble: die1 === die2,
    isSpecialDouble: die1 === 6 && die2 === 6,
  };
}

describe('jail rules', () => {
  it('sent to jail via Go To Jail space: position = 10, isInJail = true, no $200', () => {
    const state = makeTestState();
    const newState = sendToJail('player-1', state);
    expect(newState.players[0]?.boardPosition).toBe(10);
    expect(newState.players[0]?.isInJail).toBe(true);
    expect(newState.players[0]?.cash).toBe(1500);
  });

  it('send to jail from position 35 (station): no GO money', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 35 } : p)),
    });
    const newState = sendToJail('player-1', state);
    expect(newState.players[0]?.boardPosition).toBe(10);
    expect(newState.players[0]?.cash).toBe(1500);
  });

  it('normal double escape: isInJail = false, player moves', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const { escaped, newState } = attemptJailEscape('player-1', roll(3, 3), state);
    expect(escaped).toBe(true);
    expect(newState.players[0]?.isInJail).toBe(false);
  });

  it('entering jail resets the attempt counter', () => {
    const newState = sendToJail('player-1', jailed(2));
    expect(newState.players[0]?.jailTurnsUsed).toBe(0);
  });

  it('failed attempt 1 and 2 increment jailTurnsUsed and keep the player jailed', () => {
    const first = attemptJailEscape('player-1', roll(2, 5), jailed(0)).newState;
    expect(first.players[0]?.jailTurnsUsed).toBe(1);
    expect(first.players[0]?.isInJail).toBe(true);
    const second = attemptJailEscape('player-1', roll(1, 3), jailed(1)).newState;
    expect(second.players[0]?.jailTurnsUsed).toBe(2);
    expect(second.players[0]?.isInJail).toBe(true);
    expect(second.turnPhase).toBe('turn-ended');
  });

  it('6+6 in jail counts as an attempt', () => {
    const { newState } = attemptJailEscape('player-1', roll(6, 6), jailed(1));
    expect(newState.players[0]?.jailTurnsUsed).toBe(2);
    expect(newState.players[0]?.isInJail).toBe(true);
    expect(newState.pendingAction).toEqual({ type: 'forced-reroll' });
  });

  it('third failed attempt: $50 auto-deducted, released, awaiting move with that roll', () => {
    const { escaped, newState } = attemptJailEscape('player-1', roll(2, 5), jailed(2));
    expect(escaped).toBe(false);
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.players[0]?.jailTurnsUsed).toBe(0);
    expect(newState.players[0]?.cash).toBe(1450);
    expect(newState.pendingAction).toEqual({ type: 'jail-fine-applied', amount: 50, roll: roll(2, 5) });

    const moving = GameEngine.proceedAfterJailRelease(newState);
    expect(moving.turnPhase).toBe('moving');
    expect(moving.lastDiceRoll).toEqual(roll(2, 5));
    expect(moving.pendingAction).toBeNull();
  });

  it('third attempt as 6+6: released and fined, then rolls normally instead of moving', () => {
    const { newState } = attemptJailEscape('player-1', roll(6, 6), jailed(2));
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.players[0]?.cash).toBe(1450);
    const next = GameEngine.proceedAfterJailRelease(newState);
    expect(next.turnPhase).toBe('awaiting-roll');
    expect(next.pendingAction).toBeNull();
  });

  it('third failed attempt without $50: liquidation flow first, then the move resumes', () => {
    const { newState } = attemptJailEscape('player-1', roll(2, 5), jailed(2, 30));
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.players[0]?.cash).toBe(30);
    expect(newState.turnPhase).toBe('awaiting-bankruptcy-resolution');
    expect(newState.pendingAction).toMatchObject({ type: 'bankruptcy-resolution', amountOwed: 50, creditorId: 'bank' });

    const liquidated = { ...newState, players: newState.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 130 } : p)) };
    const settled = GameEngine.payObligation(liquidated);
    expect(settled.players[0]?.cash).toBe(80);
    expect(settled.pendingAction).toEqual({ type: 'jail-fine-applied', amount: 50, roll: roll(2, 5) });
  });

  it('paying the fine or using a card clears the counter immediately', () => {
    expect(payJailFine('player-1', jailed(2)).players[0]?.jailTurnsUsed).toBe(0);
    const withCard = makeTestState({
      players: (s) =>
        s.players.map((p) =>
          p.id === 'player-1' ? { ...p, isInJail: true, jailTurnsUsed: 2, getOutOfJailFreeCards: 1 } : p
        ),
    });
    expect(useGetOutOfJailFreeCard('player-1', withCard, 'chance').players[0]?.jailTurnsUsed).toBe(0);
  });

  it('6+6 in jail: still in jail, forced reroll', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const { escaped, newState } = attemptJailEscape('player-1', roll(6, 6), state);
    expect(escaped).toBe(false);
    expect(newState.players[0]?.isInJail).toBe(true);
    expect(newState.pendingAction).toEqual({ type: 'forced-reroll' });
  });

  it('non-double in jail: still in jail, turn ends', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const { escaped, newState } = attemptJailEscape('player-1', roll(2, 5), state);
    expect(escaped).toBe(false);
    expect(newState.players[0]?.isInJail).toBe(true);
    expect(newState.turnPhase).toBe('turn-ended');
  });

  it('pay $50: isInJail = false, cash deducted', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, isInJail: true } : p)),
    });
    const newState = payJailFine('player-1', state);
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.players[0]?.cash).toBe(1450);
  });

  it('use GOOJF card: isInJail = false, card count decremented, card returned to deck', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) =>
          p.id === 'player-1' ? { ...p, isInJail: true, getOutOfJailFreeCards: 1 } : p
        ),
      state: { chanceDeck: [] },
    });
    const newState = useGetOutOfJailFreeCard('player-1', state, 'chance');
    expect(newState.players[0]?.isInJail).toBe(false);
    expect(newState.players[0]?.getOutOfJailFreeCards).toBe(0);
    expect(newState.chanceDeck.some((c) => c.effect.kind === 'get-out-of-jail-free')).toBe(true);
  });
});
