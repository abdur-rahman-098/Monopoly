import { describe, expect, it } from 'vitest';
import { drawCard, executeCardEffect } from '@/engine/rules/cards';
import type { Card } from '@/engine/models/types';
import { makeTestState } from './testUtils';

function card(effect: Card['effect'], id = 'test-card'): Card {
  return { id, deck: 'chance', text: 'Test card', effect };
}

describe('card rules', () => {
  it('drawing a card moves it to the bottom of the deck', () => {
    const state = makeTestState();
    const firstBefore = state.chanceDeck[0];
    const { card: drawn, newState } = drawCard('chance', state);
    expect(drawn).toBe(firstBefore);
    expect(newState.chanceDeck[newState.chanceDeck.length - 1]).toBe(firstBefore);
    expect(newState.chanceDeck).toHaveLength(state.chanceDeck.length);
  });

  it('GOOJF card is removed from the deck and stays with the player, not returned', () => {
    const state = makeTestState({
      state: {
        chanceDeck: [card({ kind: 'get-out-of-jail-free' }, 'goojf')],
      },
    });
    const { newState } = drawCard('chance', state);
    expect(newState.chanceDeck).toHaveLength(0);

    const afterEffect = executeCardEffect(card({ kind: 'get-out-of-jail-free' }, 'goojf'), 'player-1', newState);
    expect(afterEffect.players[0]?.getOutOfJailFreeCards).toBe(1);
    expect(afterEffect.chanceDeck).toHaveLength(0);
  });

  it('movement card passes GO and awards $200', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 35 } : p)),
    });
    const newState = executeCardEffect(
      card({ kind: 'move-to', destinationIndex: 5, collectGoIfPassed: true }),
      'player-1',
      state
    );
    expect(newState.players[0]?.boardPosition).toBe(5);
    expect(newState.players[0]?.cash).toBe(1500 + 200);
  });

  describe('nearest station', () => {
    it('resolves to the next station ahead of the player', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 0 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-station' }), 'player-1', state);
      expect(newState.players[0]?.boardPosition).toBe(5); // King's Cross
    });

    it('resolves from the middle of the board', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 20 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-station' }), 'player-1', state);
      expect(newState.players[0]?.boardPosition).toBe(25); // Fenchurch Street
    });

    it('wraps around past GO when no station is ahead', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 36 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-station' }), 'player-1', state);
      expect(newState.players[0]?.boardPosition).toBe(5); // King's Cross, wrapped
      expect(newState.players[0]?.cash).toBe(1500 + 200); // passed GO
    });

    it('unowned station offers a purchase decision', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 0 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-station' }), 'player-1', state);
      expect(newState.turnPhase).toBe('awaiting-purchase-decision');
      expect(newState.pendingAction).toMatchObject({ type: 'purchase-decision', propertyId: 'kings-cross-station' });
    });

    it('owned station charges double the normal rent', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 0 } : p)),
        ownership: (o) => ({ ...o, 'kings-cross-station': { ...o['kings-cross-station']!, ownerId: 'player-2' } }),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-station' }), 'player-1', state);
      // 1 station owned -> normal rent $25, doubled to $50.
      expect(newState.players[0]?.cash).toBe(1500 - 50);
      expect(newState.players[1]?.cash).toBe(1500 + 50);
      expect(newState.turnPhase).toBe('strategic-action');
    });
  });

  describe('nearest utility', () => {
    it('resolves to the next utility ahead of the player', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 0 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-utility' }), 'player-1', state);
      expect(newState.players[0]?.boardPosition).toBe(12); // Electric Company
    });

    it('wraps around past GO when no utility is ahead', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 30 } : p)),
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-utility' }), 'player-1', state);
      expect(newState.players[0]?.boardPosition).toBe(12); // Electric Company, wrapped
    });

    it('owned utility charges 10x the dice total', () => {
      const state = makeTestState({
        players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 0 } : p)),
        ownership: (o) => ({ ...o, 'electric-company': { ...o['electric-company']!, ownerId: 'player-2' } }),
        state: { lastDiceRoll: { die1: 3, die2: 4, total: 7, isDouble: false, isSpecialDouble: false } },
      });
      const newState = executeCardEffect(card({ kind: 'move-to-nearest-utility' }), 'player-1', state);
      expect(newState.players[0]?.cash).toBe(1500 - 70);
      expect(newState.players[1]?.cash).toBe(1500 + 70);
    });
  });

  it('pay-per-building calculates correctly across multiple properties', () => {
    const state = makeTestState({
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1', buildings: 3 },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1', buildings: 5 }, // hotel
      }),
    });
    const newState = executeCardEffect(
      card({ kind: 'pay-per-building', houseAmount: 40, hotelAmount: 115 }),
      'player-1',
      state
    );
    // 3 houses * $40 + 1 hotel * $115 = $235
    expect(newState.players[0]?.cash).toBe(1500 - 235);
  });

  it('collect-from-each distributes from all active (non-eliminated) players only', () => {
    const state = makeTestState({
      state: {
        players: [
          { id: 'player-1', name: 'P1', tokenId: 't1', cash: 1500, boardPosition: 0, status: 'active', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
          { id: 'player-2', name: 'P2', tokenId: 't2', cash: 1500, boardPosition: 0, status: 'active', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
          { id: 'player-3', name: 'P3', tokenId: 't3', cash: 1500, boardPosition: 0, status: 'bankrupt', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
        ],
      },
    });
    const newState = executeCardEffect(card({ kind: 'collect-from-each', amount: 50 }), 'player-1', state);
    expect(newState.players[0]?.cash).toBe(1500 + 50); // only player-2 pays
    expect(newState.players[1]?.cash).toBe(1500 - 50);
    expect(newState.players[2]?.cash).toBe(1500); // bankrupt player unaffected
  });

  it('a mandatory payment the player cannot afford escalates to the bankruptcy-resolution flow', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 10 } : p)),
    });
    const newState = executeCardEffect(card({ kind: 'pay', amount: 100 }), 'player-1', state);
    expect(newState.turnPhase).toBe('awaiting-bankruptcy-resolution');
    expect(newState.pendingAction).toEqual({
      type: 'bankruptcy-resolution',
      amountOwed: 100,
      creditorId: 'bank',
    });
    expect(newState.players[0]?.cash).toBe(10); // untouched until settled
  });
});
