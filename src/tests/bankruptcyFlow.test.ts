import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/engine/GameEngine';
import { makeTestState } from './testUtils';

describe('automatic bankruptcy escalation (GameEngine)', () => {
  it('landing on a tax space with insufficient cash escalates to the liquidation flow instead of going negative', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 50, boardPosition: 4 } : p)),
    });
    const newState = GameEngine.resolveLanding(state);
    expect(newState.turnPhase).toBe('awaiting-bankruptcy-resolution');
    expect(newState.pendingAction).toEqual({
      type: 'bankruptcy-resolution',
      amountOwed: 200,
      creditorId: 'bank',
    });
    expect(newState.players[0]?.cash).toBe(50); // untouched
  });

  it('landing on rent owed to another player with insufficient cash escalates with that player as creditor', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 1, boardPosition: 1 } : p)),
      ownership: (o) => ({ ...o, 'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-2' } }),
    });
    const newState = GameEngine.resolveLanding(state);
    expect(newState.turnPhase).toBe('awaiting-bankruptcy-resolution');
    expect(newState.pendingAction).toMatchObject({ type: 'bankruptcy-resolution', creditorId: 'player-2' });
  });

  it('liquidating assets to become solvent, then payObligation settles the debt and resumes play', () => {
    let state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 80, boardPosition: 4 } : p)),
      ownership: (o) => ({
        ...o,
        'old-kent-road': { ...o['old-kent-road']!, ownerId: 'player-1' },
        'whitechapel-road': { ...o['whitechapel-road']!, ownerId: 'player-1' },
      }),
    });
    state = GameEngine.resolveLanding(state);
    expect(state.turnPhase).toBe('awaiting-bankruptcy-resolution');
    expect(state.players[0]?.cash).toBe(80);

    // Mortgaging both raises $30 + $30, bringing cash to $140 — still short.
    state = GameEngine.mortgageProperty('old-kent-road', state);
    state = GameEngine.mortgageProperty('whitechapel-road', state);
    expect(state.players[0]?.cash).toBe(140);
    expect(() => GameEngine.payObligation(state)).toThrow();

    // A further $60 (e.g. from another liquidation step) makes it affordable.
    state = { ...state, players: state.players.map((p) => (p.id === 'player-1' ? { ...p, cash: p.cash + 60 } : p)) };
    const settled = GameEngine.payObligation(state);
    expect(settled.turnPhase).toBe('strategic-action');
    expect(settled.pendingAction).toBeNull();
    expect(settled.players[0]?.cash).toBe(0);
  });

  it('declaring bankruptcy resets the turn to awaiting-roll for the next player (when others remain)', () => {
    const state = makeTestState({
      state: {
        players: [
          { id: 'player-1', name: 'P1', tokenId: 't1', cash: 0, boardPosition: 0, status: 'active', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
          { id: 'player-2', name: 'P2', tokenId: 't2', cash: 1500, boardPosition: 0, status: 'active', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
          { id: 'player-3', name: 'P3', tokenId: 't3', cash: 1500, boardPosition: 0, status: 'active', isInJail: false, jailTurnsUsed: 0, getOutOfJailFreeCards: 0 },
        ],
        turnPhase: 'awaiting-bankruptcy-resolution',
        pendingAction: { type: 'bankruptcy-resolution', amountOwed: 200, creditorId: 'bank' },
      },
    });
    const newState = GameEngine.declareBankruptcy('player-1', state);
    expect(newState.turnPhase).toBe('awaiting-roll');
    expect(newState.pendingAction).toBeNull();
    expect(newState.players.find((p) => p.id === 'player-1')).toBeUndefined();
    expect(newState.gamePhase).not.toBe('game-over');
  });

  it('declaring bankruptcy down to one player ends the game', () => {
    const state = makeTestState({
      players: (s) => s.players.map((p) => (p.id === 'player-1' ? { ...p, cash: 0 } : p)),
    });
    const newState = GameEngine.declareBankruptcy('player-1', state);
    expect(newState.gamePhase).toBe('game-over');
    expect(newState.winner).toBe('player-2');
  });
});
