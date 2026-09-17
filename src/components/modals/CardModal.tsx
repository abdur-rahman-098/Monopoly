import type { Card, GameState } from '@/engine';
import { GameEngine } from '@/engine';
import { PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { Button } from '@/components/shared/Button';
import { motion } from 'motion/react';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './CardModal.module.css';

interface CardModalProps {
  card: Card;
  state: GameState;
  onContinue: () => void;
}

const DECK_LABEL: Record<Card['deck'], string> = {
  chance: 'RISK',
  'community-chest': 'THE CITY',
};

function getEffectDisplay(card: Card): { illustration: string; resultText: string; resultColour: string } {
  const effect = card.effect;
  switch (effect.kind) {
    case 'go-to-jail':
      return { illustration: 'jail', resultText: 'GO TO JAIL', resultColour: 'var(--colour-danger)' };
    case 'move-to':
      return { illustration: 'move', resultText: 'MOVE', resultColour: 'var(--colour-gold)' };
    case 'move-relative':
      return { illustration: 'move', resultText: `MOVE ${effect.spaces > 0 ? '+' : ''}${effect.spaces}`, resultColour: 'var(--colour-gold)' };
    case 'collect':
      return { illustration: 'collect', resultText: `+$${effect.amount}`, resultColour: 'var(--colour-success)' };
    case 'collect-from-each':
      return { illustration: 'collect', resultText: `+$${effect.amount} EACH`, resultColour: 'var(--colour-success)' };
    case 'pay':
      return { illustration: 'pay', resultText: `-$${effect.amount}`, resultColour: 'var(--colour-danger)' };
    case 'pay-per-building':
      return { illustration: 'buildings', resultText: 'PER BUILDING', resultColour: 'var(--colour-warning)' };
    case 'get-out-of-jail-free':
      return { illustration: 'goojf', resultText: 'CARD RECEIVED', resultColour: 'var(--colour-success)' };
    case 'move-to-nearest-station':
    case 'move-to-nearest-utility':
      return { illustration: 'move', resultText: 'MOVE', resultColour: 'var(--colour-gold)' };
    default:
      return { illustration: 'default', resultText: '', resultColour: 'var(--colour-text)' };
  }
}

function CardIllustration({ type }: { type: string }) {
  return (
    <div className={styles.illustration}>
      {type === 'jail' && (
        <div className={styles.jailBars}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.bar} />
          ))}
        </div>
      )}
      {type === 'collect' && (
        <div className={styles.circles}>
          {[40, 30, 20].map((r, i) => (
            <div key={i} className={styles.circle} style={{ width: r, height: r }} />
          ))}
        </div>
      )}
      {type === 'pay' && (
        <div className={styles.bars}>
          {[60, 45, 30, 50].map((h, i) => (
            <div key={i} className={styles.downBar} style={{ height: h }} />
          ))}
        </div>
      )}
      {type === 'move' && (
        <span className={styles.goLabel}>GO</span>
      )}
      {type === 'buildings' && (
        <div className={styles.buildingIcons}>
          <span className={styles.houseIcon} />
          <span className={styles.hotelIcon} />
        </div>
      )}
      {type === 'goojf' && (
        <span className={styles.goojfLabel}>FREE</span>
      )}
    </div>
  );
}

export function CardModal({ card, state, onContinue }: CardModalProps) {
  const player = GameEngine.getCurrentPlayer(state);
  const playerColour = PLAYER_COLOUR_VAR[player.id];
  const { illustration, resultText, resultColour } = getEffectDisplay(card);
  const t = useAnimationTiming();

  // Flips in on the Y axis from the right edge of the screen, then flips out
  // toward the left on dismiss (exit plays inside GameScreen's AnimatePresence).
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: t.s('modalOpen') } }}
      exit={{ opacity: 0, transition: { duration: t.s('cardDismiss'), ease: 'easeIn' } }}
    >
      <motion.div
        className={styles.card}
        initial={{ x: '55vw', rotateY: -110, opacity: 0.4 }}
        animate={{
          x: 0,
          rotateY: 0,
          opacity: 1,
          transition: { duration: t.s('cardFlipIn'), ease: [0.16, 1, 0.3, 1] },
        }}
        exit={{
          x: '-40vw',
          rotateY: 100,
          opacity: 0,
          transition: { duration: t.s('cardDismiss'), ease: [0.7, 0, 0.84, 0] },
        }}
      >
        <div className={styles.cardHeader}>
          <span className={styles.deckLabel}>{DECK_LABEL[card.deck]}</span>
        </div>

        <CardIllustration type={illustration} />

        <p className={styles.cardText}>{card.text}</p>

        <div className={styles.playerInfo}>
          <span className={styles.playerDot} style={{ background: playerColour }} />
          <span className={styles.playerName}>{player.name}</span>
        </div>

        <p className={styles.result} style={{ color: resultColour }}>{resultText}</p>

        <Button variant="primary" onClick={onContinue}>
          CONTINUE
        </Button>
      </motion.div>
    </motion.div>
  );
}
