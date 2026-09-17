import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, stagger, useAnimate } from 'motion/react';
import type { DiceRoll, GameState, Player, PlayerId } from '@/engine';
import { BOARD, GameEngine, PROPERTIES } from '@/engine';
import { useGameState } from '@/hooks/useGameState';
import { useTokenAnimation } from '@/hooks/useTokenAnimation';
import { useSoundHooks } from '@/hooks/useSoundHooks';
import { useFrameScale } from '@/hooks/useFrameScale';
import { useAnimationTiming } from '@/animation/useAnimationTiming';
import { COLOUR_GROUP_VAR, PLAYER_COLOUR_VAR } from '@/components/board/colourGroup';
import { Board } from '@/components/board/Board';
import { ActionPanel } from '@/components/panels/ActionPanel';
import { PlayerPanel } from '@/components/panels/PlayerPanel';
import { GameLog } from '@/components/panels/GameLog';
import { PortfolioPanel } from '@/components/panels/PortfolioPanel';
import { PropertyDrawer } from '@/components/panels/PropertyDrawer';
import { DiceDisplay } from '@/components/dice/DiceDisplay';
import { PurchaseModal } from '@/components/modals/PurchaseModal';
import { RentModal } from '@/components/modals/RentModal';
import { TaxModal } from '@/components/modals/TaxModal';
import { CardModal } from '@/components/modals/CardModal';
import { BuildModal } from '@/components/modals/BuildModal';
import { MortgageModal } from '@/components/modals/MortgageModal';
import { TradeModal } from '@/components/modals/TradeModal';
import { TradeResponseModal } from '@/components/modals/TradeResponseModal';
import { LiquidationModal } from '@/components/modals/LiquidationModal';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { GameMenu } from '@/components/modals/GameMenu';
import { SpecialSpaceModal, type SpecialSpaceKind } from '@/components/modals/SpecialSpaceModal';
import { ToastStack, type ToastItem } from '@/components/effects/ToastStack';
import { FlyLayer, FlyerCash, FlyerChips, type Flyer } from '@/components/effects/FlyLayer';
import type { NotificationType } from '@/components/shared/Notification';
import { emit } from '@/audio/AudioManager';
import styles from './GameScreen.module.css';

const TURN_ENDED_DELAY_MS = 800;
const TOAST_DURATION_MS = 3000;
const BOARD_SIZE = 40;

/** Base design size of the game frame; `frameScale` fits it to the window. */
const FRAME_WIDTH = 2880;
const FRAME_HEIGHT = 1620;

interface GameScreenProps {
  initialState: GameState;
  onNewGame: () => void;
  /** Multiplier on the fit-to-window scale of the 2880×1620 frame. */
  frameScale?: number;
}

type RollKind = 'normal' | 'jail';

interface Elimination {
  player: Player;
  panelIndex: number;
  /** Seconds before each released property's ownership visuals clear (the wave). */
  releaseDelays: Record<string, number>;
  waveSeconds: number;
}

type VictoryStage = 'idle' | 'board' | 'overlay';

let uid = 0;
const nextId = () => ++uid;

export function GameScreen({ initialState, onNewGame, frameScale = 1 }: GameScreenProps) {
  const { state, actions } = useGameState(initialState);
  const { displayPositions, animatingPlayerId, animate: animateToken } = useTokenAnimation();
  const sound = useSoundHooks();
  const t = useAnimationTiming();
  const scale = useFrameScale(FRAME_WIDTH, FRAME_HEIGHT, frameScale);
  const [scope, animateScope] = useAnimate<HTMLDivElement>();

  // Latest engine state for callbacks that fire after an animation completes.
  // A layout effect keeps it current before any child's passive effects run.
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [rollId, setRollId] = useState(0);
  const [settledRollId, setSettledRollId] = useState(0);
  const rollKindRef = useRef<RollKind>('normal');
  const [goFlashKey, setGoFlashKey] = useState(0);
  const [inspectedPropertyId, setInspectedPropertyId] = useState<string | null>(null);
  const [specialSpace, setSpecialSpace] = useState<SpecialSpaceKind | null>(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [elimination, setElimination] = useState<Elimination | null>(null);
  const [victoryStage, setVictoryStage] = useState<VictoryStage>('idle');

  // Cash shown in panels can lag engine cash while a transfer is mid-flight:
  // the receiver's figure only updates when the flying amount arrives.
  const [heldCash, setHeldCash] = useState<Partial<Record<PlayerId, number>>>({});
  const displayCash = (player: Player) => heldCash[player.id] ?? player.cash;

  const [cashDeltas, setCashDeltas] = useState<Partial<Record<PlayerId, number>>>({});
  const [knownCash, setKnownCash] = useState<Partial<Record<PlayerId, number>>>(() =>
    Object.fromEntries(state.players.map((p) => [p.id, p.cash]))
  );
  const cashChanged = state.players.some((p) => knownCash[p.id] !== displayCash(p));
  if (cashChanged) {
    const deltas: Partial<Record<PlayerId, number>> = {};
    for (const player of state.players) {
      const before = knownCash[player.id];
      const now = displayCash(player);
      if (before !== undefined && before !== now) {
        deltas[player.id] = now - before;
      }
    }
    setKnownCash(Object.fromEntries(state.players.map((p) => [p.id, displayCash(p)])));
    setCashDeltas((current) => ({ ...current, ...deltas }));
  }

  // -------------------------------------------------------------------
  // Toasts & flyers
  // -------------------------------------------------------------------

  const pushMoneyToast = useCallback(
    (type: NotificationType, label: string, amount: number, durationMs = TOAST_DURATION_MS) => {
      setToasts((prev) => [...prev.slice(-4), { id: nextId(), kind: 'money', type, label, amount, durationMs }]);
    },
    []
  );

  const pushMessageToast = useCallback((message: string) => {
    setToasts((prev) => [...prev.slice(-4), { id: nextId(), kind: 'message', message, durationMs: 2000 }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeFlyer = useCallback((id: number) => {
    setFlyers((prev) => prev.filter((f) => f.id !== id));
  }, []);

  function releaseHeldCash(ids: PlayerId[]) {
    setHeldCash((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });
  }

  // -------------------------------------------------------------------
  // Roll → dice settle → token hops → landing
  // -------------------------------------------------------------------

  const isRolling = rollId !== settledRollId;
  const isAnimatingMove = animatingPlayerId !== null;

  function animateMoveAndResolve(roll: DiceRoll) {
    const current = stateRef.current;
    const player = GameEngine.getCurrentPlayer(current);
    const fromIndex = player.boardPosition;
    const toIndex = (fromIndex + roll.total) % BOARD_SIZE;

    // Engine is the source of truth and moves immediately; the token catches up.
    actions.movePlayer(player.id, roll.total);

    animateToken({
      playerId: player.id,
      fromIndex,
      toIndex,
      onStep: (_index, crossedGo) => {
        sound.onTokenStep();
        emit('token_move_step');
        if (crossedGo) {
          setGoFlashKey((k) => k + 1);
          sound.onPassGo();
          emit('pass_go');
          pushMoneyToast('pass-go', `${player.name} passed GO`, 200, Math.max(t.ms('goToast'), 1));
        }
      },
      onComplete: () => {
        const space = GameEngine.getBoardSpace(toIndex);
        actions.resolveLanding();

        if (space.type === 'go-to-jail') {
          sound.onSentToJail();
          emit('sent_to_jail');
          pushMessageToast('Sent to Jail!');
        } else if (space.type === 'go') {
          setSpecialSpace('go');
        } else if (space.type === 'free-parking') {
          setSpecialSpace('free-parking');
        } else if (space.type === 'jail-visiting') {
          setSpecialSpace('jail-visiting');
        }
      },
    });
  }

  function startRoll(kind: RollKind) {
    if (isRolling || isAnimatingMove) return;
    rollKindRef.current = kind;
    sound.onDiceRoll();
    emit('dice_roll');
    if (kind === 'jail') {
      actions.rollForJailEscape();
    } else {
      actions.rollDice();
    }
    setRollId((id) => id + 1);
  }

  /** Called by DiceDisplay once the tumble finishes — movement starts from here, not from a timer. */
  function handleDiceSettled(id: number) {
    setSettledRollId(id);
    const current = stateRef.current;
    const roll = current.lastDiceRoll;
    if (!roll) return;

    if (roll.isSpecialDouble) {
      emit('special_double');
      return; // forced reroll (or, on a final jail attempt, the release panel) awaits the player
    }

    if (rollKindRef.current === 'jail') {
      if (current.turnPhase !== 'moving') return; // still jailed, released-with-fine, or liquidating
    }
    animateMoveAndResolve(roll);
  }

  function handleProceedAfterJailRelease() {
    const pending = stateRef.current.pendingAction;
    if (pending?.type !== 'jail-fine-applied') return;
    emit('jail_release');
    actions.proceedAfterJailRelease();
    if (pending.roll.isSpecialDouble) {
      startRoll('normal');
    } else {
      animateMoveAndResolve(pending.roll);
    }
  }

  // -------------------------------------------------------------------
  // Payments & trades
  // -------------------------------------------------------------------

  function flyCash(fromId: PlayerId, toId: PlayerId, amount: number) {
    const receiver = stateRef.current.players.find((p) => p.id === toId);
    if (!receiver) return;
    setHeldCash((prev) => ({ ...prev, [toId]: prev[toId] ?? receiver.cash }));
    setFlyers((prev) => [
      ...prev,
      {
        id: nextId(),
        from: `[data-cash="${fromId}"]`,
        to: `[data-cash="${toId}"]`,
        content: <FlyerCash amount={amount} />,
        durationS: t.s('rentTransfer'),
        onArrive: () => releaseHeldCash([toId]),
      },
    ]);
  }

  function handleBuy() {
    if (state.pendingAction?.type !== 'purchase-decision') return;
    actions.confirmPurchase(state.pendingAction.propertyId);
    sound.onPropertyBought();
    emit('property_purchase');
  }

  function handlePayRent() {
    const pending = stateRef.current.pendingAction;
    if (pending?.type !== 'rent-payment') return;
    const player = GameEngine.getCurrentPlayer(stateRef.current);
    pushMoneyToast('pay-rent', `${player.name} paid rent`, pending.amount);
    flyCash(player.id, pending.creditorId, pending.amount);
    actions.payRent();
    sound.onRentPaid();
    emit('rent_payment');
  }

  function handlePayObligation() {
    const pending = stateRef.current.pendingAction;
    if (pending?.type === 'bankruptcy-resolution' && pending.creditorId !== 'bank') {
      flyCash(GameEngine.getCurrentPlayer(stateRef.current).id, pending.creditorId, pending.amountOwed);
    }
    actions.payObligation();
  }

  function handlePayTax() {
    const pending = stateRef.current.pendingAction;
    if (pending?.type !== 'tax-payment') return;
    const player = GameEngine.getCurrentPlayer(stateRef.current);
    pushMoneyToast('pay-tax', `${player.name} paid tax`, pending.amount);
    actions.payTax();
    sound.onTaxPaid();
  }

  function handleAcceptTrade() {
    const proposal = stateRef.current.activeTradeProposal;
    if (!proposal) return;
    const players = stateRef.current.players;
    const colourOf = (id: string) => {
      const street = PROPERTIES.find((p) => p.id === id);
      return street ? COLOUR_GROUP_VAR[street.colourGroup] : 'var(--colour-text-muted)';
    };

    const legs: Array<{ from: PlayerId; to: PlayerId; propertyIds: string[]; cash: number; goojf: boolean }> = [
      {
        from: proposal.proposerId,
        to: proposal.recipientId,
        propertyIds: proposal.offeredPropertyIds,
        cash: proposal.offeredCash,
        goojf: proposal.includesOfferedGoojf,
      },
      {
        from: proposal.recipientId,
        to: proposal.proposerId,
        propertyIds: proposal.requestedPropertyIds,
        cash: proposal.requestedCash,
        goojf: proposal.includesRequestedGoojf,
      },
    ];

    const heldIds = [proposal.proposerId, proposal.recipientId];
    setHeldCash((prev) => {
      const next = { ...prev };
      for (const id of heldIds) {
        const player = players.find((p) => p.id === id);
        if (player && next[id] === undefined) next[id] = player.cash;
      }
      return next;
    });

    const newFlyers: Flyer[] = legs
      .filter((leg) => leg.propertyIds.length > 0 || leg.cash > 0 || leg.goojf)
      .map((leg) => ({
        id: nextId(),
        from: `[data-player-panel="${leg.from}"]`,
        to: `[data-player-panel="${leg.to}"]`,
        durationS: t.s('tradeTransfer'),
        content: (
          <>
            <FlyerChips colours={leg.propertyIds.map(colourOf)} />
            {leg.goojf && <FlyerChips colours={['var(--colour-success)']} />}
            {leg.cash > 0 && <FlyerCash amount={leg.cash} />}
          </>
        ),
      }));

    // Both panels' cash settles once everything has landed.
    if (newFlyers.length > 0) {
      const last = newFlyers[newFlyers.length - 1]!;
      last.onArrive = () => releaseHeldCash(heldIds);
      setFlyers((prev) => [...prev, ...newFlyers]);
    } else {
      releaseHeldCash(heldIds);
    }

    actions.acceptTrade(proposal.id);
    emit('trade_completed');
  }

  // -------------------------------------------------------------------
  // Bankruptcy sequence
  // -------------------------------------------------------------------

  function handleDeclareBankruptcy() {
    const current = stateRef.current;
    const player = GameEngine.getCurrentPlayer(current);
    const owned = BOARD.filter((space) => space.propertyId && current.ownership[space.propertyId]?.ownerId === player.id);

    // Step 1 (stamp) plays first; step 2 wave then clears tiles in board order.
    const releaseDelays: Record<string, number> = {};
    owned.forEach((space, i) => {
      releaseDelays[space.propertyId!] = t.s('bankruptStamp') + i * t.s('bankruptTileStagger');
    });
    const waveSeconds =
      t.s('bankruptStamp') + Math.max(0, owned.length - 1) * t.s('bankruptTileStagger') + t.s('bankruptTileFade');

    setElimination({
      player,
      panelIndex: current.players.findIndex((p) => p.id === player.id),
      releaseDelays,
      waveSeconds,
    });
    sound.onBankruptcy();
    emit('bankruptcy');
    actions.declareBankruptcy(player.id);
  }

  const eliminationPlayerId = elimination?.player.id;
  const eliminationWave = elimination?.waveSeconds;
  useEffect(() => {
    if (!eliminationPlayerId || eliminationWave === undefined) return;
    let cancelled = false;
    const wrap = scope.current?.querySelector(`[data-panel-wrap="${eliminationPlayerId}"]`);
    if (!wrap) {
      setElimination(null);
      return;
    }
    // Step 3: once the stamp and tile wave have played, the panel collapses.
    animateScope(
      wrap,
      { opacity: 0, height: 0, paddingBottom: 0 },
      { duration: t.s('bankruptPanelCollapse'), delay: eliminationWave, ease: 'easeInOut' }
    ).then(() => {
      if (!cancelled) setElimination(null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eliminationPlayerId]);

  // -------------------------------------------------------------------
  // Victory sequence (steps 1–3 here; 4–8 in GameOverModal)
  // -------------------------------------------------------------------

  const isGameOver = state.gamePhase === 'game-over';
  const winnerId = state.winner;
  useEffect(() => {
    if (!isGameOver || !winnerId || elimination || victoryStage !== 'idle') return;
    let cancelled = false;
    const root = scope.current;
    if (!root) return;

    async function play() {
      setVictoryStage('board');
      sound.onVictory();
      emit('victory');

      // 1. Any other panels fade and collapse, staggered — after the post-bankruptcy pause.
      const others = Array.from(root!.querySelectorAll(`[data-panel-wrap]:not([data-panel-wrap="${winnerId}"])`));
      await animateScope(root!, { opacity: 1 }, { duration: t.s('victoryPause') });
      if (others.length > 0) {
        await animateScope(
          others,
          { opacity: 0, height: 0, paddingBottom: 0 },
          { duration: t.s('victoryPanelsOut'), delay: stagger(t.s('victoryPanelStagger')) }
        );
      }
      if (cancelled) return;

      // 2. The winner's token pulses gold.
      const token = root!.querySelector(`[data-token="${winnerId}"]`);
      if (token) {
        await animateScope(
          token,
          {
            scale: [1, 1.9, 1.4],
            filter: ['drop-shadow(0 0 0px #e8c96a)', 'drop-shadow(0 0 18px #e8c96a)', 'drop-shadow(0 0 10px #c9a84c)'],
          },
          { duration: t.s('victoryTokenPulse'), ease: 'easeOut' }
        );
      }
      if (cancelled) return;

      // 3. The board recedes into the background.
      const board = root!.querySelector('[data-board-column]');
      if (board) {
        await animateScope(board, { opacity: 0.15 }, { duration: t.s('victoryBoardFade'), ease: 'easeOut' });
      }
      if (!cancelled) setVictoryStage('overlay');
    }

    play();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, winnerId, elimination]);

  // -------------------------------------------------------------------
  // Engine-driven phase effects
  // -------------------------------------------------------------------

  useEffect(() => {
    if (state.turnPhase === 'drawing-card') {
      sound.onCardDrawn();
      emit('card_drawn');
      actions.drawCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turnPhase]);

  useEffect(() => {
    if (state.turnPhase === 'turn-ended' && state.gamePhase !== 'game-over') {
      const timer = setTimeout(() => actions.endTurn(), TURN_ENDED_DELAY_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turnPhase, state.currentPlayerIndex, state.gamePhase]);

  const currentPlayer = state.players[state.currentPlayerIndex] ?? state.players[0]!;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== ' ') return;
      const s = stateRef.current;
      const player = s.players[s.currentPlayerIndex];
      if (s.turnPhase === 'awaiting-roll' && !s.pendingAction && player && !player.isInJail) {
        e.preventDefault();
        startRoll('normal');
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  const nextPlayer = state.players[(state.currentPlayerIndex + 1) % state.players.length];
  const playerColour = PLAYER_COLOUR_VAR[currentPlayer.id];

  const actionPanelState: GameState = isRolling
    ? { ...state, turnPhase: 'rolling' }
    : isAnimatingMove
      ? { ...state, turnPhase: 'moving' }
      : state;

  // Keep the eliminated player's panel on screen until its collapse finishes.
  const panelPlayers = [...state.players];
  if (elimination && !panelPlayers.some((p) => p.id === elimination.player.id)) {
    panelPlayers.splice(elimination.panelIndex, 0, elimination.player);
  }

  const busy = isRolling || isAnimatingMove;
  const pending = state.pendingAction;

  return (
    <div className={styles.root} ref={scope}>
      <div
        className={styles.frame}
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setShowMenu(true)}>
            MENU
          </button>
          <span className={styles.topSpacer} />
          <span className={styles.roundLabel}>TURN {state.log.length > 0 ? state.currentPlayerIndex + 1 : 1}</span>
          <div className={styles.activePlayerTag}>
            <span className={styles.activePlayerDot} style={{ background: playerColour }} />
            <span className={styles.activePlayerName}>{currentPlayer.name}</span>
          </div>
          <span className={styles.activePlayerCash}>${displayCash(currentPlayer).toLocaleString()}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.actionColumn}>
            <div className={styles.actionSlot}>
              <ActionPanel
                state={actionPanelState}
                onRoll={() => startRoll('normal')}
                onEndTurn={() => actions.endTurn()}
                nextPlayerName={nextPlayer?.name ?? ''}
                onJailRoll={() => startRoll('jail')}
                onPayJailFine={() => actions.payJailFine()}
                onUseGoojfCard={() => actions.useGoojfCard()}
                onProceedAfterJailRelease={handleProceedAfterJailRelease}
                onOpenBuild={() => setShowBuildModal(true)}
                onOpenTrade={() => setShowTradeModal(true)}
                onOpenMortgage={() => setShowMortgageModal(true)}
                onOpenPortfolio={() => setShowPortfolio(true)}
              />
            </div>
            <GameLog state={state} />
          </div>

          <div className={styles.boardColumn} data-board-column>
            <Board
              state={state}
              displayPositions={displayPositions}
              steppingPlayerId={animatingPlayerId}
              goFlashKey={goFlashKey}
              releaseDelays={elimination?.releaseDelays ?? {}}
              onTileClick={(propertyId) => {
                if (propertyId) setInspectedPropertyId(propertyId);
              }}
            >
              <DiceDisplay
                roll={state.lastDiceRoll}
                rollId={rollId}
                isInJail={currentPlayer.isInJail}
                onSettled={handleDiceSettled}
              />
            </Board>
          </div>

          <div className={styles.playerColumn}>
            {panelPlayers.map((player) => (
              <div key={player.id} className={styles.panelWrap} data-panel-wrap={player.id}>
                <PlayerPanel
                  player={player}
                  isActive={player.id === currentPlayer.id}
                  state={state}
                  displayCash={displayCash(player)}
                  cashDelta={cashDeltas[player.id] ?? null}
                  onDismissDelta={() => setCashDeltas((current) => ({ ...current, [player.id]: undefined }))}
                  isBeingEliminated={elimination?.player.id === player.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlays render at viewport scale, outside the scaled frame. */}

      <AnimatePresence>
        {!busy && state.turnPhase === 'awaiting-purchase-decision' && pending?.type === 'purchase-decision' && (
          <PurchaseModal
            key="purchase"
            propertyId={pending.propertyId}
            price={pending.price}
            state={state}
            onBuy={handleBuy}
            onPass={() => actions.declinePurchase()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!busy && state.turnPhase === 'awaiting-rent-payment' && pending?.type === 'rent-payment' && (
          <RentModal
            key="rent"
            amount={pending.amount}
            creditorId={pending.creditorId}
            propertyId={pending.propertyId}
            state={state}
            onPay={handlePayRent}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!busy && state.turnPhase === 'awaiting-tax-payment' && pending?.type === 'tax-payment' && (
          <TaxModal
            key="tax"
            amount={pending.amount}
            spaceName={pending.spaceName}
            state={state}
            onPay={handlePayTax}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.turnPhase === 'resolving-card' && pending?.type === 'card-drawn' && (
          <CardModal key={pending.card.id} card={pending.card} state={state} onContinue={() => actions.resolveCard()} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!busy && state.turnPhase === 'awaiting-bankruptcy-resolution' && pending?.type === 'bankruptcy-resolution' && (
          <LiquidationModal
            key="liquidation"
            state={state}
            playerId={currentPlayer.id}
            amountOwed={pending.amountOwed}
            creditorId={pending.creditorId}
            onSellHouse={(propertyId) => {
              actions.sellHouse(propertyId);
              emit('building_sold');
            }}
            onSellHotel={(propertyId) => {
              actions.sellHotel(propertyId);
              emit('building_sold');
            }}
            onMortgage={(propertyId) => {
              actions.mortgageProperty(propertyId);
              emit('mortgage');
            }}
            onPay={handlePayObligation}
            onDeclareBankruptcy={handleDeclareBankruptcy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {specialSpace && <SpecialSpaceModal key={specialSpace} kind={specialSpace} onDismiss={() => setSpecialSpace(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {inspectedPropertyId && (
          <PropertyDrawer
            key="drawer"
            propertyId={inspectedPropertyId}
            state={state}
            onClose={() => setInspectedPropertyId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPortfolio && (
          <PortfolioPanel
            key="portfolio"
            state={state}
            playerId={currentPlayer.id}
            isCurrentPlayer={true}
            onClose={() => setShowPortfolio(false)}
            onBuildHouse={(id) => {
              actions.buildHouse(id);
              emit('house_placed');
            }}
            onBuildHotel={(id) => {
              actions.buildHotel(id);
              emit('hotel_upgrade');
            }}
            onSellHouse={(id) => {
              actions.sellHouse(id);
              emit('building_sold');
            }}
            onSellHotel={(id) => {
              actions.sellHotel(id);
              emit('building_sold');
            }}
            onMortgage={(id) => {
              actions.mortgageProperty(id);
              emit('mortgage');
            }}
            onUnmortgage={(id) => {
              actions.unmortgageProperty(id);
              emit('unmortgage');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBuildModal && (
          <BuildModal
            key="build"
            state={state}
            playerId={currentPlayer.id}
            onClose={() => setShowBuildModal(false)}
            onBuildHouse={(propertyId) => {
              actions.buildHouse(propertyId);
              emit('house_placed');
            }}
            onBuildHotel={(propertyId) => {
              actions.buildHotel(propertyId);
              emit('hotel_upgrade');
            }}
            onSellHouse={(propertyId) => {
              actions.sellHouse(propertyId);
              emit('building_sold');
            }}
            onSellHotel={(propertyId) => {
              actions.sellHotel(propertyId);
              emit('building_sold');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMortgageModal && (
          <MortgageModal
            key="mortgage"
            state={state}
            playerId={currentPlayer.id}
            onClose={() => setShowMortgageModal(false)}
            onMortgage={(propertyId) => {
              actions.mortgageProperty(propertyId);
              emit('mortgage');
            }}
            onUnmortgage={(propertyId) => {
              actions.unmortgageProperty(propertyId);
              emit('unmortgage');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTradeModal && !state.activeTradeProposal && (
          <TradeModal
            key="trade"
            state={state}
            proposerId={currentPlayer.id}
            onClose={() => setShowTradeModal(false)}
            onPropose={(proposal) => {
              actions.proposeTrade(proposal);
              setShowTradeModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.activeTradeProposal && (
          <TradeResponseModal
            key={state.activeTradeProposal.id}
            proposal={state.activeTradeProposal}
            state={state}
            onAccept={handleAcceptTrade}
            onReject={() => actions.rejectTrade(state.activeTradeProposal!.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <GameMenu
            key="menu"
            onResume={() => setShowMenu(false)}
            onRules={() => setShowMenu(false)}
            onSettings={() => setShowMenu(false)}
            onRestart={onNewGame}
            onQuit={onNewGame}
          />
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <FlyLayer flyers={flyers} onDone={removeFlyer} />

      {victoryStage === 'overlay' && <GameOverModal state={state} onPlayAgain={onNewGame} onMainMenu={onNewGame} />}
    </div>
  );
}
