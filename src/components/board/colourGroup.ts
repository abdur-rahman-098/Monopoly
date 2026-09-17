import type { ColourGroup, PlayerId } from '@/engine';

export const COLOUR_GROUP_VAR: Record<ColourGroup, string> = {
  brown: 'var(--colour-brown)',
  'light-blue': 'var(--colour-light-blue)',
  pink: 'var(--colour-pink)',
  orange: 'var(--colour-orange)',
  red: 'var(--colour-red)',
  yellow: 'var(--colour-yellow)',
  green: 'var(--colour-green)',
  'dark-blue': 'var(--colour-dark-blue)',
};

export const COLOUR_GROUP_LABEL: Record<ColourGroup, string> = {
  brown: 'Brown',
  'light-blue': 'Light Blue',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  'dark-blue': 'Dark Blue',
};

export const PLAYER_COLOUR_VAR: Record<PlayerId, string> = {
  'player-1': 'var(--colour-p1)',
  'player-2': 'var(--colour-p2)',
  'player-3': 'var(--colour-p3)',
  'player-4': 'var(--colour-p4)',
};

export const PLAYER_INDEX_COLOUR_VAR = [
  'var(--colour-p1)',
  'var(--colour-p2)',
  'var(--colour-p3)',
  'var(--colour-p4)',
] as const;
