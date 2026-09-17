import type { ReactNode } from 'react';
import { BOARD } from '@/engine';
import type { GameState, PlayerId } from '@/engine';
import { BoardTile } from './BoardTile';
import { TokenLayer } from './TokenLayer';
import styles from './Board.module.css';

interface BoardProps {
  state: GameState;
  displayPositions: Partial<Record<PlayerId, number>>;
  steppingPlayerId: PlayerId | null;
  goFlashKey: number;
  /** Per-property delay (seconds) for ownership visuals to clear — the bankruptcy wave. */
  releaseDelays: Record<string, number>;
  onTileClick: (propertyId: string | null, spaceIndex: number) => void;
  /** Rendered in the board centre beneath the wordmark (the dice). */
  children?: ReactNode;
}

export function Board({
  state,
  displayPositions,
  steppingPlayerId,
  goFlashKey,
  releaseDelays,
  onTileClick,
  children,
}: BoardProps) {
  return (
    <div className={styles.board} data-board>
      {BOARD.map((space) => (
        <BoardTile
          key={space.index}
          space={space}
          ownership={space.propertyId ? state.ownership[space.propertyId] : undefined}
          onClick={() => onTileClick(space.propertyId ?? null, space.index)}
          goFlashKey={space.type === 'go' ? goFlashKey : 0}
          releaseDelay={space.propertyId ? (releaseDelays[space.propertyId] ?? 0) : 0}
        />
      ))}
      <div className={styles.centre}>
        <span className={styles.centreLabel}>BOROUGH</span>
        <div className={styles.centreContent}>{children}</div>
      </div>
      <TokenLayer
        players={state.players}
        displayPositions={displayPositions}
        steppingPlayerId={steppingPlayerId}
      />
    </div>
  );
}
