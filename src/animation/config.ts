/**
 * Single source of truth for every animation duration in the game.
 *
 * Values are the "Normal" speed defaults in milliseconds. The Settings
 * screen's Animation Speed picks a multiplier from ANIMATION_SPEED, and every
 * consumer (Motion transitions via `useAnimationTiming`, CSS via the
 * `--anim-scale` custom property) scales by it. `instant` (multiplier 0)
 * turns animation off entirely while keeping the game fully playable.
 */

export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export const ANIMATION_SPEED: Record<AnimationSpeed, number> = {
  slow: 1.5,
  normal: 1,
  fast: 0.5,
  instant: 0,
};

export const DURATIONS = {
  diceRoll: 600,
  specialDoubleFlash: 300,
  tokenStep: 80,
  tokenSettle: 120,
  goToast: 1200,
  propertyPurchase: 250,
  rentTransfer: 500,
  housePlace: 200,
  hotelHousesOut: 150,
  hotelIn: 200,
  buildingSell: 200,
  cardFlipIn: 450,
  cardDismiss: 350,
  sentToJail: 400,
  tradeTransfer: 600,
  mortgage: 250,
  bankruptStamp: 300,
  bankruptTileStagger: 30,
  bankruptTileFade: 250,
  bankruptPanelCollapse: 400,
  victoryPause: 600,
  screenFade: 300,
  buttonHover: 80,
  buttonPress: 120,
  modalOpen: 200,
  modalClose: 150,
  toastIn: 300,
  toastOut: 200,
  tileHover: 100,
  activePanelPulse: 2000,

  // Victory sequence (see VictoryScreen / GameScreen.playVictory)
  victoryPanelsOut: 300,
  victoryPanelStagger: 100,
  victoryTokenPulse: 400,
  victoryBoardFade: 500,
  victoryFlood: 600,
  victorySlam: 400,
  victoryBurst: 1000,
  victoryCountUp: 800,
  victoryButtonsDelay: 300,
  victoryButtonsFade: 300,
} as const;

export type DurationKey = keyof typeof DURATIONS;

export function scaledMs(key: DurationKey, speed: AnimationSpeed): number {
  return DURATIONS[key] * ANIMATION_SPEED[speed];
}

/** Motion transitions take seconds. */
export function scaledSeconds(key: DurationKey, speed: AnimationSpeed): number {
  return scaledMs(key, speed) / 1000;
}
