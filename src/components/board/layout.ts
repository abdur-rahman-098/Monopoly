export type TileSide = 'bottom' | 'right' | 'top' | 'left' | 'corner';

export interface TileLayout {
  row: number;
  col: number;
  side: TileSide;
}

/**
 * Maps a board index (0-39) to its position in the 11x11 CSS grid.
 * Corners: 0=bottom-right, 10=top-right, 20=top-left, 30=bottom-left.
 * Interior spaces run 1-9 up the right edge, 11-19 across the top
 * (right to left), 21-29 down the left edge, 31-39 across the bottom
 * (left to right, back toward GO).
 */
export function getTileLayout(index: number): TileLayout {
  if (index === 0) return { row: 11, col: 11, side: 'corner' };
  if (index === 10) return { row: 1, col: 11, side: 'corner' };
  if (index === 20) return { row: 1, col: 1, side: 'corner' };
  if (index === 30) return { row: 11, col: 1, side: 'corner' };

  if (index >= 1 && index <= 9) {
    return { row: 11 - index, col: 11, side: 'right' };
  }
  if (index >= 11 && index <= 19) {
    return { row: 1, col: 21 - index, side: 'top' };
  }
  if (index >= 21 && index <= 29) {
    return { row: index - 19, col: 1, side: 'left' };
  }
  if (index >= 31 && index <= 39) {
    return { row: 11, col: index - 29, side: 'bottom' };
  }

  throw new Error(`Invalid board index ${index}`);
}

// ---------------------------------------------------------------------------
// Pixel geometry (base design size — the screen frame scales the whole board)
// ---------------------------------------------------------------------------

export const BOARD_PX = 1560;
export const CORNER_PX = 208;
export const EDGE_TILE_PX = (BOARD_PX - CORNER_PX * 2) / 9;

function axisCentre(gridLine: number): number {
  if (gridLine === 1) return CORNER_PX / 2;
  if (gridLine === 11) return BOARD_PX - CORNER_PX / 2;
  return CORNER_PX + (gridLine - 2) * EDGE_TILE_PX + EDGE_TILE_PX / 2;
}

/** How far token clusters sit from the tile centre, toward the board's outer edge. */
const TOKEN_OUTWARD_OFFSET = 62;
const TOKEN_SPACING = 24;

/**
 * Board-space centre point for the `slot`-th of `count` tokens sharing a tile.
 * Tokens line up along the tile's long edge, near the outer rim, so they
 * never cover the tile name.
 */
export function getTokenPoint(index: number, slot: number, count: number): { x: number; y: number } {
  const { row, col, side } = getTileLayout(index);
  let x = axisCentre(col);
  let y = axisCentre(row);
  const spread = (slot - (count - 1) / 2) * TOKEN_SPACING;

  switch (side) {
    case 'bottom':
      return { x: x + spread, y: y + TOKEN_OUTWARD_OFFSET };
    case 'top':
      return { x: x + spread, y: y - TOKEN_OUTWARD_OFFSET };
    case 'left':
      return { x: x - TOKEN_OUTWARD_OFFSET, y: y + spread };
    case 'right':
      return { x: x + TOKEN_OUTWARD_OFFSET, y: y + spread };
    case 'corner':
      x += spread;
      y += CORNER_PX / 2 - 30;
      return { x, y };
  }
}
