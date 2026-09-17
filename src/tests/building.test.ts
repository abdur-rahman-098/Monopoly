import { describe, expect, it } from 'vitest';
import { buyHouse, sellHotel, sellHouse, upgradeToHotel } from '@/engine/rules/building';
import { makeTestState } from './testUtils';

function withBrownGroupOwned(buildings1 = 0, buildings2 = 0) {
  return makeTestState({
    ownership: (o) => ({
      ...o,
      'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: buildings1 },
      'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1', buildings: buildings2 },
    }),
  });
}

describe('building rules', () => {
  it('buy house on complete colour group: allowed', () => {
    const state = withBrownGroupOwned();
    const result = buyHouse('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.ownership['old-kent-road']?.buildings).toBe(1);
    }
  });

  it('buy house without complete colour group: blocked', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    const result = buyHouse('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('buy house on already-hotelled property: blocked', () => {
    const state = withBrownGroupOwned(5, 0);
    const result = buyHouse('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('uneven building (0 houses on one, 3 on another in same group): allowed', () => {
    const state = withBrownGroupOwned(3, 0);
    const result = buyHouse('player-1', 'whitechapel-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.ownership['whitechapel-road']?.buildings).toBe(1);
      expect(result.newState.ownership['old-kent-road']?.buildings).toBe(3);
    }
  });

  it('buy multiple houses in one transaction: allowed', () => {
    let state = withBrownGroupOwned();
    const first = buyHouse('player-1', 'old-kent-road', state);
    expect(first.success).toBe(true);
    if (!first.success) return;
    state = first.newState;
    const second = buyHouse('player-1', 'old-kent-road', state);
    expect(second.success).toBe(true);
    if (second.success) {
      expect(second.newState.ownership['old-kent-road']?.buildings).toBe(2);
    }
  });

  it('hotel upgrade with exactly 4 houses: allowed, buildings set to 5', () => {
    const state = withBrownGroupOwned(4, 4);
    const result = upgradeToHotel('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.ownership['old-kent-road']?.buildings).toBe(5);
    }
  });

  it('hotel upgrade with fewer than 4 houses: blocked', () => {
    const state = withBrownGroupOwned(3, 4);
    const result = upgradeToHotel('player-1', 'old-kent-road', state);
    expect(result.success).toBe(false);
  });

  it('sell 1 house: refund equals houseCost', () => {
    const state = withBrownGroupOwned(1, 0);
    const result = sellHouse('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.cost).toBe(50);
      expect(result.newState.players[0]?.cash).toBe(1550);
    }
  });

  it('sell hotel: refund equals houseCost, buildings reset to 0 (not 4)', () => {
    const state = withBrownGroupOwned(5, 4);
    const result = sellHotel('player-1', 'old-kent-road', state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.ownership['old-kent-road']?.buildings).toBe(0);
      expect(result.cost).toBe(50);
    }
  });
});
