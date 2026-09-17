import { describe, expect, it } from 'vitest';
import { executeTrade, validateTrade } from '@/engine/rules/trade';
import type { TradeProposal } from '@/engine/models/types';
import { makeTestState } from './testUtils';

function baseProposal(overrides: Partial<TradeProposal> = {}): TradeProposal {
  return {
    id: 'trade-1',
    proposerId: 'player-1',
    recipientId: 'player-2',
    offeredPropertyIds: [],
    offeredCash: 0,
    requestedPropertyIds: [],
    requestedCash: 0,
    includesOfferedGoojf: false,
    includesRequestedGoojf: false,
    status: 'accepted',
    ...overrides,
  };
}

describe('trade rules', () => {
  it('valid property swap: executes correctly', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-2' },
      }),
    });
    const proposal = baseProposal({
      offeredPropertyIds: ['old-kent-road'],
      requestedPropertyIds: ['whitechapel-road'],
    });
    const newState = executeTrade(proposal, state);
    expect(newState.ownership['old-kent-road']?.ownerId).toBe('player-2');
    expect(newState.ownership['whitechapel-road']?.ownerId).toBe('player-1');
  });

  it('property + cash for property: executes correctly', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-2' },
      }),
    });
    const proposal = baseProposal({
      offeredPropertyIds: ['old-kent-road'],
      offeredCash: 100,
      requestedPropertyIds: ['whitechapel-road'],
    });
    const newState = executeTrade(proposal, state);
    expect(newState.players.find((p) => p.id === 'player-1')?.cash).toBe(1400);
    expect(newState.players.find((p) => p.id === 'player-2')?.cash).toBe(1600);
  });

  it('two properties for one: executes correctly', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1' },
        'pall-mall': { ...o['pall-mall']!, ownerId: 'player-2' },
      }),
    });
    const proposal = baseProposal({
      offeredPropertyIds: ['old-kent-road', 'whitechapel-road'],
      requestedPropertyIds: ['pall-mall'],
    });
    const newState = executeTrade(proposal, state);
    expect(newState.ownership['old-kent-road']?.ownerId).toBe('player-2');
    expect(newState.ownership['whitechapel-road']?.ownerId).toBe('player-2');
    expect(newState.ownership['pall-mall']?.ownerId).toBe('player-1');
  });

  it('trade including GOOJF card: card transfers correctly', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, getOutOfJailFreeCards: 1 } : p)),
    });
    const proposal = baseProposal({ includesOfferedGoojf: true, requestedCash: 50 });
    const newState = executeTrade(proposal, state);
    expect(newState.players.find((p) => p.id === 'player-1')?.getOutOfJailFreeCards).toBe(0);
    expect(newState.players.find((p) => p.id === 'player-2')?.getOutOfJailFreeCards).toBe(1);
  });

  it('mortgaged property offered: validation blocks it', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', isMortgaged: true },
      }),
    });
    const proposal = baseProposal({ offeredPropertyIds: ['old-kent-road'] });
    const result = validateTrade(proposal, state);
    expect(result.valid).toBe(false);
  });

  it('property with buildings offered: validation blocks it', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 2 },
      }),
    });
    const proposal = baseProposal({ offeredPropertyIds: ['old-kent-road'] });
    const result = validateTrade(proposal, state);
    expect(result.valid).toBe(false);
  });

  it('proposer insufficient cash: validation blocks it', () => {
    const state = makeTestState();
    const proposal = baseProposal({ offeredCash: 5000 });
    const result = validateTrade(proposal, state);
    expect(result.valid).toBe(false);
  });

  it('rejected trade: no state changes', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
      }),
    });
    const proposal = baseProposal({ offeredPropertyIds: ['old-kent-road'], status: 'rejected' });
    expect(() => executeTrade(proposal, state)).toThrow();
    expect(state.ownership['old-kent-road']?.ownerId).toBe('player-1');
  });
});
