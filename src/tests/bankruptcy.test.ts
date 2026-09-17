import { describe, expect, it } from 'vitest';
import {
  calculateLiquidationValue,
  checkBankruptcy,
  declareBankruptcy,
} from '@/engine/rules/bankruptcy';
import { makeTestState } from './testUtils';

describe('bankruptcy rules', () => {
  it('calculateLiquidationValue: correct sum of cash + buildings + mortgageable assets', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 100 } : p)),
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 2 },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1' },
      }),
    });
    // cash 100 + buildings (2 * 50) + mortgage values (30 + 30)
    expect(calculateLiquidationValue('player-1', state)).toBe(100 + 100 + 60);
  });

  it('not bankrupt if liquidation covers debt', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 10 } : p)),
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    expect(checkBankruptcy('player-1', 20, state)).toBe(false);
  });

  it('bankruptcy confirmed: properties go to bank', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 0 } : p)),
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    const newState = declareBankruptcy('player-1', state);
    expect(newState.ownership['old-kent-road']?.ownerId).toBe('bank');
  });

  it('mortgaged properties automatically unmortgaged on bankruptcy', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
    });
    const newState = declareBankruptcy('player-1', state);
    expect(newState.ownership['old-kent-road']?.isMortgaged).toBe(false);
  });

  it('buildings removed on bankruptcy', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 3 },
      }),
    });
    const newState = declareBankruptcy('player-1', state);
    expect(newState.ownership['old-kent-road']?.buildings).toBe(0);
  });

  it('creditor receives nothing', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    const newState = declareBankruptcy('player-1', state);
    expect(newState.players.find((p) => p.id === 'player-2')?.cash).toBe(1500);
    expect(newState.ownership['old-kent-road']?.ownerId).not.toBe('player-2');
  });

  it('player removed from active players list', () => {
    const state = makeTestState();
    const newState = declareBankruptcy('player-1', state);
    expect(newState.players.find((p) => p.id === 'player-1')).toBeUndefined();
    expect(newState.eliminatedPlayers.some((p) => p.id === 'player-1')).toBe(true);
  });

  it('last player remaining triggers game-over and sets winner', () => {
    const state = makeTestState();
    const newState = declareBankruptcy('player-1', state);
    expect(newState.gamePhase).toBe('game-over');
    expect(newState.winner).toBe('player-2');
  });
});
