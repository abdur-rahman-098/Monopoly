import { describe, expect, it } from 'vitest';
import { mortgageProperty, unmortgageProperty } from '@/engine/rules/mortgage';
import { calculateRent } from '@/engine/rules/rent';
import { makeTestState } from './testUtils';

describe('mortgage rules', () => {
  it('can mortgage an unmortgaged property with no buildings', () => {
    const state = makeTestState({
      ownership: (o) => ({ ...o, 'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' } }),
    });
    const result = mortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.ownership['old-kent-road']?.isMortgaged).toBe(true);
      expect(result.newState.players[0]?.cash).toBe(1500 + 30);
    }
  });

  it('cannot mortgage a property with houses', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 2 },
      }),
    });
    const result = mortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('cannot mortgage a property with a hotel', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 5 },
      }),
    });
    const result = mortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('cannot mortgage an already-mortgaged property', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
    });
    const result = mortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('mortgaged property produces $0 rent', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
    });
    const roll = { die1: 1, die2: 1, total: 2, isDouble: true, isSpecialDouble: false };
    expect(calculateRent('old-kent-road', roll, state)).toBe(0);
  });

  it('unmortgage costs exactly the mortgage value', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 100 } : p)),
    });
    const result = unmortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.players[0]?.cash).toBe(100 - 30);
      expect(result.newState.ownership['old-kent-road']?.isMortgaged).toBe(false);
    }
  });

  it('cannot unmortgage with insufficient cash', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 10 } : p)),
    });
    const result = unmortgageProperty('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });
});
