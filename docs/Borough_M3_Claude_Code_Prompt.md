# Milestone 3 — Strategy Layer

## Context

You are continuing development of a 2–4 player local multiplayer property strategy board game. Milestone 1 (Foundation) and Milestone 2 (Core Gameplay) are complete. The codebase already contains:

- TypeScript project setup and configuration
- Game state model and data models (properties, players, cards, board)
- Rules engine scaffold
- Dice mechanics including the custom 6+6 forced-reroll rule
- Token movement (animated, space-by-space)
- Board rendering
- Property ownership
- Rent calculation and payment (including colour group 2× multiplier, station rent, utility rent)
- GO ($200 pass and land)
- Tax spaces

This milestone adds the **strategy layer** — the full set of mechanics that make the game deep and replayable.

---

## Rules Engine Boundary — Non-Negotiable Architecture Principle

The UI must **never** implement game rules directly. All logic lives in the rules engine. The UI calls the engine and renders results.

```
// ❌ Never do this in the UI layer
if (player.ownsAllInGroup && property.houses === 0) {
  rent = property.baseRent * 2;
}

// ✅ Correct
const rent = gameEngine.calculateRent(propertyId, gameState);
ui.displayRent(rent);
```

Every system built in this milestone must follow this pattern. The engine validates, calculates, and mutates state. The UI observes and renders.

---

## No Silent Rule Changes

This game is **not standard Monopoly**. It has a deliberate custom ruleset. The following are explicitly prohibited — do not add them even if they seem natural:

| Prohibited | Reason |
|---|---|
| Auctions when a player declines to buy | Explicitly removed |
| Extra roll for rolling a normal double | Normal doubles end the turn |
| Three-doubles-to-jail rule | Does not exist in this game |
| 2× rent on properties with buildings | 2× only applies to unimproved complete sets |
| Bankrupt properties going to the creditor | All assets go to the Bank |
| Even-building restriction | No restriction — build unevenly |
| House shortage mechanic | Unlimited house supply |

If you encounter an ambiguous rule not covered in this prompt, **flag it rather than inventing behaviour**.

---

## Confirmed Decisions

These were open decisions now confirmed for implementation:

- **Starting player:** Each player rolls once; highest roll goes first. (Already implemented in Milestone 2, noted here for completeness.)
- **Get Out of Jail Free card trading:** GOOJF cards are treated as normal tradeable assets in the trade interface.
- **Hotel resale value:** Hotels sell back to the Bank at 100% of the hotel purchase cost, and the property returns to 0 buildings (the 4 constituent houses are NOT returned separately).
- **Early game-ending option:** Not included in Version 1.

---

## What to Build in This Milestone

### 1. Building — Houses

**Rule reference (Rules §8):**
- A player must own the complete colour group before building.
- No even-building restriction. Houses may be placed unevenly across the group.
- A player may purchase multiple houses in one turn.
- Unlimited house supply — no shortage mechanic.

**Building progression per property:**

| Stage | Houses |
|---|---|
| 0 | Unimproved |
| 1 | One house |
| 2 | Two houses |
| 3 | Three houses |
| 4 | Four houses — hotel upgrade now available |
| Hotel | Maximum improvement |

**Engine requirements:**
- `canBuildHouse(propertyId, gameState)` → boolean — validates complete colour group ownership; validates property is not mortgaged; validates building count is below 4; validates no hotel already present.
- `buildHouse(propertyId, gameState)` → new game state — deducts house cost from player cash; increments house count on property.
- `buildMultipleHouses(propertyId, count, gameState)` → new game state — validates and applies multiple purchases in one operation.

**UI requirements (functional, no visual polish required this milestone):**
- During the strategic action phase of a player's turn, eligible properties for house building must be selectable.
- Display current house count and cost per house.
- Allow purchasing 1 to N houses in a single interaction (up to the maximum of 4).
- Deduct cost immediately and update the board state.

---

### 2. Building — Hotels

**Rule reference (Rules §9):**
- A property must have exactly 4 houses before a hotel can be built.
- The player pays the property's house cost one additional time.
- The 4 houses are removed and replaced by 1 hotel.
- Hotel upgrade cost = house cost for that property.

**Engine requirements:**
- `canBuildHotel(propertyId, gameState)` → boolean — validates exactly 4 houses, no hotel, player owns complete colour group, property is not mortgaged.
- `buildHotel(propertyId, gameState)` → new game state — deducts hotel cost from player cash; sets house count to 0; sets hotel flag to true.

**UI requirements:**
- When a property has exactly 4 houses, show the hotel upgrade option.
- Display cost clearly.
- Confirm before executing.

---

### 3. Selling Houses

**Rule reference (Rules §10):**
- Houses sell back to the Bank at 100% of their original purchase price.
- No even-selling restriction — sell from any property in any order.
- A player may sell houses at any time during their turn's strategic action phase.
- Houses may also be sold during the bankruptcy liquidation flow.

**Engine requirements:**
- `canSellHouse(propertyId, gameState)` → boolean — validates player owns property; validates at least one house exists; validates no hotel on the property.
- `sellHouse(propertyId, gameState)` → new game state — returns house cost to player cash; decrements house count.

---

### 4. Selling Hotels

**Rule reference (Rules §10 + confirmed decision):**
- Hotels sell back to the Bank at 100% of the hotel purchase cost.
- Selling a hotel returns the property to **0 buildings**. The 4 constituent houses are NOT returned separately.
- Hotels may be sold during the bankruptcy liquidation flow.

**Engine requirements:**
- `canSellHotel(propertyId, gameState)` → boolean — validates player owns property; validates hotel is present.
- `sellHotel(propertyId, gameState)` → new game state — returns hotel cost to player cash; clears hotel flag; sets house count to 0.

---

### 5. Mortgages

**Rule reference (Rules §11):**
- Mortgage value is the property's listed mortgage value (see Economics table below).
- A mortgaged property generates $0 rent.
- A mortgaged property **cannot be traded**.
- A player may mortgage assets before bankruptcy to try to raise funds.
- Properties with houses or hotels **cannot be mortgaged** — buildings must be sold first.

**Engine requirements:**
- `canMortgage(propertyId, gameState)` → boolean — validates player owns property; validates no buildings; validates property is not already mortgaged.
- `mortgageProperty(propertyId, gameState)` → new game state — pays mortgage value to player cash; marks property as mortgaged.
- `canUnmortgage(propertyId, gameState)` → boolean — validates player owns property; validates property is mortgaged; validates player has sufficient cash.
- `unmortgageProperty(propertyId, gameState)` → new game state — deducts mortgage value from player cash; clears mortgaged flag.

> Note: There is no unmortgage surcharge in this game. Unmortgage cost equals the original mortgage value.

**UI requirements:**
- Show mortgage value for each eligible property.
- Show unmortgage cost for currently mortgaged properties.
- Both actions available in the player's strategic action phase and in the bankruptcy liquidation flow.

---

### 6. Trading

Trading is one of the game's most important mechanics. The engine must be robust and the interface clear.

**Rule reference (Rules §12):**

Valid trade types:

| Side A | Side B |
|---|---|
| Property | Property |
| Cash | Property |
| Property + Cash | Property |
| Property + Cash | Property + Cash |
| Property | Nothing (gift) |
| GOOJF card | Property / Cash / Nothing |

Timing:
- Trades can happen during **any** player's turn.
- Trades can happen while a player is in jail.
- Trading is **temporarily unavailable** while the game is processing: dice movement, landing resolution, card resolution, payment, or building actions.

**Trade restrictions:**
- Only unmortgaged properties with no buildings can be traded.
- Mortgaged properties → cannot be traded.
- Properties with houses or hotels → cannot be traded.
- Get Out of Jail Free cards → can be traded as a normal asset.

**Engine requirements:**
- `getTradeableAssets(playerId, gameState)` → list of eligible properties + GOOJF cards for this player.
- `validateTrade(trade, gameState)` → boolean or validation error — confirms all assets on both sides are eligible; confirms both players are real participants; confirms cash amounts don't exceed the offering player's balance.
- `proposeTrade(trade, gameState)` → new game state with a pending trade awaiting acceptance.
- `acceptTrade(tradeId, gameState)` → new game state with trade executed — assets transferred, cash transferred.
- `rejectTrade(tradeId, gameState)` → new game state with pending trade cleared.

**Trade data model:**

```typescript
interface Trade {
  id: string;
  proposingPlayerId: string;
  respondingPlayerId: string;
  offering: {
    propertyIds: string[];
    cash: number;
    goojfCards: number;
  };
  requesting: {
    propertyIds: string[];
    cash: number;
    goojfCards: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
}
```

**UI requirements:**
- Trade initiator selects the other player.
- Both sides of the trade are built using a drag or click interface — properties, cash, GOOJF cards.
- Ineligible assets (mortgaged, buildings present) are greyed out and unselectable with a tooltip explaining why.
- The responding player sees a clear summary of what is being offered and requested before accepting or rejecting.
- After acceptance: assets visibly transfer. After rejection: trade interface closes cleanly.

---

### 7. Jail Mechanics

**Rule reference (Rules §18):**

A player enters jail when:
- They land on the Go To Jail space.
- A Chance or Community Chest card sends them to jail.

A jailed player's turn options:

| Option | Outcome |
|---|---|
| Roll for a normal double (any except 6+6) | Player escapes jail, moves by dice total, resolves landing, turn ends |
| Roll 6+6 while in jail | Forced reroll — player does NOT move, does NOT escape, rolls again |
| Pay $50 | Player is released, moves normally on the same roll |
| Use Get Out of Jail Free card | Card returned to deck, player moves normally |

There is no maximum number of turns in jail in this game — a player may stay in jail indefinitely until they choose an escape method.

**Engine requirements:**
- `sendToJail(playerId, gameState)` → new game state — moves player to jail position; sets `inJail: true` on player.
- `getJailOptions(playerId, gameState)` → list of available options (roll, pay, use GOOJF) — only include GOOJF option if player holds the card.
- `payJailFine(playerId, gameState)` → new game state — deducts $50; clears `inJail`; player is now free to roll and move.
- `useGoojfCard(playerId, gameState)` → new game state — removes GOOJF card from player; returns it to the relevant deck; clears `inJail`.
- `resolveJailRoll(roll, playerId, gameState)` → new game state — if roll is a normal double (not 6+6): clears `inJail`, applies movement; if roll is 6+6: forced reroll (no movement, no escape); if roll is not a double: turn ends, player stays in jail.

---

### 8. Chance & Community Chest Cards

**Rule reference (Rules §17):**
- Both decks shuffled at game start.
- On landing: draw top card, execute effect, return to bottom of deck.
- Get Out of Jail Free cards are kept by the player and not returned to the deck until used (or traded).
- Movement cards: move player to destination, then resolve that destination normally (including rent if applicable, including passing GO if applicable).
- Jail cards: send player to jail immediately. Turn ends.

**Card data model:**

```typescript
type CardEffect =
  | { type: 'move_to'; destination: BoardSpaceId }
  | { type: 'move_relative'; spaces: number }
  | { type: 'go_to_jail' }
  | { type: 'collect'; amount: number }
  | { type: 'pay'; amount: number }
  | { type: 'collect_from_each_player'; amount: number }
  | { type: 'pay_each_player'; amount: number }
  | { type: 'pay_per_building'; houseCost: number; hotelCost: number }
  | { type: 'get_out_of_jail_free'; deck: 'chance' | 'community_chest' };
```

**Full card list to implement:**

> These are the standard UK Monopoly card effects reworded for original branding. Implement the effects exactly. Card names and flavour text are placeholder — the creative direction will supply final text in a later milestone.

**Chance Cards (16 total):**

1. Move to GO. Collect $200.
2. Move to Trafalgar Square. If you pass GO collect $200.
3. Move to Mayfair. If you pass GO collect $200.
4. Move to Pall Mall. If you pass GO collect $200.
5. Move back 3 spaces.
6. Move to King's Cross Station. If you pass GO collect $200.
7. Move to the nearest Station. If unowned you may buy it. If owned pay double the normal rent.
8. Move to the nearest Station. (Same as above.)
9. Move to the nearest Utility. If unowned you may buy it. If owned pay 10× the dice total.
10. Go to Jail. Move directly to Jail. Do not pass GO. Do not collect $200.
11. Collect $150 from the Bank.
12. Pay $15 to the Bank.
13. Pay $100 to the Bank.
14. Pay £50 to the Bank.
15. Collect $50 from every other player.
16. Get Out of Jail Free. Keep this card until used or traded.

**Community Chest Cards (16 total):**

1. Move to GO. Collect $200.
2. Go to Jail. Move directly to Jail. Do not pass GO. Do not collect $200.
3. Collect $200 from the Bank. (Bank error in your favour.)
4. Collect $100 from the Bank. (Doctor's fee — collect $100.)
5. Collect $50 from the Bank.
6. Collect $25 from the Bank.
7. Collect $20 from the Bank.
8. Collect $10 from the Bank.
9. Pay $50 to the Bank. (School fees.)
10. Pay $100 to the Bank. (Consultancy fee.)
11. Pay $150 to the Bank. (Hospital fees.)
12. Collect $50 from every other player. (It is your birthday.)
13. Pay $40 per house and $115 per hotel you own.
14. Collect $10 from every other player. (You have won second prize in a beauty contest.)
15. Collect $100 from the Bank. (Life insurance matures.)
16. Get Out of Jail Free. Keep this card until used or traded.

**Engine requirements:**
- `drawCard(deck: 'chance' | 'community_chest', gameState)` → card object + new deck state (card moved to bottom, unless GOOJF which stays with player).
- `resolveCard(card, playerId, gameState)` → new game state with card effect fully applied.
- For movement cards: use existing `movePlayer` logic so GO-passing is handled correctly.
- For "nearest station" and "nearest utility" cards: calculate dynamically based on current board position.
- Track GOOJF card ownership per player with a reference to which deck it came from (so it returns to the correct deck when used).

---

### 9. Bankruptcy Flow

**Rule reference (Rules §19):**

Bankruptcy is triggered when a player owes money and cannot pay from their current cash balance.

**Step 1 — Obligation arises**

Player owes money (rent, tax, card effect, jail fine) and cash is insufficient.

**Step 2 — Liquidation phase**

Before declaring bankruptcy, the player is given the opportunity to raise funds by:
- Selling houses (100% value returned).
- Selling hotels (100% value returned, property returns to 0 buildings).
- Mortgaging eligible properties (unmortgaged, no buildings).

After each action, recalculate remaining debt vs available cash. Allow the player to take multiple actions in sequence.

**Step 3 — Resolution**

If after all liquidation actions the player can now meet the obligation → payment proceeds normally, game continues.

If the player still cannot meet the obligation → **bankruptcy declared**.

**Step 4 — Bankruptcy execution**

- All of the bankrupt player's properties transfer to the Bank and become unowned.
- Mortgaged properties become automatically unmortgaged on transfer.
- All houses and hotels are removed from all properties.
- The creditor (if any) receives **nothing** — no properties, no cash, no assets.
- The bankrupt player is eliminated from the game.
- Properties are now available for normal purchase when another player lands on them.
- There is no immediate shopping phase, automatic auction, or automatic transfer to the creditor.

**Engine requirements:**
- `checkSolvency(playerId, debt, gameState)` → `'solvent' | 'can_liquidate' | 'bankrupt'`.
- `getLiquidationOptions(playerId, gameState)` → list of available sell/mortgage actions with their cash yield.
- `declareBankruptcy(playerId, gameState)` → new game state with all bankruptcy effects applied — player eliminated, all assets processed per the rules above.
- `checkWinCondition(gameState)` → `playerId | null` — returns the winning player's ID if only one player remains, otherwise null. This should be called after every bankruptcy.

---

## Affected Game State Shape

Ensure the game state model is extended or verified to include the following fields (add what is missing, do not break what exists):

```typescript
interface Player {
  id: string;
  name: string;
  token: string;
  colour: string;
  cash: number;
  position: number; // board space index
  inJail: boolean;
  isEliminated: boolean;
  goojfCards: { chance: number; communityChest: number }; // count of each held
  ownedPropertyIds: string[];
}

interface Property {
  id: string;
  name: string;
  colourGroup: ColourGroup | null;
  type: 'street' | 'station' | 'utility';
  price: number;
  mortgageValue: number;
  houseCost: number; // for streets only
  rent: { base: number; h1: number; h2: number; h3: number; h4: number; hotel: number };
  ownerId: string | null; // null = Bank / unowned
  houses: number; // 0–4
  hasHotel: boolean;
  isMortgaged: boolean;
}

interface CardDeck {
  type: 'chance' | 'community_chest';
  cards: Card[]; // ordered, draw from index 0, return to end
}

interface GameState {
  players: Player[];
  properties: Property[];
  chancedeck: CardDeck;
  communityChestDeck: CardDeck;
  pendingTrade: Trade | null;
  currentPlayerId: string;
  phase: GamePhase;
  winner: string | null;
}

type GamePhase =
  | 'roll'
  | 'moving'
  | 'landing_resolution'
  | 'strategic_action'
  | 'trade_pending'
  | 'card_resolution'
  | 'payment_required'
  | 'liquidation'
  | 'jail_decision'
  | 'game_over';
```

---

## Property Economics Reference

Use this as the authoritative data source when seeding the property data model.

### Streets

| Property | Buy | Mortgage | Base Rent | 1H | 2H | 3H | 4H | Hotel | House Cost |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Old Kent Road | $60 | $30 | $2 | $10 | $30 | $90 | $160 | $250 | $50 |
| Whitechapel Road | $60 | $30 | $4 | $20 | $60 | $180 | $320 | $450 | $50 |
| The Angel, Islington | $100 | $50 | $6 | $30 | $90 | $270 | $400 | $550 | $50 |
| Euston Road | $100 | $50 | $6 | $30 | $90 | $270 | $400 | $550 | $50 |
| Pentonville Road | $120 | $60 | $8 | $40 | $100 | $300 | $450 | $600 | $50 |
| Pall Mall | $140 | $70 | $10 | $50 | $150 | $450 | $625 | $750 | $100 |
| Whitehall | $140 | $70 | $10 | $50 | $150 | $450 | $625 | $750 | $100 |
| Northumberland Avenue | $160 | $80 | $12 | $60 | $180 | $500 | $700 | $900 | $100 |
| Bow Street | $180 | $90 | $14 | $70 | $200 | $550 | $750 | $950 | $100 |
| Marlborough Street | $180 | $90 | $14 | $70 | $200 | $550 | $750 | $950 | $100 |
| Food Street | $200 | $100 | $16 | $80 | $220 | $600 | $800 | $1,000 | $100 |
| Strand | $220 | $110 | $18 | $90 | $250 | $700 | $875 | $1,050 | $150 |
| Fleet Street | $220 | $110 | $18 | $90 | $250 | $700 | $875 | $1,050 | $150 |
| Trafalgar Square | $240 | $120 | $20 | $100 | $300 | $750 | $925 | $1,100 | $150 |
| Leicester Square | $260 | $130 | $22 | $110 | $330 | $800 | $975 | $1,150 | $150 |
| Coventry Street | $260 | $130 | $22 | $110 | $330 | $800 | $975 | $1,150 | $150 |
| Piccadilly | $280 | $140 | $24 | $120 | $360 | $850 | $1,025 | $1,200 | $150 |
| Regent Street | $300 | $150 | $26 | $130 | $390 | $900 | $1,100 | $1,275 | $200 |
| Oxford Street | $300 | $150 | $26 | $130 | $390 | $900 | $1,100 | $1,275 | $200 |
| Bond Street | $320 | $160 | $28 | $150 | $450 | $1,000 | $1,200 | $1,400 | $200 |
| Park Lane | $350 | $175 | $35 | $175 | $500 | $1,100 | $1,300 | $1,500 | $200 |
| Mayfair | $400 | $200 | $50 | $200 | $600 | $1,400 | $1,700 | $2,000 | $200 |

### Stations

| Name | Buy | Mortgage |
|---|---:|---:|
| King's Cross Station | $200 | $100 |
| Marylebone Station | $200 | $100 |
| Fenchurch Street Station | $200 | $100 |
| Liverpool Street Station | $200 | $100 |

Station rent: 1 owned = $25 · 2 = $50 · 3 = $100 · 4 = $200

### Utilities

| Name | Buy | Mortgage |
|---|---:|---:|
| Electric Company | $150 | $75 |
| Water Works | $150 | $75 |

Utility rent: 1 owned = 4× dice total · Both owned = 10× dice total

---

## Colour Group Reference

| Group | Properties |
|---|---|
| Brown | Old Kent Road, Whitechapel Road |
| Light Blue | The Angel Islington, Euston Road, Pentonville Road |
| Pink | Pall Mall, Whitehall, Northumberland Avenue |
| Orange | Bow Street, Marlborough Street, Food Street |
| Red | Strand, Fleet Street, Trafalgar Square |
| Yellow | Leicester Square, Coventry Street, Piccadilly |
| Green | Regent Street, Oxford Street, Bond Street |
| Dark Blue | Park Lane, Mayfair |

---

## Tests to Write

Write automated tests covering every case below. Tests must be deterministic — seed all randomness.

### Building Tests
- [ ] Cannot build without owning complete colour group
- [ ] Can build when complete colour group is owned
- [ ] Building is blocked on a mortgaged property
- [ ] Uneven building is allowed (more houses on one property than another in the same group)
- [ ] Multiple houses can be purchased in one turn
- [ ] Hotel requires exactly 4 houses
- [ ] Hotel upgrade cost equals house cost
- [ ] After hotel: house count is 0, hotel flag is true
- [ ] Sell one house: house count decrements, cash increases by house cost
- [ ] Sell hotel: property returns to 0 buildings, cash increases by hotel cost

### Mortgage Tests
- [ ] Can mortgage unmortgaged property with no buildings
- [ ] Cannot mortgage a property with houses
- [ ] Cannot mortgage a property with a hotel
- [ ] Cannot mortgage an already-mortgaged property
- [ ] Mortgaged property produces $0 rent
- [ ] Unmortgage costs the correct amount
- [ ] Cannot unmortgage with insufficient cash

### Trading Tests
- [ ] Property ↔ property trade executes correctly
- [ ] Cash ↔ property trade executes correctly
- [ ] 2-for-1 property trade executes correctly
- [ ] Mortgaged property is blocked from trade
- [ ] Property with houses is blocked from trade
- [ ] Property with hotel is blocked from trade
- [ ] GOOJF card can be included as a trade asset
- [ ] Trade proposal sets status to 'pending'
- [ ] Accepted trade transfers all assets and cash
- [ ] Rejected trade clears the pending trade, no assets move
- [ ] Trade with insufficient cash on offering side is invalid

### Jail Tests
- [ ] Landing on Go To Jail sets inJail = true and moves player to jail space
- [ ] Jail card sets inJail = true and ends turn
- [ ] Normal double while in jail: player escapes, moves, resolves landing
- [ ] 6+6 while in jail: no movement, no escape, forced reroll
- [ ] Pay $50: deducts cash, clears inJail, player moves
- [ ] Use GOOJF card: card removed from player, returned to correct deck, clears inJail

### Card Tests
- [ ] Drawing a card moves it to the bottom of the deck
- [ ] GOOJF card stays with the player, not returned to deck
- [ ] GOOJF card returns to correct deck when used
- [ ] Movement card passes GO correctly and awards $200
- [ ] "Nearest station" resolves correctly from each board quadrant
- [ ] "Nearest utility" resolves correctly from each board position
- [ ] "Pay per building" calculates correctly across multiple properties
- [ ] "Collect from each player" distributes from all active (non-eliminated) players

### Bankruptcy Tests
- [ ] Bankruptcy triggered when cash < debt and no liquidation possible
- [ ] Liquidation options presented before bankruptcy is confirmed
- [ ] Selling a house raises funds and recalculates solvency
- [ ] Selling a hotel raises funds and recalculates solvency
- [ ] Mortgaging a property raises funds and recalculates solvency
- [ ] If liquidation makes player solvent, game continues — bankruptcy is NOT declared
- [ ] Bankruptcy: all properties transfer to Bank (unowned)
- [ ] Bankruptcy: mortgaged properties auto-unmortgage on transfer
- [ ] Bankruptcy: all buildings removed
- [ ] Bankruptcy: creditor receives nothing
- [ ] Bankruptcy: player eliminated (isEliminated = true)
- [ ] After bankruptcy with 2 remaining players: win condition detected and game ends

---

## Milestone Completion Criteria

This milestone is complete when:

1. All engine functions listed above are implemented and return correct new game state.
2. All tests above pass.
3. The game is fully playable end-to-end in the browser from start to a declared winner, using functional (not polished) UI.
4. The strategic action phase correctly gates which actions are available based on game state.
5. Trade proposals and responses are correctly wired through the UI.
6. Bankruptcy correctly eliminates players and checks for a winner after each elimination.
7. All card effects resolve correctly for both decks.
8. No rule from the prohibited list above has been implemented.

Visual polish, animations, and final UI design are **not part of this milestone** — those are Milestones 4 and 5. Build for correctness and playability.
