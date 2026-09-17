import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimationProvider } from '@/animation/AnimationProvider';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { MainMenu } from '@/screens/MainMenu';
import { PlayerSetup, type PlayerConfig } from '@/screens/PlayerSetup';
import { TokenSelection } from '@/screens/TokenSelection';
import { GameIntro } from '@/screens/GameIntro';
import { GameScreen } from '@/screens/GameScreen';
import { HowToPlay } from '@/screens/HowToPlay';
import { Settings, type GameSettings } from '@/screens/Settings';

type Screen =
  | { type: 'main-menu' }
  | { type: 'player-setup' }
  | { type: 'token-selection'; players: PlayerConfig[] }
  | { type: 'game-intro'; players: PlayerConfig[]; gameState: GameState }
  | { type: 'playing'; gameState: GameState }
  | { type: 'how-to-play' }
  | { type: 'settings' };

const DEFAULT_SETTINGS: GameSettings = {
  animationSpeed: 'normal',
  showRentCalculations: true,
  confirmBeforeBuying: false,
};

/** Cross-fades between major screens — no slide, so the board simply appears. */
function ScreenTransition({ screenKey, children }: { screenKey: string; children: ReactNode }) {
  const t = useAnimationTiming();
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={screenKey}
        className="screen-layer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: t.s('screenFade'), ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'main-menu' });
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  function handlePlayerSetupDone(players: PlayerConfig[]) {
    setScreen({ type: 'token-selection', players });
  }

  function handleTokensDone(players: PlayerConfig[]) {
    const setups = players.map((p) => ({ name: p.name, tokenId: p.tokenId }));
    let state = GameEngine.createNewGame(setups);
    state = GameEngine.finalizePlayerOrder(state);
    setScreen({ type: 'game-intro', players, gameState: state });
  }

  function handleBeginGame(gameState: GameState) {
    setScreen({ type: 'playing', gameState });
  }

  return (
    <AnimationProvider speed={settings.animationSpeed}>
      <ScreenTransition screenKey={screen.type}>{renderScreen()}</ScreenTransition>
    </AnimationProvider>
  );

  function renderScreen() {
    switch (screen.type) {
      case 'main-menu':
        return (
          <MainMenu
            onNewGame={() => setScreen({ type: 'player-setup' })}
            onHowToPlay={() => setScreen({ type: 'how-to-play' })}
            onSettings={() => setScreen({ type: 'settings' })}
          />
        );
      case 'player-setup':
        return (
          <PlayerSetup
            onStart={handlePlayerSetupDone}
            onBack={() => setScreen({ type: 'main-menu' })}
          />
        );
      case 'token-selection':
        return (
          <TokenSelection
            players={screen.players}
            onConfirm={handleTokensDone}
            onBack={() => setScreen({ type: 'player-setup' })}
          />
        );
      case 'game-intro':
        return (
          <GameIntro players={screen.players} onBegin={() => handleBeginGame(screen.gameState)} />
        );
      case 'playing':
        return (
          <GameScreen
            initialState={screen.gameState}
            onNewGame={() => setScreen({ type: 'main-menu' })}
          />
        );
      case 'how-to-play':
        return <HowToPlay onBack={() => setScreen({ type: 'main-menu' })} />;
      case 'settings':
        return (
          <Settings
            settings={settings}
            onSave={setSettings}
            onBack={() => setScreen({ type: 'main-menu' })}
          />
        );
    }
  }
}

export default App;
