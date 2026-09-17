// ---------------------------------------------------------------------------
// Colour groups
// ---------------------------------------------------------------------------

export type ColourGroup =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue';

// ---------------------------------------------------------------------------
// Purchasable assets
// ---------------------------------------------------------------------------

export interface Property {
  id: string;
  name: string;
  type: 'street';
  colourGroup: ColourGroup;
  buyPrice: number;
  mortgageValue: number;
  houseCost: number;
  baseRent: number;
  rentWithHouses: [number, number, number, number];
  rentWithHotel: number;
  boardIndex: number;
}

export interface Station {
  id: string;
  name: string;
  type: 'station';
  buyPrice: 200;
  mortgageValue: 100;
  boardIndex: number;
}

export interface Utility {
  id: string;
  name: string;
  type: 'utility';
  buyPrice: 150;
  mortgageValue: 75;
  boardIndex: number;
}

export type Purchasable = Property | Station | Utility;

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

export type BoardSpaceType =
  | 'go'
  | 'street'
  | 'station'
  | 'utility'
  | 'chance'
  | 'community-chest'
  | 'income-tax'
  | 'super-tax'
  | 'jail-visiting'
  | 'go-to-jail'
  | 'free-parking';

export interface BoardSpace {
  index: number;
  type: BoardSpaceType;
  name: string;
  propertyId?: string;
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export type CardDeckType = 'chance' | 'community-chest';

export type CardEffect =
  | { kind: 'move-to'; destinationIndex: number; collectGoIfPassed: boolean }
  | { kind: 'move-relative'; spaces: number }
  | { kind: 'collect'; amount: number }
  | { kind: 'pay'; amount: number }
  | { kind: 'collect-from-each'; amount: number }
  | { kind: 'pay-per-building'; houseAmount: number; hotelAmount: number }
  | { kind: 'go-to-jail' }
  | { kind: 'get-out-of-jail-free' }
  | { kind: 'move-to-nearest-station' }
  | { kind: 'move-to-nearest-utility' };

export interface Card {
  id: string;
  deck: CardDeckType;
  text: string;
  effect: CardEffect;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export type PlayerId = 'player-1' | 'player-2' | 'player-3' | 'player-4';

export type PlayerStatus = 'active' | 'bankrupt';

export interface Player {
  id: PlayerId;
  name: string;
  tokenId: string;
  cash: number;
  boardPosition: number;
  status: PlayerStatus;
  isInJail: boolean;
  /** Failed "roll for double" attempts this jail stay (0–3). Reset on entering or leaving jail. */
  jailTurnsUsed: number;
  getOutOfJailFreeCards: number;
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export interface OwnershipRecord {
  propertyId: string;
  ownerId: PlayerId | 'bank';
  isMortgaged: boolean;
  buildings: number;
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
  isSpecialDouble: boolean;
}

// ---------------------------------------------------------------------------
// Trading
// ---------------------------------------------------------------------------

export interface TradeProposal {
  id: string;
  proposerId: PlayerId;
  recipientId: PlayerId;
  offeredPropertyIds: string[];
  offeredCash: number;
  requestedPropertyIds: string[];
  requestedCash: number;
  includesOfferedGoojf: boolean;
  includesRequestedGoojf: boolean;
  status: 'pending' | 'accepted' | 'rejected';
}

// ---------------------------------------------------------------------------
// Turn / game phase
// ---------------------------------------------------------------------------

export type TurnPhase =
  | 'awaiting-roll'
  | 'rolling'
  | 'moving'
  | 'resolving-landing'
  | 'awaiting-purchase-decision'
  | 'awaiting-rent-payment'
  | 'awaiting-tax-payment'
  | 'drawing-card'
  | 'resolving-card'
  | 'awaiting-jail-decision'
  | 'awaiting-bankruptcy-resolution'
  | 'strategic-action'
  | 'turn-ended';

export type GamePhase = 'setup' | 'determining-order' | 'playing' | 'game-over';

// ---------------------------------------------------------------------------
// Pending action
// ---------------------------------------------------------------------------

export type PendingAction =
  | { type: 'purchase-decision'; propertyId: string; price: number }
  | { type: 'rent-payment'; amount: number; creditorId: PlayerId; propertyId: string }
  | { type: 'tax-payment'; amount: number; spaceName: string }
  | { type: 'jail-decision' }
  | { type: 'card-drawn'; card: Card }
  | { type: 'forced-reroll' }
  | JailFineAppliedAction
  | {
      type: 'bankruptcy-resolution';
      amountOwed: number;
      creditorId: PlayerId | 'bank';
      /** Pending action to restore once the debt is settled (an auto jail fine that still needs its move). */
      resumeAfter?: JailFineAppliedAction;
    };

/**
 * A jailed player failed their final roll-for-double attempt: the fine was
 * taken automatically and they were released. The turn continues by moving
 * with `roll` (or rolling again if `roll` was a 6+6).
 */
export interface JailFineAppliedAction {
  type: 'jail-fine-applied';
  amount: number;
  roll: DiceRoll;
}

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

export interface GameLogEntry {
  timestamp: number;
  playerId: PlayerId;
  description: string;
  cashDelta?: number;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export interface GameState {
  gameId: string;
  gamePhase: GamePhase;
  players: Player[];
  eliminatedPlayers: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  ownership: Record<string, OwnershipRecord>;
  lastDiceRoll: DiceRoll | null;
  chanceDeck: Card[];
  communityChestDeck: Card[];
  activeTradeProposal: TradeProposal | null;
  pendingAction: PendingAction | null;
  log: GameLogEntry[];
  winner: PlayerId | null;
}
