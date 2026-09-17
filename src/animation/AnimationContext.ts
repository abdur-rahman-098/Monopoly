import { createContext } from 'react';
import type { AnimationSpeed } from './config';

export const AnimationSpeedContext = createContext<AnimationSpeed>('normal');
