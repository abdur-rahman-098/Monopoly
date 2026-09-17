import { AnimatePresence, motion } from 'motion/react';
import type { GameState, Player } from '@/engine';
import { GameEngine } from '@/engine';
import { Button } from '@/components/shared/Button';
import { PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import styles from './ActionPanel.module.css';

const JAIL_FINE = 50;
const MAX_JAIL_ATTEMPTS = 3;

interface ActionPanelProps {
  state: GameState;
  onRoll: () => void;
  onEndTurn: () => void;
  nextPlayerName: string;
  onJailRoll: () => void;
  onPayJailFine: () => void;
  onUseGoojfCard: () => void;
  onProceedAfterJailRelease: () => void;
  onOpenBuild: () => void;
  onOpenTrade: () => void;
  onOpenMortgage: () => void;
  onOpenPortfolio: () => void;
}

export function ActionPanel({
  state,
  onRoll,
  onEndTurn,
  nextPlayerName,
  onJailRoll,
  onPayJailFine,
  onUseGoojfCard,
  onProceedAfterJailRelease,
  onOpenBuild,
  onOpenTrade,
  onOpenMortgage,
  onOpenPortfolio,
}: ActionPanelProps) {
  const t = useAnimationTiming();
  const player = GameEngine.getCurrentPlayer(state);
  const phase = state.turnPhase;
  const pending = state.pendingAction;
  const isForcedReroll = pending?.type === 'forced-reroll';
  const isJailReleased = phase === 'awaiting-roll' && pending?.type === 'jail-fine-applied';
  const isJailDecision = phase === 'awaiting-roll' && player.isInJail;
  const playerColour = PLAYER_COLOUR_VAR[player.id];

  const hasBuildings = Object.values(state.ownership).some((r) => r.ownerId === player.id && r.buildings > 0);
  const hasMortgageable = Object.values(state.ownership).some(
    (r) => r.ownerId === player.id && !r.isMortgaged && r.buildings === 0
  );
  const hasUnmortgageable = Object.values(state.ownership).some((r) => r.ownerId === player.id && r.isMortgaged);

  // Cross-fade between phase layouts so the panel never pops.
  const phaseKey = isJailReleased
    ? 'jail-released'
    : isJailDecision
      ? `jail-${player.jailTurnsUsed}-${isForcedReroll}`
      : `${phase}-${isForcedReroll}`;

  return (
    <div className={styles.panel}>
      <div className={styles.playerHeader}>
        <span className={styles.playerDot} style={{ background: playerColour }} />
        <span className={styles.playerName}>{player.name}</span>
        <span className={styles.playerCash}>${player.cash.toLocaleString()}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phaseKey}
          className={styles.phaseBody}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0, transition: { duration: t.s('modalOpen') } }}
          exit={{ opacity: 0, transition: { duration: t.s('modalClose') / 2 } }}
        >
          {isJailReleased && pending?.type === 'jail-fine-applied' && (
            <JailReleasedPanel
              player={player}
              amount={pending.amount}
              rollWasSpecialDouble={pending.roll.isSpecialDouble}
              rollTotal={pending.roll.total}
              onProceed={onProceedAfterJailRelease}
            />
          )}

          {isJailDecision && (
            <JailPanel
              player={player}
              isForcedReroll={isForcedReroll}
              onRoll={onJailRoll}
              onPayFine={onPayJailFine}
              onUseCard={onUseGoojfCard}
            />
          )}

          {phase === 'awaiting-roll' && isForcedReroll && !player.isInJail && (
            <>
              <p className={styles.phaseLabel} style={{ color: 'var(--colour-danger)' }}>
                DOUBLE SIX · NO MOVEMENT
              </p>
              <Button variant="primary" onClick={onRoll}>
                ROLL AGAIN
              </Button>
            </>
          )}

          {phase === 'awaiting-roll' && !pending && !player.isInJail && (
            <>
              <p className={styles.phaseLabel}>YOUR TURN</p>
              <Button variant="primary" onClick={onRoll}>
                ROLL DICE
              </Button>
              <div className={styles.divider} />
              <div className={styles.actionGroup}>
                <Button variant="secondary" onClick={onOpenPortfolio}>
                  VIEW PORTFOLIO
                </Button>
                <Button variant="secondary" onClick={onOpenTrade}>
                  PROPOSE TRADE
                </Button>
              </div>
            </>
          )}

          {(phase === 'rolling' || phase === 'moving') && (
            <p className={styles.phaseLabel}>{phase === 'rolling' ? 'Rolling...' : 'Moving...'}</p>
          )}

          {phase === 'resolving-landing' && <p className={styles.phaseLabel}>Resolving...</p>}
          {phase === 'drawing-card' && <p className={styles.phaseLabel}>Drawing card...</p>}

          {phase === 'strategic-action' && (
            <>
              <div className={styles.actionGroup}>
                <Button variant="secondary" onClick={onOpenBuild}>
                  BUILD
                </Button>
                {hasBuildings && (
                  <Button variant="secondary" onClick={onOpenBuild}>
                    SELL BUILDINGS
                  </Button>
                )}
                {(hasMortgageable || hasUnmortgageable) && (
                  <Button variant="secondary" onClick={onOpenMortgage}>
                    {hasUnmortgageable ? 'MORTGAGE / UNMORTGAGE' : 'MORTGAGE'}
                  </Button>
                )}
                <Button variant="secondary" onClick={onOpenTrade}>
                  PROPOSE TRADE
                </Button>
                <Button variant="secondary" onClick={onOpenPortfolio}>
                  VIEW PORTFOLIO
                </Button>
              </div>
              <div className={styles.divider} />
              <Button variant="primary" onClick={onEndTurn}>
                END TURN
              </Button>
            </>
          )}

          {phase === 'turn-ended' && <p className={styles.phaseLabel}>Passing to {nextPlayerName}...</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jail — states A (1/3), B (2/3, amber), C (3/3, final chance, red)
// ---------------------------------------------------------------------------

interface JailPanelProps {
  player: Player;
  isForcedReroll: boolean;
  onRoll: () => void;
  onPayFine: () => void;
  onUseCard: () => void;
}

function JailPanel({ player, isForcedReroll, onRoll, onPayFine, onUseCard }: JailPanelProps) {
  const attempt = Math.min(player.jailTurnsUsed + 1, MAX_JAIL_ATTEMPTS);
  const tone = attempt === 1 ? 'normal' : attempt === 2 ? 'warning' : 'danger';
  const isFinal = attempt === MAX_JAIL_ATTEMPTS;
  const canPay = player.cash >= JAIL_FINE && !isForcedReroll;
  const canUseCard = player.getOutOfJailFreeCards > 0 && !isForcedReroll;

  let rollLabel = isFinal ? 'ROLL FOR DOUBLE — FINAL CHANCE' : 'ROLL FOR DOUBLE';
  if (isForcedReroll) rollLabel = isFinal ? 'ROLL AGAIN — FINAL CHANCE' : 'ROLL AGAIN';

  return (
    <div className={[styles.jail, styles[`jail-${tone}`]].join(' ')}>
      <div className={styles.jailStrip} />
      <div className={styles.jailHeader}>
        <h3 className={styles.jailTitle}>In Jail</h3>
        <span className={styles.attemptLabel}>
          ATTEMPT {attempt}/{MAX_JAIL_ATTEMPTS}
        </span>
      </div>

      <div className={styles.pips} aria-label={`Attempt ${attempt} of ${MAX_JAIL_ATTEMPTS}`}>
        {Array.from({ length: MAX_JAIL_ATTEMPTS }, (_, i) => (
          <span key={i} className={[styles.pip, i < attempt ? styles.pipFilled : ''].join(' ')} />
        ))}
      </div>

      {isFinal && (
        <div className={styles.jailWarning}>
          Last chance. Miss and $50 is deducted automatically — then you&apos;re released regardless.
        </div>
      )}

      <div className={styles.actionGroup}>
        <div>
          <Button variant={isFinal ? 'danger' : 'primary'} onClick={onRoll}>
            {rollLabel}
          </Button>
          <p className={[styles.optionHint, styles.rollHint].join(' ')}>
            {isForcedReroll
              ? '6+6 forces a reroll. It counted as an attempt.'
              : attempt === 1
                ? 'No double after 3 attempts · $50 auto-deducted · released.'
                : attempt === 2
                  ? '1 roll remaining · miss and $50 is auto-deducted.'
                  : 'A double releases you. 6+6 does not.'}
          </p>
        </div>

        <div>
          <Button
            variant="secondary"
            onClick={onPayFine}
            disabled={!canPay}
            tooltip={player.cash < JAIL_FINE ? `Insufficient funds · $${player.cash}` : undefined}
          >
            PAY $50 TO LEAVE
          </Button>
          <p className={[styles.optionHint, player.cash < JAIL_FINE ? styles.hintWarning : ''].join(' ')}>
            {player.cash < JAIL_FINE
              ? `Insufficient funds · $${player.cash}`
              : `Your cash: $${player.cash.toLocaleString()} · After: $${(player.cash - JAIL_FINE).toLocaleString()}`}
          </p>
        </div>

        <div>
          <Button variant="secondary" onClick={onUseCard} disabled={!canUseCard}>
            USE GET OUT OF JAIL FREE
          </Button>
          <p className={[styles.optionHint, player.getOutOfJailFreeCards > 0 ? styles.hintSuccess : ''].join(' ')}>
            {player.getOutOfJailFreeCards > 0
              ? `Held · ${player.getOutOfJailFreeCards} card${player.getOutOfJailFreeCards > 1 ? 's' : ''}`
              : 'Not in your possession'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jail — state D (released, fine applied)
// ---------------------------------------------------------------------------

interface JailReleasedPanelProps {
  player: Player;
  amount: number;
  rollWasSpecialDouble: boolean;
  rollTotal: number;
  onProceed: () => void;
}

function JailReleasedPanel({ player, amount, rollWasSpecialDouble, rollTotal, onProceed }: JailReleasedPanelProps) {
  return (
    <div className={[styles.jail, styles['jail-released']].join(' ')}>
      <div className={styles.jailStrip} />
      <div className={styles.jailHeader}>
        <h3 className={styles.jailTitle}>Released from Jail</h3>
        <span className={styles.attemptLabel}>FINE APPLIED</span>
      </div>

      <div className={styles.fineRow}>
        <span className={styles.fineLabel}>No double in 3 attempts</span>
        <span className={styles.fineAmount}>−${amount}</span>
      </div>
      <div className={styles.fineRow}>
        <span className={styles.fineLabel}>Remaining cash</span>
        <span className={styles.fineCash}>${player.cash.toLocaleString()}</span>
      </div>

      <Button variant="primary" onClick={onProceed}>
        ROLL TO MOVE
      </Button>
      <p className={styles.optionHint}>
        {rollWasSpecialDouble ? 'Your last roll was 6+6 — roll again to move.' : `Moves ${rollTotal} spaces with your last roll.`}
      </p>
    </div>
  );
}
