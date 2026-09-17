import type { GameLogEntry, GameState, Player, PlayerId } from '@/engine/models/types';

export function getPlayer(playerId: PlayerId, state: GameState): Player {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`RULES: Player ${playerId} not found among active players.`);
  }
  return player;
}

export function updatePlayer(
  playerId: PlayerId,
  state: GameState,
  updater: (player: Player) => Player
): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? updater(p) : p)),
  };
}

export function addLogEntry(
  state: GameState,
  entry: Omit<GameLogEntry, 'timestamp'>
): GameState {
  const logEntry: GameLogEntry = { ...entry, timestamp: Date.now() };
  return {
    ...state,
    log: [...state.log, logEntry],
  };
}

export function otherActivePlayers(playerId: PlayerId, state: GameState): Player[] {
  return state.players.filter((p) => p.id !== playerId && p.status === 'active');
}
