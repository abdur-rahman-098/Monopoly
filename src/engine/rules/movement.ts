import type { GameState, PlayerId } from '@/engine/models/types';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';

const BOARD_SIZE = 40;

export function movePlayer(
  playerId: PlayerId,
  spaces: number,
  state: GameState
): { newState: GameState; passedGo: boolean; newPosition: number } {
  const player = getPlayer(playerId, state);
  const rawPosition = player.boardPosition + spaces;
  const newPosition = ((rawPosition % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;

  const passedGo = spaces > 0 && (rawPosition >= BOARD_SIZE || newPosition === 0);

  let newState = updatePlayer(playerId, state, (p) => ({
    ...p,
    boardPosition: newPosition,
    cash: passedGo ? p.cash + 200 : p.cash,
  }));

  if (passedGo) {
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} passed GO and collected $200.`,
      cashDelta: 200,
    });
  }

  return { newState, passedGo, newPosition };
}

export function movePlayerToPosition(
  playerId: PlayerId,
  targetIndex: number,
  state: GameState,
  collectGoIfPassed: boolean
): GameState {
  const player = getPlayer(playerId, state);
  const wrapped = targetIndex < player.boardPosition || targetIndex === 0;
  const passedGo = collectGoIfPassed && wrapped;

  let newState = updatePlayer(playerId, state, (p) => ({
    ...p,
    boardPosition: targetIndex,
    cash: passedGo ? p.cash + 200 : p.cash,
  }));

  if (passedGo) {
    newState = addLogEntry(newState, {
      playerId,
      description: `${player.name} passed GO and collected $200.`,
      cashDelta: 200,
    });
  }

  return newState;
}
