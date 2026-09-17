import { BOARD } from '@/engine/data/board';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '@/engine/data/cards';
import { ALL_PURCHASABLES, PURCHASABLE_BY_ID } from '@/engine/data/properties';
import type {
  BoardSpace,
  GameState,
  OwnershipRecord,
  PendingAction,
  Player,
  PlayerId,
  Purchasable,
  TradeProposal,
  TurnPhase,
} from '@/engine/models/types';
import {
  calculateLiquidationValue,
  checkBankruptcy,
  declareBankruptcy as declareBankruptcyRule,
} from '@/engine/rules/bankruptcy';
import { buyHouse, sellHotel, sellHouse, upgradeToHotel } from '@/engine/rules/building';
import { drawCard, executeCardEffect } from '@/engine/rules/cards';
import { resolveDiceOutcome, rollDice } from '@/engine/rules/dice';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';
import {
  attemptJailEscape,
  payJailFine as payJailFineRule,
  sendToJail,
  useGetOutOfJailFreeCard as redeemGoojfCard,
} from '@/engine/rules/jail';
import { mortgageProperty as mortgagePropertyRule, unmortgageProperty as unmortgagePropertyRule } from '@/engine/rules/mortgage';
import { movePlayer } from '@/engine/rules/movement';
import { calculateRent as calculateRentRule } from '@/engine/rules/rent';
import { executeTrade, validateTrade } from '@/engine/rules/trade';

const PLAYER_IDS: PlayerId[] = ['player-1', 'player-2', 'player-3', 'player-4'];
const STARTING_CASH = 1500;
const INCOME_TAX = 200;
const SUPER_TAX = 100;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i] as T;
    const b = copy[j] as T;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

function advanceCurrentPlayerIndexAfterRemoval(state: GameState, removedIndex: number): GameState {
  if (state.players.length === 0) {
    return { ...state, currentPlayerIndex: 0 };
  }
  let newIndex = state.currentPlayerIndex;
  if (removedIndex < newIndex) {
    newIndex -= 1;
  }
  newIndex = newIndex % state.players.length;
  return { ...state, currentPlayerIndex: newIndex };
}

export class GameEngine {
  // -------------------------------------------------------------------
  // Setup
  // -------------------------------------------------------------------

  static createNewGame(playerSetups: Array<{ name: string; tokenId: string }>): GameState {
    if (playerSetups.length < 2 || playerSetups.length > 4) {
      throw new Error('RULES: Borough requires between 2 and 4 players.');
    }

    const players: Player[] = playerSetups.map((setup, index) => {
      const id = PLAYER_IDS[index];
      if (!id) {
        throw new Error('RULES: Too many players for available player slots.');
      }
      return {
        id,
        name: setup.name,
        tokenId: setup.tokenId,
        cash: STARTING_CASH,
        boardPosition: 0,
        status: 'active',
        isInJail: false,
        jailTurnsUsed: 0,
        getOutOfJailFreeCards: 0,
      };
    });

    const ownership: Record<string, OwnershipRecord> = {};
    for (const asset of ALL_PURCHASABLES) {
      ownership[asset.id] = {
        propertyId: asset.id,
        ownerId: 'bank',
        isMortgaged: false,
        buildings: 0,
      };
    }

    const initialState: GameState = {
      gameId: `game-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
      gamePhase: 'setup',
      players,
      eliminatedPlayers: [],
      currentPlayerIndex: 0,
      turnPhase: 'awaiting-roll',
      ownership,
      lastDiceRoll: null,
      chanceDeck: [...CHANCE_CARDS],
      communityChestDeck: [...COMMUNITY_CHEST_CARDS],
      activeTradeProposal: null,
      pendingAction: null,
      log: [],
      winner: null,
    };

    return this.initializeDeckOrder(initialState);
  }

  static initializeDeckOrder(state: GameState): GameState {
    return {
      ...state,
      chanceDeck: shuffle(state.chanceDeck),
      communityChestDeck: shuffle(state.communityChestDeck),
    };
  }

  // -------------------------------------------------------------------
  // Determining turn order
  // -------------------------------------------------------------------

  static rollForOrder(playerId: PlayerId, state: GameState): GameState {
    const player = getPlayer(playerId, state);
    const roll = rollDice();
    return addLogEntry(
      { ...state, gamePhase: 'determining-order', lastDiceRoll: roll },
      {
        playerId,
        description: `${player.name} rolled ${roll.total} to determine turn order.`,
      }
    );
  }

  static finalizePlayerOrder(state: GameState): GameState {
    return {
      ...state,
      gamePhase: 'playing',
      currentPlayerIndex: 0,
      turnPhase: 'awaiting-roll',
    };
  }

  // -------------------------------------------------------------------
  // Turn flow
  // -------------------------------------------------------------------

  static rollDice(state: GameState): GameState {
    const roll = rollDice();
    return resolveDiceOutcome(roll, state);
  }

  static resolveLanding(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const space = this.getBoardSpace(player.boardPosition);

    if (space.type === 'go-to-jail') {
      return sendToJail(player.id, state);
    }

    if (space.type === 'income-tax') {
      return this.obligationOrBankruptcy(
        state,
        INCOME_TAX,
        'bank',
        'awaiting-tax-payment',
        { type: 'tax-payment', amount: INCOME_TAX, spaceName: space.name }
      );
    }

    if (space.type === 'super-tax') {
      return this.obligationOrBankruptcy(
        state,
        SUPER_TAX,
        'bank',
        'awaiting-tax-payment',
        { type: 'tax-payment', amount: SUPER_TAX, spaceName: space.name }
      );
    }

    if (space.type === 'chance' || space.type === 'community-chest') {
      return {
        ...state,
        turnPhase: 'drawing-card',
        pendingAction: null,
      };
    }

    if (space.type === 'street' || space.type === 'station' || space.type === 'utility') {
      const propertyId = space.propertyId;
      if (!propertyId) {
        throw new Error(`RULES: Board space at index ${space.index} is missing its propertyId.`);
      }
      const record = state.ownership[propertyId];
      if (!record) {
        throw new Error(`RULES: No ownership record for "${propertyId}".`);
      }

      if (record.ownerId === 'bank') {
        const asset = PURCHASABLE_BY_ID[propertyId];
        if (!asset) {
          throw new Error(`RULES: Unknown purchasable "${propertyId}".`);
        }
        return {
          ...state,
          turnPhase: 'awaiting-purchase-decision',
          pendingAction: { type: 'purchase-decision', propertyId, price: asset.buyPrice },
        };
      }

      if (record.ownerId === player.id) {
        return { ...state, turnPhase: 'strategic-action', pendingAction: null };
      }

      const rent = this.calculateRent(propertyId, state);
      return this.obligationOrBankruptcy(
        state,
        rent,
        record.ownerId,
        'awaiting-rent-payment',
        { type: 'rent-payment', amount: rent, creditorId: record.ownerId, propertyId }
      );
    }

    // go, jail-visiting, free-parking — nothing to resolve
    return { ...state, turnPhase: 'strategic-action', pendingAction: null };
  }

  static confirmPurchase(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const asset = PURCHASABLE_BY_ID[propertyId];
    if (!asset) {
      throw new Error(`RULES: Unknown purchasable "${propertyId}".`);
    }
    const record = state.ownership[propertyId];
    if (!record || record.ownerId !== 'bank') {
      throw new Error(`RULES: "${propertyId}" is not available for purchase.`);
    }
    if (player.cash < asset.buyPrice) {
      throw new Error('RULES: Insufficient cash to complete this purchase.');
    }

    let newState: GameState = {
      ...state,
      ownership: {
        ...state.ownership,
        [propertyId]: { ...record, ownerId: player.id },
      },
    };
    newState = updatePlayer(player.id, newState, (p) => ({ ...p, cash: p.cash - asset.buyPrice }));
    newState = addLogEntry(newState, {
      playerId: player.id,
      description: `${player.name} bought ${asset.name} for $${asset.buyPrice}.`,
      cashDelta: -asset.buyPrice,
    });

    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  static declinePurchase(state: GameState): GameState {
    return { ...state, turnPhase: 'strategic-action', pendingAction: null };
  }

  static payRent(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    if (!state.pendingAction || state.pendingAction.type !== 'rent-payment') {
      throw new Error('RULES: No rent payment is pending.');
    }
    const { amount, creditorId } = state.pendingAction;
    const creditor = getPlayer(creditorId, state);

    let newState = updatePlayer(player.id, state, (p) => ({ ...p, cash: p.cash - amount }));
    newState = updatePlayer(creditorId, newState, (p) => ({ ...p, cash: p.cash + amount }));
    newState = addLogEntry(newState, {
      playerId: player.id,
      description: `${player.name} paid $${amount} rent to ${creditor.name}.`,
      cashDelta: -amount,
    });

    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  /**
   * If the current player can afford `amount`, transitions into the given
   * "awaiting payment" phase/pendingAction. Otherwise the obligation cannot
   * be met from cash alone, so the turn escalates into the liquidation flow
   * (`awaiting-bankruptcy-resolution`) where the player can sell buildings
   * or mortgage properties before settling the debt via `payObligation`, or
   * declare bankruptcy outright.
   */
  private static obligationOrBankruptcy(
    state: GameState,
    amount: number,
    creditorId: PlayerId | 'bank',
    awaitingPhase: TurnPhase,
    awaitingPendingAction: PendingAction
  ): GameState {
    const player = this.getCurrentPlayer(state);
    if (player.cash >= amount) {
      return { ...state, turnPhase: awaitingPhase, pendingAction: awaitingPendingAction };
    }
    return {
      ...state,
      turnPhase: 'awaiting-bankruptcy-resolution',
      pendingAction: { type: 'bankruptcy-resolution', amountOwed: amount, creditorId },
    };
  }

  /** Settles a `bankruptcy-resolution` obligation once liquidation has made it affordable. */
  static payObligation(state: GameState): GameState {
    if (!state.pendingAction || state.pendingAction.type !== 'bankruptcy-resolution') {
      throw new Error('RULES: No obligation is pending resolution.');
    }
    const player = this.getCurrentPlayer(state);
    const { amountOwed, creditorId } = state.pendingAction;
    if (player.cash < amountOwed) {
      throw new Error('RULES: Insufficient cash to settle this obligation.');
    }

    let newState = updatePlayer(player.id, state, (p) => ({ ...p, cash: p.cash - amountOwed }));
    if (creditorId !== 'bank') {
      newState = updatePlayer(creditorId, newState, (p) => ({ ...p, cash: p.cash + amountOwed }));
    }
    const creditorName = creditorId === 'bank' ? 'the Bank' : getPlayer(creditorId, newState).name;
    newState = addLogEntry(newState, {
      playerId: player.id,
      description: `${player.name} settled a ${amountOwed} debt to ${creditorName} after liquidating assets.`,
      cashDelta: -amountOwed,
    });

    const { resumeAfter } = state.pendingAction;
    if (resumeAfter) {
      return { ...newState, turnPhase: 'awaiting-roll', pendingAction: resumeAfter };
    }
    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  static payTax(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    if (!state.pendingAction || state.pendingAction.type !== 'tax-payment') {
      throw new Error('RULES: No tax payment is pending.');
    }
    const { amount, spaceName } = state.pendingAction;

    let newState = updatePlayer(player.id, state, (p) => ({ ...p, cash: p.cash - amount }));
    newState = addLogEntry(newState, {
      playerId: player.id,
      description: `${player.name} paid $${amount} for ${spaceName}.`,
      cashDelta: -amount,
    });

    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  static drawCardForCurrentSpace(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const space = this.getBoardSpace(player.boardPosition);
    if (space.type !== 'chance' && space.type !== 'community-chest') {
      throw new Error('RULES: The current space does not draw a card.');
    }
    const deckType = space.type === 'chance' ? 'chance' : 'community-chest';
    const { card, newState } = drawCard(deckType, state);
    return {
      ...newState,
      turnPhase: 'resolving-card',
      pendingAction: { type: 'card-drawn', card },
    };
  }

  static resolveDrawnCard(state: GameState): GameState {
    if (!state.pendingAction || state.pendingAction.type !== 'card-drawn') {
      throw new Error('RULES: No card is pending resolution.');
    }
    const player = this.getCurrentPlayer(state);
    const card = state.pendingAction.card;
    const newState = executeCardEffect(card, player.id, state);

    // A card effect that needs further player input (buy this station? pay
    // this rent? liquidate assets?) sets its own pendingAction — preserve it.
    // Otherwise clear the stale `card-drawn` pendingAction and resume play.
    if (newState.pendingAction && newState.pendingAction.type !== 'card-drawn') {
      return newState;
    }
    if (newState.turnPhase === 'turn-ended') {
      return newState;
    }

    return { ...newState, turnPhase: 'strategic-action', pendingAction: null };
  }

  static endTurn(state: GameState): GameState {
    if (state.players.length === 0) {
      return state;
    }
    const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
    return {
      ...state,
      currentPlayerIndex: nextIndex,
      turnPhase: 'awaiting-roll',
      pendingAction: null,
      lastDiceRoll: null,
    };
  }

  // -------------------------------------------------------------------
  // Jail
  // -------------------------------------------------------------------

  static rollForJailEscape(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const roll = rollDice();
    const { escaped, newState } = attemptJailEscape(player.id, roll, state);
    if (escaped) {
      return { ...newState, turnPhase: 'moving' };
    }
    return newState;
  }

  /**
   * Continues a turn after the automatic jail fine (`jail-fine-applied`):
   * moves with the roll that failed the final attempt, or — if that roll was
   * a 6+6, which never moves — hands back a normal roll.
   */
  static proceedAfterJailRelease(state: GameState): GameState {
    if (state.pendingAction?.type !== 'jail-fine-applied') {
      throw new Error('RULES: No jail release is pending.');
    }
    const { roll } = state.pendingAction;
    if (roll.isSpecialDouble) {
      return { ...state, turnPhase: 'awaiting-roll', pendingAction: null };
    }
    return { ...state, lastDiceRoll: roll, turnPhase: 'moving', pendingAction: null };
  }

  static payJailFine(state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    return payJailFineRule(player.id, state);
  }

  /**
   * `deckType` selects which deck's GOOJF card is redeemed and returned to
   * the bottom. `Player.getOutOfJailFreeCards` is a plain count with no
   * record of deck origin, so the caller must say which deck to credit;
   * it defaults to `'chance'` when the UI has no preference.
   */
  static useGoojfCard(state: GameState, deckType: 'chance' | 'community-chest' = 'chance'): GameState {
    const player = this.getCurrentPlayer(state);
    return redeemGoojfCard(player.id, state, deckType);
  }

  // -------------------------------------------------------------------
  // Strategic actions
  // -------------------------------------------------------------------

  static buyHouse(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = buyHouse(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  static upgradeToHotel(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = upgradeToHotel(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  static sellHouse(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = sellHouse(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  static sellHotel(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = sellHotel(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  static mortgageProperty(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = mortgagePropertyRule(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  static unmortgageProperty(propertyId: string, state: GameState): GameState {
    const player = this.getCurrentPlayer(state);
    const result = unmortgagePropertyRule(player.id, propertyId, state);
    if (!result.success) {
      throw new Error(result.reason);
    }
    return result.newState;
  }

  // -------------------------------------------------------------------
  // Trading
  // -------------------------------------------------------------------

  static proposeTrade(
    proposal: Omit<TradeProposal, 'id' | 'status'>,
    state: GameState
  ): GameState {
    const fullProposal: TradeProposal = {
      ...proposal,
      id: `trade-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
      status: 'pending',
    };
    const check = validateTrade(fullProposal, state);
    if (!check.valid) {
      throw new Error(check.reason);
    }
    return { ...state, activeTradeProposal: fullProposal };
  }

  static acceptTrade(tradeId: string, state: GameState): GameState {
    if (!state.activeTradeProposal || state.activeTradeProposal.id !== tradeId) {
      throw new Error('RULES: No matching trade proposal is active.');
    }
    const accepted: TradeProposal = { ...state.activeTradeProposal, status: 'accepted' };
    return executeTrade(accepted, { ...state, activeTradeProposal: accepted });
  }

  static rejectTrade(tradeId: string, state: GameState): GameState {
    if (!state.activeTradeProposal || state.activeTradeProposal.id !== tradeId) {
      throw new Error('RULES: No matching trade proposal is active.');
    }
    return { ...state, activeTradeProposal: null };
  }

  // -------------------------------------------------------------------
  // Bankruptcy
  // -------------------------------------------------------------------

  static declareBankruptcy(playerId: PlayerId, state: GameState): GameState {
    const removedIndex = state.players.findIndex((p) => p.id === playerId);
    let newState = declareBankruptcyRule(playerId, state);
    newState = advanceCurrentPlayerIndexAfterRemoval(newState, removedIndex);

    if (newState.gamePhase === 'game-over') {
      return { ...newState, turnPhase: 'turn-ended', pendingAction: null };
    }
    return { ...newState, turnPhase: 'awaiting-roll', pendingAction: null, lastDiceRoll: null };
  }

  /** Sell/mortgage actions the player could take right now to raise cash, with their cash yield. */
  static getLiquidationOptions(
    playerId: PlayerId,
    state: GameState
  ): Array<{ propertyId: string; action: 'sell-house' | 'sell-hotel' | 'mortgage'; yieldAmount: number }> {
    const options: Array<{
      propertyId: string;
      action: 'sell-house' | 'sell-hotel' | 'mortgage';
      yieldAmount: number;
    }> = [];

    for (const [propertyId, record] of Object.entries(state.ownership)) {
      if (record.ownerId !== playerId) continue;
      const asset = PURCHASABLE_BY_ID[propertyId];
      if (!asset) continue;

      if (asset.type === 'street') {
        if (record.buildings === 5) {
          options.push({ propertyId, action: 'sell-hotel', yieldAmount: asset.houseCost });
        } else if (record.buildings > 0) {
          options.push({ propertyId, action: 'sell-house', yieldAmount: asset.houseCost });
        }
      }
      if (record.buildings === 0 && !record.isMortgaged) {
        options.push({ propertyId, action: 'mortgage', yieldAmount: asset.mortgageValue });
      }
    }

    return options;
  }

  /** Whether the player can cover `debt` from cash alone, via liquidation, or not at all. */
  static checkSolvency(playerId: PlayerId, debt: number, state: GameState): 'solvent' | 'can-liquidate' | 'bankrupt' {
    const player = getPlayer(playerId, state);
    if (player.cash >= debt) return 'solvent';
    if (this.getNetWorth(playerId, state) >= debt) return 'can-liquidate';
    return 'bankrupt';
  }

  /** Options available to a jailed player at the start of their turn. */
  static getJailOptions(playerId: PlayerId, state: GameState): Array<'roll' | 'pay-fine' | 'use-goojf-card'> {
    const player = getPlayer(playerId, state);
    const options: Array<'roll' | 'pay-fine' | 'use-goojf-card'> = ['roll', 'pay-fine'];
    if (player.getOutOfJailFreeCards > 0) {
      options.push('use-goojf-card');
    }
    return options;
  }

  // -------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------

  static getProperty(propertyId: string): Purchasable {
    const asset = PURCHASABLE_BY_ID[propertyId];
    if (!asset) {
      throw new Error(`RULES: Unknown property id "${propertyId}".`);
    }
    return asset;
  }

  static getBoardSpace(index: number): BoardSpace {
    const space = BOARD[index];
    if (!space) {
      throw new Error(`RULES: Invalid board index ${index}.`);
    }
    return space;
  }

  static getCurrentPlayer(state: GameState): Player {
    const player = state.players[state.currentPlayerIndex];
    if (!player) {
      throw new Error('RULES: No current player available.');
    }
    return player;
  }

  static getOwnership(propertyId: string, state: GameState): OwnershipRecord {
    const record = state.ownership[propertyId];
    if (!record) {
      throw new Error(`RULES: No ownership record for "${propertyId}".`);
    }
    return record;
  }

  static canBuild(playerId: PlayerId, propertyId: string, state: GameState): boolean {
    const result = buyHouse(playerId, propertyId, state);
    return result.success;
  }

  static canMortgage(playerId: PlayerId, propertyId: string, state: GameState): boolean {
    const record = state.ownership[propertyId];
    return !!record && record.ownerId === playerId && !record.isMortgaged && record.buildings === 0;
  }

  static canTrade(playerId: PlayerId, state: GameState): boolean {
    return state.players.some((p) => p.id === playerId && p.status === 'active');
  }

  static calculateRent(propertyId: string, state: GameState): number {
    const roll = state.lastDiceRoll ?? { die1: 1, die2: 1, total: 2, isDouble: true, isSpecialDouble: false };
    return calculateRentRule(propertyId, roll, state);
  }

  static getNetWorth(playerId: PlayerId, state: GameState): number {
    return calculateLiquidationValue(playerId, state);
  }

  static isBankrupt(playerId: PlayerId, amountOwed: number, state: GameState): boolean {
    return checkBankruptcy(playerId, amountOwed, state);
  }

  // -------------------------------------------------------------------
  // Movement (exposed for resolving the `moving` turn phase)
  // -------------------------------------------------------------------

  static movePlayer(playerId: PlayerId, spaces: number, state: GameState): GameState {
    const { newState } = movePlayer(playerId, spaces, state);
    return { ...newState, turnPhase: 'resolving-landing' };
  }
}
