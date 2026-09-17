import { describe, expect, it } from 'vitest';
import { calculateRent } from '@/engine/rules/rent';
import type { DiceRoll } from '@/engine/models/types';
import { makeTestState } from './testUtils';

const roll7: DiceRoll = { die1: 3, die2: 4, total: 7, isDouble: false, isSpecialDouble: false };

describe('rent calculation', () => {
  it('unimproved street, no colour group ownership: base rent', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(2);
  });

  it('unimproved street, complete colour group: 2x base rent', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(4);
  });

  it('street with 1 house: exact 1H rent, no 2x multiplier', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1' },
      }),
      state: {},
    });
    const withHouse = {
      ...state,
      ownership: {
        ...state.ownership,
        'old-kent-road': { ...state.ownership['old-kent-road']!, buildings: 1 },
      },
    };
    expect(calculateRent('old-kent-road', roll7, withHouse)).toBe(10);
  });

  it('street with 4 houses: exact 4H rent', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 4 },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(160);
  });

  it('street with hotel: exact hotel rent', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 5 },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(250);
  });

  it('mortgaged street: $0', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(0);
  });

  it('own property: $0', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'bank' },
      }),
    });
    expect(calculateRent('old-kent-road', roll7, state)).toBe(0);
  });

  it('station: 1 owned -> $25; 4 owned -> $200', () => {
    const oneOwned = makeTestState({
      ownership: (o) => ({
        ...o,
        'kings-cross-station': { ...o['kings-cross-station']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('kings-cross-station', roll7, oneOwned)).toBe(25);

    const fourOwned = makeTestState({
      ownership: (o) => ({
        ...o,
        'kings-cross-station': { ...o['kings-cross-station']!, ownerId: 'player-1' },
        'marylebone-station': { ...o['marylebone-station']!, ownerId: 'player-1' },
        'fenchurch-street-station': { ...o['fenchurch-street-station']!, ownerId: 'player-1' },
        'liverpool-street-station': { ...o['liverpool-street-station']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('kings-cross-station', roll7, fourOwned)).toBe(200);
  });

  it('utility: 1 owned, roll 7 -> $28; 2 owned, roll 7 -> $70', () => {
    const oneOwned = makeTestState({
      ownership: (o) => ({
        ...o,
        'electric-company': { ...o['electric-company']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('electric-company', roll7, oneOwned)).toBe(28);

    const twoOwned = makeTestState({
      ownership: (o) => ({
        ...o,
        'electric-company': { ...o['electric-company']!, ownerId: 'player-1' },
        'water-works': { ...o['water-works']!, ownerId: 'player-1' },
      }),
    });
    expect(calculateRent('electric-company', roll7, twoOwned)).toBe(70);
  });
});
