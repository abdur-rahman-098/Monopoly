import { useEffect, useState } from 'react';
import { animate as animateValue, stagger, useAnimate } from 'motion/react';
import type { GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './GameOverModal.module.css';

interface GameOverModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const BURST_PARTICLES = 40;

/**
 * Victory screen — steps 4–8 of the victory sequence (GameScreen plays
 * steps 1–3 on the board before mounting this):
 * 4. winner colour floods up from the bottom
 * 5. wordmark + winner name slam in
 * 6. geometric burst radiates in the winner's colour
 * 7. stats count up from 0
 * 8. actions fade in last
 */
export function GameOverModal({ state, onPlayAgain, onMainMenu }: GameOverModalProps) {
  const t = useAnimationTiming();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [counts, setCounts] = useState({ netWorth: 0, cash: 0, properties: 0 });

  const winner = state.winner
    ? [...state.players, ...state.eliminatedPlayers].find((p) => p.id === state.winner)
    : null;

  const netWorth = winner ? GameEngine.getNetWorth(winner.id, state) : 0;
  const properties = winner ? Object.values(state.ownership).filter((r) => r.ownerId === winner.id).length : 0;
  const cash = winner?.cash ?? 0;

  useEffect(() => {
    if (!winner) return;
    let cancelled = false;

    async function run() {
      await animate('[data-flood]', { scaleY: [0, 1] }, { duration: t.s('victoryFlood'), ease: [0.22, 1, 0.36, 1] });
      if (cancelled) return;

      const particles = Array.from(scope.current?.querySelectorAll<HTMLElement>('[data-particle]') ?? []);
      const rings = animate(
        '[data-ring]',
        { scale: [0, 1], opacity: [0.9, 0] },
        { duration: t.s('victoryBurst'), ease: [0.16, 1, 0.3, 1], delay: stagger(0.12) }
      );
      const burst = Promise.all([
        rings,
        ...particles.map((el) =>
          animate(
            el,
            {
              opacity: [0, 1, 0],
              scale: [0.2, 1, 0.6],
              x: [0, Number(el.dataset.x)],
              y: [0, Number(el.dataset.y)],
            },
            { duration: t.s('victoryBurst'), ease: [0.16, 1, 0.3, 1], delay: Number(el.dataset.delay) * t.s('victoryBurst') }
          )
        ),
      ]);
      await animate(
        '[data-slam]',
        { scale: [1.2, 1], opacity: [0, 1] },
        { type: 'spring', visualDuration: t.s('victorySlam'), bounce: 0.35, delay: stagger(0.08) }
      );
      if (cancelled) return;

      await Promise.all([
        burst,
        animate('[data-stats]', { opacity: [0, 1] }, { duration: t.s('victoryButtonsFade') }),
        animateValue(0, 1, {
          duration: t.s('victoryCountUp'),
          ease: 'easeOut',
          onUpdate: (p) =>
            setCounts({
              netWorth: Math.round(netWorth * p),
              cash: Math.round(cash * p),
              properties: Math.round(properties * p),
            }),
        }),
      ]);
      if (cancelled) return;

      await animate(
        '[data-victory-actions]',
        { opacity: [0, 1], y: [10, 0] },
        { duration: t.s('victoryButtonsFade'), delay: t.s('victoryButtonsDelay'), ease: 'easeOut' }
      );
    }

    run();
    return () => {
      cancelled = true;
    };
    // The sequence plays once, when the screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!winner) return null;

  const winnerColour = PLAYER_COLOUR_VAR[winner.id];

  return (
    <div className={styles.overlay} ref={scope} style={{ ['--winner' as string]: winnerColour }}>
      <div className={styles.flood} data-flood />

      <div className={styles.burst} aria-hidden>
        <span className={styles.ring} data-ring />
        <span className={styles.ring} data-ring />
        {Array.from({ length: BURST_PARTICLES }, (_, i) => {
          const angle = (i / BURST_PARTICLES) * Math.PI * 2;
          const distance = [560, 380, 470][i % 3]!;
          return (
            <span
              key={i}
              data-particle
              data-x={Math.round(Math.cos(angle) * distance)}
              data-y={Math.round(Math.sin(angle) * distance)}
              data-delay={(i % 4) * 0.04}
              className={i % 3 === 0 ? styles.particleRay : styles.particle}
              style={{ rotate: `${(angle * 180) / Math.PI + 90}deg` }}
            />
          );
        })}
      </div>

      <div className={styles.content}>
        <p className={styles.wordmark} data-slam>
          BOROUGH
        </p>
        <h1 className={styles.victoryLabel} data-slam>
          VICTORY
        </h1>
        <h2 className={styles.winnerName} style={{ color: winnerColour }} data-slam>
          {winner.name.toUpperCase()} WINS
        </h2>

        <div className={styles.stats} data-stats>
          <div className={styles.stat}>
            <span className={styles.statValue}>${counts.netWorth.toLocaleString()}</span>
            <span className={styles.statLabel}>NET WORTH</span>
          </div>
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span className={styles.statSmall}>${counts.cash.toLocaleString()}</span>
              <span className={styles.statLabel}>CASH</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statSmall}>{counts.properties}</span>
              <span className={styles.statLabel}>PROPERTIES</span>
            </div>
          </div>
          <span className={styles.statLabel}>LAST PLAYER STANDING</span>
        </div>

        {state.eliminatedPlayers.length > 0 && (
          <div className={styles.eliminated} data-stats>
            {state.eliminatedPlayers.map((p) => (
              <div key={p.id} className={styles.eliminatedRow}>
                <span className={styles.eliminatedDot} style={{ background: PLAYER_COLOUR_VAR[p.id] }} />
                <span className={styles.eliminatedName}>{p.name}</span>
                <span className={styles.eliminatedNote}>Eliminated</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions} data-victory-actions>
          <Button variant="primary" onClick={onPlayAgain}>
            NEW GAME
          </Button>
          <Button variant="secondary" onClick={onMainMenu}>
            MAIN MENU
          </Button>
        </div>
      </div>
    </div>
  );
}
