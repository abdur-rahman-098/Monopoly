import { describe, expect, it } from 'vitest';
import { movePlayer, movePlayerToPosition } from '@/engine/rules/movement';
import { makeTestState } from './testUtils';

describe('movement', () => {
  it('moves forward 7 spaces from index 0 to index 7', () => {
    const state = makeTestState();
    const { newPosition, passedGo } = movePlayer('player-1', 7, state);
    expect(newPosition).toBe(7);
    expect(passedGo).toBe(false);
  });

  it('wraps around from index 38, moving 5 spaces, landing on index 3 with GO money', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 38 } : p)),
    });
    const { newState, newPosition, passedGo } = movePlayer('player-1', 5, state);
    expect(newPosition).toBe(3);
    expect(passedGo).toBe(true);
    expect(newState.players[0]?.cash).toBe(1500 + 200);
  });

  it('landing exactly on GO awards $200', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 33 } : p)),
    });
    const { newState, newPosition, passedGo } = movePlayer('player-1', 7, state);
    expect(newPosition).toBe(0);
    expect(passedGo).toBe(true);
    expect(newState.players[0]?.cash).toBe(1700);
  });

  it('teleport to specific index below current awards GO money when collectGoIfPassed', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 20 } : p)),
    });
    const newState = movePlayerToPosition('player-1', 5, state, true);
    expect(newState.players[0]?.boardPosition).toBe(5);
    expect(newState.players[0]?.cash).toBe(1700);
  });

  it('teleport forward to index above current does not award GO money', () => {
    const state = makeTestState({
      players: (s) =>
        s.players.map((p) => (p.id === 'player-1' ? { ...p, boardPosition: 5 } : p)),
    });
    const newState = movePlayerToPosition('player-1', 20, state, true);
    expect(newState.players[0]?.boardPosition).toBe(20);
    expect(newState.players[0]?.cash).toBe(1500);
  });
});
