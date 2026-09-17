# Borough — Claude Code Prompt
## Milestone 1: Foundation

> Hand this prompt to Claude Code verbatim. It is self-contained.

---

## Context

You are building **Borough**, a 2–4 player local multiplayer property-strategy board game for desktop. It uses classic UK property economics as its numerical foundation but has an entirely original name, branding, UI, and visual identity. No Monopoly trademarks, artwork, or branding appear anywhere in the codebase or UI.

This prompt covers **Milestone 1 only**: project scaffolding, TypeScript configuration, all data models, game state architecture, and the rules engine. No UI rendering is required in this milestone — only the engine and its data layer.

---

## 1. Project Setup

### Stack
- **React 18** + **TypeScript** (strict mode)
- **Vite** as the build tool
- **Vitest** for unit tests
- **ESLint** + **Prettier** with sensible defaults

### Scaffold Command
```bash
npm create vite@latest borough -- --template react-ts
cd borough
npm install
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

### `tsconfig.json` Requirements
- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- Path alias: `@/` → `src/`

### Directory Structure
```
src/
  engine/
    data/
      board.ts          ← All 40 board spaces, in order
      properties.ts     ← Full property economics table
      cards.ts          ← Chance & Community Chest decks
    models/
      types.ts          ← All shared TypeScript types & interfaces
    rules/
      dice.ts           ← Dice resolution logic
      rent.ts           ← Rent calculation
      building.ts       ← House/hotel buy & sell logic
      mortgage.ts       ← Mortgage / unmortgage logic
      trade.ts          ← Trade validation
      jail.ts           ← Jail mechanics
      bankruptcy.ts     ← Bankruptcy resolution
      cards.ts          ← Card effect execution
      movement.ts       ← Movement and GO detection
    GameEngine.ts       ← Orchestrator: the only public API the UI will call
    index.ts            ← Re-exports
  tests/
    dice.test.ts
    rent.test.ts
    building.test.ts
    trade.test.ts
    jail.test.ts
    bankruptcy.test.ts
    movement.test.ts
```

---

## 2. Architecture Principle

The UI **never** calculates, validates, or applies game rules. It calls the engine and renders results.

```
UI  →  GameEngine (public API)  →  rules/* modules  →  GameState
```

The engine is a pure state machine. Every public method takes the current `GameState` and returns a new `GameState`. The engine never mutates state in place; it always returns fresh objects.

---

## 3. TypeScript Types — `src/engine/models/types.ts`

Define all of the following. Nothing may be `any`.

### Colour Groups
```ts
export type ColourGroup =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue';
```

### Property
```ts
export interface Property {
  id: string;                 // e.g. 'old-kent-road'
  name: string;               // Display name
  type: 'street';
  colourGroup: ColourGroup;
  buyPrice: number;
  mortgageValue: number;
  houseCost: number;          // Also the hotel upgrade cost
  baseRent: number;           // Unimproved rent (no colour set bonus here)
  rentWithHouses: [number, number, number, number]; // [1H, 2H, 3H, 4H]
  rentWithHotel: number;
  boardIndex: number;         // 0–39 position on the board
}
```

### Station
```ts
export interface Station {
  id: string;
  name: string;
  type: 'station';
  buyPrice: 200;
  mortgageValue: 100;
  boardIndex: number;
}
```

### Utility
```ts
export interface Utility {
  id: string;
  name: string;
  type: 'utility';
  buyPrice: 150;
  mortgageValue: 75;
  boardIndex: number;
}
```

### Purchasable
```ts
export type Purchasable = Property | Station | Utility;
```

### Board Space
```ts
export type BoardSpaceType =
  | 'go'
  | 'street'
  | 'station'
  | 'utility'
  | 'chance'
  | 'community-chest'
  | 'income-tax'
  | 'super-tax'
  | 'jail-visiting'     // "Just Visiting / Jail" corner
  | 'go-to-jail'
  | 'free-parking';

export interface BoardSpace {
  index: number;        // 0–39
  type: BoardSpaceType;
  name: string;
  propertyId?: string;  // Set when type is street | station | utility
}
```

### Cards
```ts
export type CardDeckType = 'chance' | 'community-chest';

export type CardEffect =
  | { kind: 'move-to'; destinationIndex: number; collectGoIfPassed: boolean }
  | { kind: 'move-relative'; spaces: number }           // negative = backwards
  | { kind: 'collect'; amount: number }                 // player receives money
  | { kind: 'pay'; amount: number }                     // player pays bank
  | { kind: 'collect-from-each'; amount: number }       // each other player pays
  | { kind: 'pay-per-building'; houseAmount: number; hotelAmount: number }
  | { kind: 'go-to-jail' }
  | { kind: 'get-out-of-jail-free' };

export interface Card {
  id: string;
  deck: CardDeckType;
  text: string;         // Display text on the card face
  effect: CardEffect;
}
```

### Player
```ts
export type PlayerId = 'player-1' | 'player-2' | 'player-3' | 'player-4';

export type PlayerStatus = 'active' | 'bankrupt';

export interface Player {
  id: PlayerId;
  name: string;
  tokenId: string;          // References a token asset
  cash: number;
  boardPosition: number;    // 0–39
  status: PlayerStatus;
  isInJail: boolean;
  getOutOfJailFreeCards: number;  // 0, 1, or 2
}
```

### Ownership Record
```ts
export interface OwnershipRecord {
  propertyId: string;
  ownerId: PlayerId | 'bank';
  isMortgaged: boolean;
  buildings: number;        // 0–4 = houses; 5 = hotel
}
```

### Dice Roll
```ts
export interface DiceRoll {
  die1: number;             // 1–6
  die2: number;             // 1–6
  total: number;            // die1 + die2
  isDouble: boolean;
  isSpecialDouble: boolean; // true only for 6+6
}
```

### Trade Proposal
```ts
export interface TradeProposal {
  id: string;
  proposerId: PlayerId;
  recipientId: PlayerId;
  offeredPropertyIds: string[];
  offeredCash: number;
  requestedPropertyIds: string[];
  requestedCash: number;
  includesOfferedGoojf: boolean;    // GOOJF card from proposer
  includesRequestedGoojf: boolean;  // GOOJF card from recipient
  status: 'pending' | 'accepted' | 'rejected';
}
```

### Turn Phase
```ts
export type TurnPhase =
  | 'awaiting-roll'
  | 'rolling'              // Dice animation in progress
  | 'moving'               // Token animation in progress
  | 'resolving-landing'    // Engine is determining what happens
  | 'awaiting-purchase-decision'
  | 'awaiting-rent-payment'
  | 'awaiting-tax-payment'
  | 'drawing-card'
  | 'resolving-card'
  | 'awaiting-jail-decision'
  | 'awaiting-bankruptcy-resolution'
  | 'strategic-action'     // Player can build, mortgage, trade
  | 'turn-ended';
```

### Game Phase
```ts
export type GamePhase =
  | 'setup'
  | 'determining-order'    // Initial rolls to decide who goes first
  | 'playing'
  | 'game-over';
```

### Pending Action
```ts
// Represents something the UI must prompt the current player for
export type PendingAction =
  | { type: 'purchase-decision'; propertyId: string; price: number }
  | { type: 'rent-payment'; amount: number; creditorId: PlayerId; propertyId: string }
  | { type: 'tax-payment'; amount: number; spaceName: string }
  | { type: 'jail-decision' }
  | { type: 'card-drawn'; card: Card }
  | { type: 'forced-reroll' }            // After 6+6
  | { type: 'bankruptcy-resolution'; amountOwed: number; creditorId: PlayerId | 'bank' };
```

### Game Log Entry
```ts
export interface GameLogEntry {
  timestamp: number;
  playerId: PlayerId;
  description: string;      // Human-readable summary
  cashDelta?: number;       // Net cash change for this player this event
}
```

### Game State
```ts
export interface GameState {
  gameId: string;
  gamePhase: GamePhase;
  players: Player[];                          // Active players only (bankrupts removed)
  eliminatedPlayers: Player[];
  currentPlayerIndex: number;                 // Index into players[]
  turnPhase: TurnPhase;
  ownership: Record<string, OwnershipRecord>; // propertyId → OwnershipRecord
  lastDiceRoll: DiceRoll | null;
  chanceDeck: Card[];                         // Ordered; top of deck = index 0
  communityChestDeck: Card[];
  activeTradeProposal: TradeProposal | null;
  pendingAction: PendingAction | null;
  log: GameLogEntry[];
  winner: PlayerId | null;
}
```

---

## 4. Board Data — `src/engine/data/board.ts`

Export a `const BOARD: BoardSpace[]` array of exactly **40 spaces** in clockwise order starting from GO (index 0).

The canonical UK layout is:

| Index | Name | Type |
|---|---|---|
| 0 | GO | go |
| 1 | Old Kent Road | street |
| 2 | Community Chest | community-chest |
| 3 | Whitechapel Road | street |
| 4 | Income Tax | income-tax |
| 5 | King's Cross Station | station |
| 6 | The Angel, Islington | street |
| 7 | Chance | chance |
| 8 | Euston Road | street |
| 9 | Pentonville Road | street |
| 10 | Jail / Just Visiting | jail-visiting |
| 11 | Pall Mall | street |
| 12 | Electric Company | utility |
| 13 | Whitehall | street |
| 14 | Northumberland Avenue | street |
| 15 | Marylebone Station | station |
| 16 | Bow Street | street |
| 17 | Community Chest | community-chest |
| 18 | Marlborough Street | street |
| 19 | Food Street | street |
| 20 | Free Parking | free-parking |
| 21 | Strand | street |
| 22 | Chance | chance |
| 23 | Fleet Street | street |
| 24 | Trafalgar Square | street |
| 25 | Fenchurch Street Station | station |
| 26 | Leicester Square | street |
| 27 | Coventry Street | street |
| 28 | Water Works | utility |
| 29 | Piccadilly | street |
| 30 | Go To Jail | go-to-jail |
| 31 | Regent Street | street |
| 32 | Oxford Street | street |
| 33 | Community Chest | community-chest |
| 34 | Bond Street | street |
| 35 | Liverpool Street Station | station |
| 36 | Chance | chance |
| 37 | Park Lane | street |
| 38 | Super Tax | super-tax |
| 39 | Mayfair | street |

Each street/station/utility space must set `propertyId` to the matching property's `id`.

---

## 5. Property Data — `src/engine/data/properties.ts`

Export a `const PROPERTIES: Property[]` containing all 22 streets, 4 stations, and 2 utilities. All values are **locked** — do not change them.

### Streets

#### Brown
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| old-kent-road | Old Kent Road | 60 | 30 | 50 | 2 | 10 | 30 | 90 | 160 | 250 |
| whitechapel-road | Whitechapel Road | 60 | 30 | 50 | 4 | 20 | 60 | 180 | 320 | 450 |

#### Light Blue
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| the-angel-islington | The Angel, Islington | 100 | 50 | 50 | 6 | 30 | 90 | 270 | 400 | 550 |
| euston-road | Euston Road | 100 | 50 | 50 | 6 | 30 | 90 | 270 | 400 | 550 |
| pentonville-road | Pentonville Road | 120 | 60 | 50 | 8 | 40 | 100 | 300 | 450 | 600 |

#### Pink
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| pall-mall | Pall Mall | 140 | 70 | 100 | 10 | 50 | 150 | 450 | 625 | 750 |
| whitehall | Whitehall | 140 | 70 | 100 | 10 | 50 | 150 | 450 | 625 | 750 |
| northumberland-avenue | Northumberland Avenue | 160 | 80 | 100 | 12 | 60 | 180 | 500 | 700 | 900 |

#### Orange
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| bow-street | Bow Street | 180 | 90 | 100 | 14 | 70 | 200 | 550 | 750 | 950 |
| marlborough-street | Marlborough Street | 180 | 90 | 100 | 14 | 70 | 200 | 550 | 750 | 950 |
| food-street | Food Street | 200 | 100 | 100 | 16 | 80 | 220 | 600 | 800 | 1000 |

#### Red
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| strand | Strand | 220 | 110 | 150 | 18 | 90 | 250 | 700 | 875 | 1050 |
| fleet-street | Fleet Street | 220 | 110 | 150 | 18 | 90 | 250 | 700 | 875 | 1050 |
| trafalgar-square | Trafalgar Square | 240 | 120 | 150 | 20 | 100 | 300 | 750 | 925 | 1100 |

#### Yellow
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| leicester-square | Leicester Square | 260 | 130 | 150 | 22 | 110 | 330 | 800 | 975 | 1150 |
| coventry-street | Coventry Street | 260 | 130 | 150 | 22 | 110 | 330 | 800 | 975 | 1150 |
| piccadilly | Piccadilly | 280 | 140 | 150 | 24 | 120 | 360 | 850 | 1025 | 1200 |

#### Green
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| regent-street | Regent Street | 300 | 150 | 200 | 26 | 130 | 390 | 900 | 1100 | 1275 |
| oxford-street | Oxford Street | 300 | 150 | 200 | 26 | 130 | 390 | 900 | 1100 | 1275 |
| bond-street | Bond Street | 320 | 160 | 200 | 28 | 150 | 450 | 1000 | 1200 | 1400 |

#### Dark Blue
| id | name | buy | mortgage | houseCost | baseRent | 1H | 2H | 3H | 4H | Hotel |
|---|---|---|---|---|---|---|---|---|---|---|
| park-lane | Park Lane | 350 | 175 | 200 | 35 | 175 | 500 | 1100 | 1300 | 1500 |
| mayfair | Mayfair | 400 | 200 | 200 | 50 | 200 | 600 | 1400 | 1700 | 2000 |

### Stations
All four: `buyPrice: 200`, `mortgageValue: 100`
- `kings-cross-station` · King's Cross Station · boardIndex: 5
- `marylebone-station` · Marylebone Station · boardIndex: 15
- `fenchurch-street-station` · Fenchurch Street Station · boardIndex: 25
- `liverpool-street-station` · Liverpool Street Station · boardIndex: 35

### Utilities
Both: `buyPrice: 150`, `mortgageValue: 75`
- `electric-company` · Electric Company · boardIndex: 12
- `water-works` · Water Works · boardIndex: 28

---

## 6. Card Data — `src/engine/data/cards.ts`

Export `CHANCE_CARDS: Card[]` and `COMMUNITY_CHEST_CARDS: Card[]`.

Implement cards appropriate to the game's original identity. All card texts must be original — do not use Monopoly card text verbatim. The mechanical effects below are locked; only the flavour text is yours to write.

### Required Chance Effects (16 cards)
1. Move to GO (collect $200)
2. Move to Mayfair (resolve landing)
3. Move to Trafalgar Square (resolve landing; collect $200 if passing GO)
4. Move to King's Cross Station (resolve landing)
5. Move to Pall Mall (resolve landing; collect $200 if passing GO)
6. Move back 3 spaces (resolve landing)
7. Go to Jail (do not pass GO, do not collect $200)
8. Collect $150 from Bank
9. Collect $100 from Bank
10. Pay $15 to Bank
11. Pay $100 to Bank
12. Pay $50 to Bank
13. Collect $50 from each other player
14. Pay $40 per house and $115 per hotel you own
15. Get Out of Jail Free
16. Move to nearest station; resolve landing (if passing GO, collect $200)

### Required Community Chest Effects (16 cards)
1. Collect $200 from Bank (advance to GO equivalent)
2. Collect $100 from Bank
3. Collect $50 from Bank
4. Collect $25 from Bank
5. Collect $20 from Bank
6. Pay $50 to Bank
7. Pay $100 to Bank (doctor's fee equivalent)
8. Pay $150 to Bank
9. Go to Jail
10. Collect $10 from each other player
11. Collect $100 from each other player (birthday / celebration)
12. Pay $40 per house and $115 per hotel (street repairs equivalent)
13. Get Out of Jail Free
14. Collect $25 consultancy/freelance fee from Bank
15. Pay $50 per player as a collective fine (or equivalent social mechanic)
16. Collect $10 lottery / refund from Bank

---

## 7. Rules Engine Modules

### 7.1 `src/engine/rules/dice.ts`

```ts
export function rollDice(): DiceRoll
```
Generates two random values 1–6. Sets `isDouble` and `isSpecialDouble` (true only when both dice are 6).

```ts
export function resolveDiceOutcome(roll: DiceRoll, state: GameState): GameState
```
Implements the **three-outcome rule**:
- **6+6**: Player does NOT move. Sets `pendingAction: { type: 'forced-reroll' }`. Turn does NOT end.
- **Normal double (not 6+6)**: Player moves by total. `turnPhase` proceeds to `moving`. After landing resolution, turn ends (no extra roll). No three-doubles-to-jail rule exists.
- **Non-double**: Player moves by total. `turnPhase` proceeds to `moving`. After landing resolution, turn ends.

### 7.2 `src/engine/rules/movement.ts`

```ts
export function movePlayer(
  playerId: PlayerId,
  spaces: number,
  state: GameState
): { newState: GameState; passedGo: boolean; newPosition: number }
```
Handles wrapping around the 40-space board. If the player passes index 0 (GO) during movement, `passedGo` is `true` and +$200 is added to the player's cash. Landing **on** GO also awards +$200 (treat as passing GO).

```ts
export function movePlayerToPosition(
  playerId: PlayerId,
  targetIndex: number,
  state: GameState,
  collectGoIfPassed: boolean
): GameState
```
Teleports a player to an exact board index. If `collectGoIfPassed` is true and the destination index is less than current position (i.e., they wrapped around), award $200.

### 7.3 `src/engine/rules/rent.ts`

```ts
export function calculateRent(
  propertyId: string,
  landingRoll: DiceRoll,
  state: GameState
): number
```

Implements the complete rent logic:

**Streets:**
- If mortgaged → return 0
- If hotel (buildings === 5) → return `rentWithHotel`
- If 1–4 houses → return `rentWithHouses[buildings - 1]`
- If 0 buildings AND owner has complete colour group → return `baseRent × 2`
- If 0 buildings AND NOT complete colour group → return `baseRent`

**Stations:**
- Count how many stations the owner holds
- Return: 1 → $25, 2 → $50, 3 → $100, 4 → $200
- Mortgaged → return 0

**Utilities:**
- Count how many utilities the owner holds
- 1 utility → return `landingRoll.total × 4`
- 2 utilities → return `landingRoll.total × 10`
- Mortgaged → return 0

**The 2× multiplier applies ONLY when:**
- The property is a street
- Buildings === 0
- The owner owns every property in the colour group

**The 2× multiplier does NOT apply when:**
- Any building exists on the property (use exact building rent instead)

```ts
export function ownsCompleteColourGroup(
  ownerId: PlayerId,
  colourGroup: ColourGroup,
  state: GameState
): boolean
```

### 7.4 `src/engine/rules/building.ts`

```ts
export type BuildingActionResult =
  | { success: true; newState: GameState; cost: number }
  | { success: false; reason: string };

export function buyHouse(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult
```
**Validations before allowing:**
- Player owns the complete colour group
- Property has fewer than 4 houses (can't buy a 5th house; must upgrade to hotel instead)
- Property has no hotel (buildings !== 5)
- Player has enough cash

**No even-building restriction.** Houses may be placed unevenly.

```ts
export function upgradeToHotel(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult
```
- Property must have exactly 4 houses (buildings === 4)
- Costs the property's `houseCost`
- Sets buildings to 5 (hotel)
- Player must have sufficient cash

```ts
export function sellHouse(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult
```
- Property must have 1–4 houses
- Refund = `houseCost` (100% resale value)
- No even-selling restriction

```ts
export function sellHotel(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): BuildingActionResult
```
- Property must have a hotel (buildings === 5)
- Refund = `houseCost` (100% of the hotel upgrade cost)
- Sets buildings to **0** (the 4 constituent houses are NOT returned)

### 7.5 `src/engine/rules/mortgage.ts`

```ts
export function mortgageProperty(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): { success: true; newState: GameState } | { success: false; reason: string }
```
**Blocks if:**
- Property has buildings (sell all buildings first)
- Property is already mortgaged
- Player does not own it

**On success:** adds mortgage value to player's cash, sets `isMortgaged: true`.

```ts
export function unmortgageProperty(
  playerId: PlayerId,
  propertyId: string,
  state: GameState
): { success: true; newState: GameState } | { success: false; reason: string }
```
- Player must pay mortgage value to unmortgage
- Player must have sufficient cash

### 7.6 `src/engine/rules/trade.ts`

```ts
export function validateTrade(
  proposal: TradeProposal,
  state: GameState
): { valid: true } | { valid: false; reason: string }
```
**Rejects if any offered/requested property:**
- Is mortgaged
- Has buildings (houses or hotel)
- Is not actually owned by the respective player

**Allows:**
- Property ↔ property
- Property + cash ↔ property
- 2 properties ↔ 1 property (both parties must have agreed via `status: 'accepted'`)
- GOOJF card inclusion (`includesOfferedGoojf` / `includesRequestedGoojf`)
- Player must have enough cash to cover any offered cash amount

```ts
export function executeTrade(
  proposal: TradeProposal,
  state: GameState
): GameState
```
Only callable after `validateTrade` returns `{ valid: true }` and `proposal.status === 'accepted'`. Transfers ownership, cash, and GOOJF cards atomically.

### 7.7 `src/engine/rules/jail.ts`

```ts
export function sendToJail(playerId: PlayerId, state: GameState): GameState
```
- Sets `isInJail: true`
- Moves player to board index 10 (Jail / Just Visiting)
- Does NOT pass GO, does NOT collect $200
- Turn ends immediately

```ts
export function attemptJailEscape(
  playerId: PlayerId,
  roll: DiceRoll,
  state: GameState
): { escaped: boolean; newState: GameState }
```
- If `roll.isDouble && !roll.isSpecialDouble` → player escapes, moves by roll total, resolves landing
- If `roll.isSpecialDouble` (6+6) → forced reroll; player stays in jail; does NOT escape
- If not a double → player stays in jail; turn ends

```ts
export function payJailFine(playerId: PlayerId, state: GameState): GameState
```
- Deducts $50 from player
- Sets `isInJail: false`
- Player then rolls and moves normally this turn

```ts
export function useGetOutOfJailFreeCard(
  playerId: PlayerId,
  state: GameState
): GameState
```
- Player must hold at least one GOOJF card
- Decrements `getOutOfJailFreeCards` by 1
- Returns the card to the appropriate deck (bottom)
- Sets `isInJail: false`
- Player then rolls and moves normally

### 7.8 `src/engine/rules/bankruptcy.ts`

```ts
export function checkBankruptcy(
  playerId: PlayerId,
  amountOwed: number,
  state: GameState
): boolean
```
Returns `true` if the player's cash is below `amountOwed` AND their total liquidatable value (sell all buildings at 100%, mortgage all unmortgaged properties) is also insufficient.

```ts
export function calculateLiquidationValue(
  playerId: PlayerId,
  state: GameState
): number
```
Cash + (all buildings × their house cost) + (all unmortgaged properties × their mortgage value).

```ts
export function declareBankruptcy(
  playerId: PlayerId,
  state: GameState
): GameState
```
Implements the **custom bankruptcy rule** exactly:
1. All player's properties transfer to `ownerId: 'bank'`
2. Mortgaged properties become `isMortgaged: false` (automatically unmortgaged)
3. All buildings set to 0
4. Player's `status` set to `'bankrupt'`
5. Player moved from `players[]` to `eliminatedPlayers[]`
6. **Creditor receives nothing** — no property transfer to creditor
7. If only one player remains in `players[]`, set `gamePhase: 'game-over'` and `winner` to that player's id

### 7.9 `src/engine/rules/cards.ts`

```ts
export function drawCard(
  deckType: CardDeckType,
  state: GameState
): { card: Card; newState: GameState }
```
Takes the top card (index 0). If the card is NOT a GOOJF card, move it to the bottom of the deck immediately. If it IS a GOOJF card, hold it — do not return it to the deck until used.

```ts
export function executeCardEffect(
  card: Card,
  playerId: PlayerId,
  state: GameState
): GameState
```
Handles all `CardEffect` kinds:
- `move-to`: calls `movePlayerToPosition`; if `collectGoIfPassed` and player wraps, collect $200
- `move-relative`: calls `movePlayer` with positive or negative spaces; if crossing GO forwards, collect $200
- `collect`: adds amount to player cash from bank
- `pay`: deducts amount from player cash to bank
- `collect-from-each`: each other active player pays this player
- `pay-per-building`: counts all of this player's buildings; charges houseAmount × houses + hotelAmount × hotels
- `go-to-jail`: calls `sendToJail`
- `get-out-of-jail-free`: increments `getOutOfJailFreeCards`; card stays with player (already removed from deck)

---

## 8. Game Engine Orchestrator — `src/engine/GameEngine.ts`

This is the only file the UI imports from. It exposes a clean public API backed by the rules modules.

```ts
export class GameEngine {
  // Setup
  static createNewGame(playerSetups: Array<{ name: string; tokenId: string }>): GameState
  static initializeDeckOrder(state: GameState): GameState  // Shuffle both decks

  // Determining turn order
  static rollForOrder(playerId: PlayerId, state: GameState): GameState
  static finalizePlayerOrder(state: GameState): GameState  // Sort by initial roll

  // Turn flow
  static rollDice(state: GameState): GameState
  static resolveLanding(state: GameState): GameState  // Called after movement completes
  static confirmPurchase(propertyId: string, state: GameState): GameState
  static declinePurchase(state: GameState): GameState
  static payRent(state: GameState): GameState
  static payTax(state: GameState): GameState
  static endTurn(state: GameState): GameState

  // Jail
  static rollForJailEscape(state: GameState): GameState
  static payJailFine(state: GameState): GameState
  static useGoojfCard(state: GameState): GameState

  // Strategic actions (available during strategic-action phase)
  static buyHouse(propertyId: string, state: GameState): GameState
  static upgradeToHotel(propertyId: string, state: GameState): GameState
  static sellHouse(propertyId: string, state: GameState): GameState
  static sellHotel(propertyId: string, state: GameState): GameState
  static mortgageProperty(propertyId: string, state: GameState): GameState
  static unmortgageProperty(propertyId: string, state: GameState): GameState

  // Trading
  static proposeTrade(proposal: Omit<TradeProposal, 'id' | 'status'>, state: GameState): GameState
  static acceptTrade(tradeId: string, state: GameState): GameState
  static rejectTrade(tradeId: string, state: GameState): GameState

  // Bankruptcy
  static declareBankruptcy(playerId: PlayerId, state: GameState): GameState

  // Queries (read-only, no state change)
  static getProperty(propertyId: string): Purchasable
  static getBoardSpace(index: number): BoardSpace
  static getCurrentPlayer(state: GameState): Player
  static getOwnership(propertyId: string, state: GameState): OwnershipRecord
  static canBuild(playerId: PlayerId, propertyId: string, state: GameState): boolean
  static canMortgage(playerId: PlayerId, propertyId: string, state: GameState): boolean
  static canTrade(playerId: PlayerId, state: GameState): boolean
  static calculateRent(propertyId: string, state: GameState): number
  static getNetWorth(playerId: PlayerId, state: GameState): number  // cash + property values
}
```

Every method that modifies state must return a new `GameState` object (no mutation). If an action is invalid, throw a descriptive `Error` rather than returning silently.

---

## 9. Automated Tests — `src/tests/`

Write tests using Vitest. Every test file must cover the cases listed. Tests must pass before Milestone 1 is considered complete.

### `dice.test.ts`
- Normal roll (non-double): player moves, turn proceeds to `moving`
- Normal double (not 6+6): player moves, turn ends after landing resolution — no extra roll
- 6+6: player does NOT move, `pendingAction` is `forced-reroll`
- 6+6 chains: two consecutive 6+6 rolls both result in no movement
- 6+6 followed by a normal roll: player moves on the normal roll
- 6+6 while in jail: no escape, `pendingAction` is `forced-reroll`
- Normal double while in jail: player escapes, moves by total

### `rent.test.ts`
- Unimproved street, no colour group ownership → base rent
- Unimproved street, complete colour group → 2× base rent
- Street with 1 house → exact 1H rent (no 2× multiplier)
- Street with 4 houses → exact 4H rent
- Street with hotel → exact hotel rent
- Mortgaged street → $0
- Own property → $0
- Station: 1 owned → $25; 4 owned → $200
- Utility: 1 owned, dice roll 7 → $28 (4×7); 2 owned, dice roll 7 → $70 (10×7)

### `building.test.ts`
- Buy house on complete colour group: allowed
- Buy house without complete colour group: blocked
- Buy house on already-hotelled property: blocked
- Uneven building (0 houses on one, 3 on another in same group): allowed
- Buy multiple houses in one transaction: allowed
- Hotel upgrade with exactly 4 houses: allowed, buildings set to 5
- Hotel upgrade with fewer than 4 houses: blocked
- Sell 1 house: refund equals houseCost
- Sell hotel: refund equals houseCost, buildings reset to 0 (not 4)

### `trade.test.ts`
- Valid property swap: executes correctly
- Property + cash for property: executes correctly
- Two properties for one: executes correctly
- Trade including GOOJF card: card transfers correctly
- Mortgaged property offered: validation blocks it
- Property with buildings offered: validation blocks it
- Proposer insufficient cash: validation blocks it
- Rejected trade: no state changes

### `jail.test.ts`
- Sent to jail via Go To Jail space: position = 10, isInJail = true, no $200
- Send to jail: current position was 35 (station), no GO money
- Normal double escape: isInJail = false, player moves
- 6+6 in jail: still in jail, forced reroll
- Non-double in jail: still in jail, turn ends
- Pay $50: isInJail = false, cash deducted
- Use GOOJF card: isInJail = false, card count decremented, card returned to deck

### `bankruptcy.test.ts`
- calculateLiquidationValue: correct sum of cash + buildings + mortgageable assets
- Not bankrupt if liquidation covers debt
- Bankruptcy confirmed: properties go to bank
- Mortgaged properties automatically unmortgaged on bankruptcy
- Buildings removed on bankruptcy
- Creditor receives nothing
- Player removed from active players list
- Last player remaining triggers game-over and sets winner

### `movement.test.ts`
- Move forward 7 spaces from index 0: land on index 7
- Move wraps around from index 38, moving 5 spaces: land on index 3, passedGo = true, +$200
- Land exactly on GO (index 0): +$200
- Teleport to specific index below current: passedGo = true, +$200 (if collectGoIfPassed)
- Teleport forward to index above current: passedGo = false

---

## 10. Additional Requirements

### No Silent Behaviour Invention
If any edge case is ambiguous, throw an `Error` with a clear message rather than guessing. Example: `throw new Error('RULES: Cannot build hotel — property has only 3 houses. 4 required.')`.

### No Traditional Monopoly Behaviour Added
The following are explicitly absent from this game and must NOT be implemented:
- Auctions (no auction on declined purchase)
- Three-doubles-to-jail rule
- Extra roll for doubles (doubles end the turn)
- Even-building or even-selling restriction
- Free Parking jackpot
- Bankrupt properties going to the creditor

### Game State Immutability
All state mutations must produce new objects. Use spread operators or `structuredClone`. Never call `Array.prototype.push` on a state array directly.

### Logging
Every significant action (purchase, rent payment, building, trade, jail, bankruptcy) must append a `GameLogEntry` to `state.log`.

### `createNewGame` Behaviour
- `gamePhase: 'setup'`
- Each player starts with `cash: 1500`, `boardPosition: 0`
- All 40 board properties initialised as `ownerId: 'bank'`, `isMortgaged: false`, `buildings: 0`
- Both card decks shuffled
- `turnPhase: 'awaiting-roll'`
- `currentPlayerIndex: 0`

---

## Deliverables

When Milestone 1 is complete:

1. `npm run build` passes with zero TypeScript errors
2. `npm run test` passes — all tests green
3. The engine is importable with `import { GameEngine } from '@/engine'`
4. No UI components exist yet — this is engine-only
5. A brief `MILESTONE_1_NOTES.md` in the project root documenting any implementation decisions, ambiguities resolved, and anything the next milestone needs to know

---

*This prompt is the complete specification for Milestone 1. Do not implement UI, animations, or Milestone 2+ features. Flag any ambiguity rather than inventing behaviour.*
