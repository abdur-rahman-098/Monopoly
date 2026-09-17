# 🎮 Game Design Specification — Version 1.0

> **A 2–4 player local multiplayer property-trading strategy board game designed for desktop.**
> Original branding, artwork, UI, tokens, cards, animations, and visual identity throughout.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Design Goals](#2-design-goals)
3. [Target Platform](#3-target-platform)
4. [Multiplayer Model](#4-multiplayer-model)
5. [Game Setup Flow](#5-game-setup-flow)
6. [Main Menu](#6-main-menu)
7. [Player Setup](#7-player-setup)
8. [Starting State](#8-starting-state)
9. [Main Game Screen](#9-main-game-screen)
10. [Board Presentation](#10-board-presentation)
11. [Player Information](#11-player-information)
12. [Turn State Machine](#12-turn-state-machine)
13. [Roll Interaction](#13-roll-interaction)
14. [Player Movement](#14-player-movement)
15. [Landing Resolution](#15-landing-resolution)
16. [Unowned Property](#16-unowned-property)
17. [Owned Property](#17-owned-property)
18. [Property Inspection](#18-property-inspection)
19. [Player Portfolio](#19-player-portfolio)
20. [Building Experience](#20-building-experience)
21. [Building Interaction](#21-building-interaction)
22. [Hotel Interaction](#22-hotel-interaction)
23. [Trading Experience](#23-trading-experience)
24. [Trading Restrictions](#24-trading-restrictions)
25. [Jail Experience](#25-jail-experience)
26. [Chance & Community Chest Experience](#26-chance--community-chest-experience)
27. [Money & Payment Feedback](#27-money--payment-feedback)
28. [Bankruptcy Flow](#28-bankruptcy-flow)
29. [Winner Experience](#29-winner-experience)
30. [Information Architecture](#30-information-architecture)
31. [Game Menu](#31-game-menu)
32. [Visual Design Direction](#32-visual-design-direction)
33. [Original Assets](#33-original-assets)
34. [Design System](#34-design-system)
35. [Animation Principles](#35-animation-principles)
36. [Sound — Future Layer](#36-sound--future-layer)
37. [Accessibility & Usability](#37-accessibility--usability)
38. [Rules Engine Boundary](#38-rules-engine-boundary)
39. [Testing Requirements](#39-testing-requirements)
40. [Important Rule: No Silent Rule Changes](#40-important-rule-no-silent-rule-changes)
41. [Open Decisions Before Implementation](#41-open-decisions-before-implementation)
42. [Development Milestones](#42-development-milestones)
43. [Key Principle](#43-key-principle)

---

## 1. Product Overview

### Working Description

A **2–4 player local multiplayer property-trading strategy board game** designed for desktop.

Players compete to:
- Acquire properties
- Develop them with buildings
- Collect rent from opponents
- Negotiate trades
- Manage cash flow
- Survive until they are the last player remaining

The game uses the **classic UK property/economic structure** as its numerical foundation, but is an **original game presentation** with its own branding, artwork, UI, tokens, cards, animations, and visual identity.

### Core Experience Loop

```
Roll → Move → Resolve → Manage → Negotiate → Build → Survive
```

The game should feel like a **premium modern digital board game** rather than a digitized physical board.

---

## 2. Design Goals

The experience should prioritize the following five pillars:

### 1. Strategy
Players should constantly make meaningful decisions around:
- Buying or passing on properties
- When and where to build
- When to mortgage
- Structuring trades
- Managing cash reserves
- Calculated risk-taking

### 2. Negotiation
Trading should be one of the game's defining mechanics. Players should feel like they are genuinely negotiating with one another — not selecting from rigid predefined trade templates.

### 3. Clarity
Even though the underlying rules can become complex, the interface should always make it immediately obvious:
- Whose turn it is
- Where the current player landed
- What happened as a result
- How much money changed hands
- What the player can do next
- What action is currently required

### 4. Personality
The game should have a strong, distinctive visual identity. It should never feel like a generic HTML board game.

### 5. Flow
Players should spend very little time navigating menus. The focus must remain on:

```
Board → Decision → Action → Result
```

---

## 3. Target Platform

### Primary Platform: Desktop

**Recommended implementation stack:**

| Layer | Technology |
|---|---|
| UI Framework | React |
| Language | TypeScript |
| Styling | Modern CSS |
| Architecture | Rules engine separated from UI layer |
| Distribution | Electron wrapper for final desktop packaging |

> The game should initially be fully playable in a browser during development, before being packaged as a desktop application via Electron.

---

## 4. Multiplayer Model

### Local Multiplayer

All players play on the same machine, sharing:
- One screen
- One board
- One game state

**Online multiplayer is not required for Version 1.**

### Player Count

| | Count |
|---|---|
| Minimum | 2 players |
| Maximum | 4 players |

---

## 5. Game Setup Flow

```
Launch
   ↓
Main Menu
   ↓
New Game
   ↓
Player Setup
   ↓
Choose Tokens
   ↓
Confirm Players
   ↓
Game Introduction
   ↓
Board
```

---

## 6. Main Menu

The main menu should be **extremely clean** with minimal friction.

### Primary Actions (Version 1)

| Action | Description |
|---|---|
| **New Game** | Begin player setup and start a new game |
| **How to Play** | Rules reference / tutorial |
| **Settings** | Audio, display, and preference controls |
| **Quit** | Exit the application |

### Potential Future Options (Not Required for v1)

- Continue Game
- Statistics
- Credits

---

## 7. Player Setup

The player setup screen supports **2–4 players**.

Each player configures:
- Player name
- Token (unique per player)
- Player colour
- Ready status

### Example Layout

```
PLAYER 1          PLAYER 2
[ Token ]         [ Token ]
Name              Name
Ready ✓           Ready ✓
```

### Rules
- Players can be added or removed until the game has 2–4 confirmed participants.
- **No two players can use the same token.**
- Each player chooses one unique token from the available set.

---

## 8. Starting State

After setup is confirmed, the game initializes as follows:

| Element | Starting State |
|---|---|
| Player cash | $1,500 each |
| Property ownership | All properties owned by the Bank |
| Buildings | Zero buildings on all properties |
| Mortgages | All properties unmortgaged |
| Chance deck | Shuffled |
| Community Chest deck | Shuffled |
| Player positions | All players at GO |
| Starting player | Determined by starting procedure (see below) |

### Starting Player Procedure

> ⚠️ **To be finalized before implementation.**

**Recommendation:** Every player rolls once. The highest roll goes first.

This must be explicitly confirmed before development begins.

---

## 9. Main Game Screen

This is the primary experience. The board should **dominate** the screen.

### Recommended Layout

```
┌──────────────────────────────────────────────────────┐
│ GAME / MENU                      CURRENT PLAYER       │
│                                                       │
│                 ┌─────────────────────┐               │
│                 │                     │               │
│                 │                     │               │
│                 │       BOARD         │               │
│                 │                     │               │
│                 │                     │               │
│                 └─────────────────────┘               │
│                                                       │
│  Player panels                    Action Area          │
└──────────────────────────────────────────────────────┘
```

---

## 10. Board Presentation

The board is the **visual centerpiece** of the game.

### Requirements

- Large and dominant in the layout
- Highly readable at a glance
- Interactive — tiles respond to player interaction
- Visually rich with clear colour group identity
- Easy to understand at a glance

### Each Tile Must Communicate

| Element | Visibility |
|---|---|
| Property name | Always visible |
| Colour group | Always visible |
| Ownership | Clearly indicated |
| Buildings | Clearly indicated |
| Mortgage state | Clearly indicated |
| Player tokens present | Visible on the tile |

### Player Tokens on the Board

- Tokens should visibly occupy board spaces.
- Multiple players may occupy the same space simultaneously.
- Stacking/grouping tokens on shared spaces must be handled gracefully.

---

## 11. Player Information

The UI should **always** expose each player's current state:

| Element | Always Visible |
|---|---|
| Name | ✅ |
| Token | ✅ |
| Current cash | ✅ |
| Number of properties | ✅ |
| Status indicators | ✅ (e.g. in jail, bankrupt) |

The **current active player** should receive clear visual emphasis.

### Example Player Panel

```
PLAYER 2
$1,240
● 6 Properties
YOUR TURN
```

---

## 12. Turn State Machine

The core game flow follows a well-defined state machine:

```
WAITING_FOR_TURN
        ↓
TURN_STARTED
        ↓
ROLL_REQUIRED
        ↓
DICE_ROLLED
        ↓
CHECK_6_PLUS_6
     ↙          ↘
   YES            NO
    ↓              ↓
 REROLL          MOVE
    ↓              ↓
    └────→ LANDING_RESOLUTION
                   ↓
             PLAYER_ACTIONS
                   ↓
               END_TURN
                   ↓
             NEXT_PLAYER
```

> Jail, bankruptcy, and card resolution each branch off this core flow as sub-states.

---

## 13. Roll Interaction

The primary action at the start of each turn is:

```
[ ROLL DICE ]
```

### After Rolling

1. Show both dice visually.
2. Display the total.
3. Animate the token if movement occurs.
4. Explain any special outcomes.

### 6+6 Handling

The UI must **explicitly communicate**:

```
DOUBLE SIX — ROLL AGAIN
```

- No movement occurs.
- No landing is resolved.
- Player rolls again immediately.

---

## 14. Player Movement

Token movement must be **animated space-by-space**, not teleported.

### Why This Matters

Visible step-by-step movement communicates:
- How far the player moved
- Which spaces were passed through
- Whether the player passed GO (triggering $200)

---

## 15. Landing Resolution

After movement completes, the game resolves the landed space.

### Possible Space Outcomes

| Space Type | Resolution |
|---|---|
| Unowned property | Purchase panel |
| Unowned station | Purchase panel |
| Unowned utility | Purchase panel |
| Owned property / station / utility | Rent calculation and payment |
| Own property | Nothing happens |
| Chance | Draw card |
| Community Chest | Draw card |
| Income Tax | Pay $100 to Bank |
| Super Tax | Pay $200 to Bank |
| Free Parking | Nothing happens |
| GO | Collect $200 |
| Go To Jail | Move to Jail |
| Jail / Just Visiting | Nothing (just visiting) |

---

## 16. Unowned Property

When landing on an unowned purchasable property, a **purchase panel** is displayed.

### Example Panel

```
FOOD STREET

ORANGE

Purchase Price
$200

Base Rent
$16

House Cost
$100

[ BUY FOR $200 ]        [ PASS ]
```

### Rules
- If the player selects **BUY**: payment is processed, ownership transfers.
- If the player selects **PASS**: the property remains unowned.
- **There is no auction.** Passing simply leaves the property available.

---

## 17. Owned Property

If the landed property belongs to another player, a **rent due panel** is displayed.

### Example Panel

```
RENT DUE

Food Street

Owner: Player 2

Rent
$32

[ PAY $32 ]
```

### Rent Calculation Logic

| Condition | Rent Applied |
|---|---|
| Owner has complete colour group, 0 buildings | 2× base rent |
| Property has buildings | Exact printed building-level rent |
| Property is mortgaged | $0 |
| Player owns the property | Nothing |

> The system calculates rent automatically. The UI displays the result.

---

## 18. Property Inspection

Players should be able to **inspect any property** without interrupting gameplay.

### Information Displayed

- Owner (or Bank if unowned)
- Purchase price
- Mortgage value
- Base rent
- Rent at each building level (1H, 2H, 3H, 4H, Hotel)
- House cost
- Hotel cost
- Current buildings
- Mortgage status
- Colour group

### Accessible From

- Tapping/clicking a tile on the board
- The player's own portfolio
- The trade interface

---

## 19. Player Portfolio

Each player has access to a **property portfolio** screen.

### Example Layout

```
MY PROPERTIES

ORANGE
Bow Street         🏠🏠
Marlborough St     —
Food Street        🏨

RED
Strand             —
Fleet Street       —
Trafalgar Square   —
```

### Available Actions From Portfolio

| Action | Eligibility |
|---|---|
| Build house / hotel | Complete colour group, can afford cost |
| Sell building | Property has buildings |
| Mortgage property | Property is unmortgaged, no buildings |
| Unmortgage property | Property is mortgaged |
| View property details | Always available |

---

## 20. Building Experience

When a player owns a complete colour group, the UI should make building **discoverable and accessible**.

### Example Group View

```
ORANGE GROUP

Bow Street
🏠🏠

Marlborough Street
🏠

Food Street
—

[ BUILD ]
```

### Key Rules Reflected in UI

- **No even-building restriction.** The player can choose any eligible property independently.
- The UI must never prevent uneven development across a colour group.
- The player may build on any property within the owned group regardless of what others have.

---

## 21. Building Interaction

Selecting **BUILD** opens a contextual building control.

### Example — Adding a House

```
FOOD STREET

Current: 1 House

House #2
Cost: $100

[ BUILD ]

Available Cash: $1,420
```

- The player may continue building additional houses in the same action if they can afford each one.
- Available cash updates after each purchase.

---

## 22. Hotel Interaction

When a property has **4 houses**, the hotel upgrade option appears.

### Example — Hotel Upgrade Panel

```
FOOD STREET

🏠 🏠 🏠 🏠

HOTEL UPGRADE
Cost: $100

4 Houses → 1 Hotel

[ UPGRADE ]
```

### After Confirmation

```
🏠 🏠 🏠 🏠
      ↓
     🏨
```

- The 4 houses are removed.
- 1 hotel is placed.
- The hotel upgrade cost equals the property's house cost.

---

## 23. Trading Experience

Trading is a **major feature**, not an afterthought. The trade interface should feel like a genuine negotiation table.

### Example Trade Interface

```
TRADE

YOU GIVE                    PLAYER 2 GIVES
┌─────────────────────┐    ┌─────────────────────┐
│ Food Street         │    │ Strand               │
│ $100 cash           │    │                      │
└─────────────────────┘    └─────────────────────┘

                [ PROPOSE TRADE ]
```

### Trade Builder

Players can add to either side of the trade:
- **Properties** (eligible ones only)
- **Cash amounts**

Both parties must **explicitly accept** before a trade executes.

### Get Out of Jail Free Cards

GOOJF cards are treated as **tradeable assets** and can be included in trade proposals.

---

## 24. Trading Restrictions

### Properties That Cannot Be Traded

The UI automatically prevents selecting:

| Condition | Tradeable? |
|---|---|
| Unmortgaged, no buildings | ✅ Yes |
| Mortgaged | ❌ No |
| Has houses | ❌ No |
| Has a hotel | ❌ No |

### Timing — When Trading Is Locked

Trading is **temporarily unavailable** while the game is actively processing:

- Dice movement
- Landing resolution
- Card resolution
- Payment processing
- Building actions

### Timing — When Trading Is Available

- During the current player's strategic action phase
- During another player's turn (with mutual agreement)
- While a player is in jail

---

## 25. Jail Experience

When a player is sent to jail, their status changes clearly in the UI.

### Jail Options Panel

```
YOU ARE IN JAIL

Choose an option:

[ ROLL FOR DOUBLE ]

[ PAY $50 ]

[ USE GET OUT OF JAIL FREE ]
```

### Outcome Handling

| Roll Result | Outcome |
|---|---|
| Normal double (not 6+6) | Player escapes jail, moves by dice total, resolves landing |
| 6+6 | Forced reroll — no movement, no escape |
| Non-double | Player remains in jail; turn ends |

### 6+6 in Jail — UI Message

```
DOUBLE SIX

No movement.

ROLL AGAIN.
```

---

## 26. Chance & Community Chest Experience

Cards should feel **physical and premium**.

### Card Draw Sequence

1. Pause all board interaction.
2. Animate the card into view.
3. Display the card face with full text and artwork.
4. Explain the effect clearly.
5. Execute the effect.
6. Return card to the bottom of the deck.
7. Resume normal game flow.

### Movement Cards

```
CARD EFFECT

Move to Trafalgar Square

→ Token moves to destination
→ Destination resolved normally
```

If the movement card causes the player to pass GO, they collect $200.

### Get Out of Jail Free Card

- Remains in the player's possession.
- Not returned to the deck until used.
- Can be traded to another player.

---

## 27. Money & Payment Feedback

Money changes must be **highly visible** and clearly communicated.

### Player Cash Change

```
PLAYER 1
$1,500
   ↓
  -$200
   ↓
$1,300
```

### Rent Transfer

```
-$220
PLAYER 1 → PLAYER 2
```

### Bank Payment

```
-$100
PLAYER 1 → BANK
```

> This constant feedback helps all players track the economy without needing to inspect individual balances.

---

## 28. Bankruptcy Flow

When a player cannot meet a payment obligation:

### Step 1 — Payment Required

```
PAYMENT REQUIRED

You owe $850 to Player 2.
Your current cash: $120.
```

### Step 2 — Asset Liquidation Options

Give the player options to raise funds:
- Sell houses (100% value returned)
- Sell hotels (100% value returned)
- Mortgage eligible properties

### Step 3 — Recalculate

After each action, recalculate available funds and remaining debt.

### Step 4 — Elimination (if still unable to pay)

```
BANKRUPT

PLAYER 3 has been eliminated.
```

### What Happens to Assets

| Asset | Outcome |
|---|---|
| All properties | Transfer to the Bank |
| Mortgaged properties | Automatically unmortgaged |
| Houses | Removed |
| Hotels | Removed |
| Creditor | Receives nothing from bankrupt assets |

Properties become **unowned** and are available for normal purchase when another player lands on them.

> There is no immediate shopping phase, automatic auction, or automatic transfer to the creditor.

---

## 29. Winner Experience

When only one player remains:

```
           VICTORY

        PLAYER 2 WINS

      $4,820 NET WORTH

        LAST PLAYER
         STANDING

[ PLAY AGAIN ]     [ MAIN MENU ]
```

- The winning player receives a **strong visual celebration animation**.
- Net worth is displayed as a final stat.
- Players can immediately start a new game or return to the main menu.

---

## 30. Information Architecture

### Top-Level Navigation

```
MAIN MENU
│
├── New Game
│   └── Player Setup
│       └── Game
│
├── How to Play
│
└── Settings
```

### In-Game Navigation

```
GAME
│
├── Board
├── Player Portfolio
├── Property Details
├── Trade
├── Build
├── Mortgage
├── Card
├── Jail
├── Payment
└── Game Menu
```

---

## 31. Game Menu

Accessible at any time during gameplay.

```
GAME MENU

Resume
Rules
Settings
Restart Game
Quit to Main Menu
```

> **Restart Game** must require a confirmation step before executing — this is an irreversible action.

---

## 32. Visual Design Direction

The game should **not attempt to visually reproduce Monopoly**.

### Target Aesthetic

**Premium · Modern · Sophisticated · Playful**

Think:
- A modern tabletop game designed for adults
- High-end physical board game materials
- Urban property world — clean, architectural, considered
- Beautiful physical material textures and depth
- Smooth, purposeful animation
- Strong typographic hierarchy
- Carefully controlled, restrained colour palette

### Avoid

| ❌ Avoid | Why |
|---|---|
| Generic Bootstrap UI | Looks unfinished and off-the-shelf |
| Flat HTML-looking board | Lacks premium feel |
| Excessive gradients | Feels dated and cheap |
| Cheap casino aesthetic | Wrong tone entirely |
| Cartoonish children's-game appearance | Wrong audience |
| Direct Monopoly visual references | Legal and identity risk |

---

## 33. Original Assets

**Every visual element must be original.** Nothing should be borrowed, referenced, or derived from Monopoly or any other existing property.

| Asset Category | Requirement |
|---|---|
| Board | Original artwork and tile treatment |
| Tokens | Original character designs |
| Buildings (houses/hotels) | Original designs |
| Cards (Chance / Community Chest equivalents) | Original card design and illustration |
| Currency | Original currency artwork |
| Icons | Original iconography throughout |
| Logo / branding | Original game name and mark |
| Animations | Original motion language |
| Typography | Original type choices aligned to game identity |

---

## 34. Design System

A complete design system must be established **before** designing individual screens.

### Typography Scale

| Role | Usage |
|---|---|
| Display | Game title, victory screen |
| H1 | Screen titles |
| H2 | Section headings |
| H3 | Panel headings |
| Body | Descriptions, rules, card text |
| Caption | Labels, hints, tooltips |
| Numeric Display | Dice totals, turn counters |
| Currency Display | Cash amounts, rent, prices |

### Colour Tokens

| Token | Purpose |
|---|---|
| Primary | Main brand colour |
| Secondary | Supporting accent |
| Background | Base game background |
| Surface | Panel / card backgrounds |
| Elevated Surface | Modals, popups |
| Text | Primary text |
| Muted Text | Secondary / helper text |
| Success | Positive outcomes |
| Warning | Caution states |
| Danger | Negative outcomes, bankruptcy |
| Player 1–4 Colours | Unique per-player identity |
| Property Group Colours | Brown, Light Blue, Pink, Orange, Red, Yellow, Green, Dark Blue |

### Component Library

Reusable components must be defined for:

- Buttons (primary, secondary, destructive)
- Cards (property, player, action)
- Modals and overlays
- Panels
- Property tiles (board)
- Property cards (portfolio, inspection)
- Player panels
- Dice (visual + animation states)
- Tokens
- Buildings (house, hotel)
- Trade interface controls
- Notification / toast messages
- Action bars
- Confirmation dialogues

---

## 35. Animation Principles

Animation must **communicate state**, not simply decorate the interface.

### Animation Inventory

| Trigger | Animation |
|---|---|
| Dice roll | Roll → settle with result |
| Token movement | Move space-by-space along board |
| Property purchase | Ownership colour appears on tile |
| Rent payment | Money visually transfers between players |
| House placed | House appears on property tile |
| Hotel upgrade | 4 houses transform into 1 hotel |
| Trade completed | Assets move between portfolios |
| Bankruptcy | Properties return to Bank state |
| Victory | Strong celebratory animation for winner |

### Animation Speed Principle

> Animations must be fast enough that they don't make normal turns feel slow or frustrating. They should inform, not delay.

---

## 36. Sound — Future Layer

Sound is **not required** for the first playable build, but the architecture must support it being added later.

### Potential Sound Events

| Event | Sound |
|---|---|
| Dice roll | Roll sound |
| Token movement | Step per space |
| Property purchase | Confirmation chime |
| Rent payment | Cash transfer sound |
| Building placed | Construction sound |
| Hotel upgrade | Upgrade fanfare |
| Card drawn | Card flip |
| Sent to jail | Jail sound |
| Bankruptcy | Elimination sound |
| Victory | Victory fanfare |

> Do not hard-code silence. Build hooks for audio events from the beginning.

---

## 37. Accessibility & Usability

### Requirements

| Requirement | Detail |
|---|---|
| Text readability | High contrast, readable font sizes throughout |
| Ownership indicators | Never rely on colour alone — use icons + text |
| Irreversible actions | Always require explicit confirmation |
| No hidden information | All game state visible to players |
| Tooltips | Available for unfamiliar mechanics |
| Keyboard support | Where practical |

> Property ownership must **never** be communicated by colour alone. Icons, labels, and text must reinforce all ownership states.

---

## 38. Rules Engine Boundary

The UI should **never directly implement game rules**.

### Architecture Principle

```
             ┌──────────────────────┐
             │      GAME ENGINE     │
             │                      │
             │  · Rules             │
             │  · State             │
             │  · Validation        │
             │  · Calculations      │
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │          UI          │
             │                      │
             │  · Board             │
             │  · Panels            │
             │  · Animations        │
             │  · Dialogues         │
             └──────────────────────┘
```

### Example

**Wrong — UI calculates rent:**
```
// ❌ Never do this in the UI layer
if (player.ownsAllInGroup && property.houses === 0) {
  rent = property.baseRent * 2;
}
```

**Correct — UI asks the engine:**
```
// ✅ Correct approach
const rent = gameEngine.calculateRent(propertyId, gameState);
ui.displayRent(rent);
```

The UI receives results from the engine and renders them. It does not compute, validate, or apply rules independently.

---

## 39. Testing Requirements

Every custom or unusual rule must have **automated tests**.

### Dice Tests

- [ ] Normal roll (non-double)
- [ ] Normal double (3+3, 4+4, 5+5, etc.)
- [ ] 6+6 — no movement, forced reroll
- [ ] Multiple consecutive 6+6 chains
- [ ] 6+6 followed by a normal roll
- [ ] 6+6 while in jail — no escape, forced reroll

### Rent Tests

- [ ] Normal property, unimproved, no colour group
- [ ] Complete colour group, 0 buildings — 2× multiplier applies
- [ ] Complete colour group, has buildings — exact building rent, no multiplier
- [ ] Mortgaged property — $0 rent
- [ ] Landing on own property — no rent

### Building Tests

- [ ] Attempt to build without complete colour group — blocked
- [ ] Build on complete colour group — allowed
- [ ] Uneven building (more houses on one property than another) — allowed
- [ ] Purchase multiple houses in one turn
- [ ] Hotel conversion from 4 houses
- [ ] Sell individual houses (100% return)
- [ ] Sell hotel (100% return, returns to 0 buildings)

### Trading Tests

- [ ] Property ↔ property
- [ ] Money ↔ property
- [ ] 2-for-1 property trade
- [ ] Attempt to trade mortgaged property — blocked
- [ ] Attempt to trade property with buildings — blocked
- [ ] Trade acceptance flow
- [ ] Trade rejection flow
- [ ] Trade with Get Out of Jail Free card

### Jail Tests

- [ ] Sent to jail via Go To Jail space
- [ ] Sent to jail via card
- [ ] Normal double escape (not 6+6)
- [ ] 6+6 in jail — no escape
- [ ] Pay $50 to exit
- [ ] Use Get Out of Jail Free card

### Bankruptcy Tests

- [ ] Asset liquidation options presented before elimination
- [ ] Houses sold, funds recalculated
- [ ] Hotels sold, funds recalculated
- [ ] Properties mortgaged, funds recalculated
- [ ] Bankruptcy confirmed — all properties to Bank
- [ ] Mortgaged bankrupt properties automatically unmortgaged
- [ ] Buildings removed on bankruptcy
- [ ] Creditor receives nothing
- [ ] Player eliminated from game
- [ ] Properties return to unowned state

---

## 40. Important Rule: No Silent Rule Changes

The implementation must treat:

```
GAME_RULES.md
```

as the **authoritative gameplay specification**.

### Claude Code Must Not

| Prohibited Behaviour | Why |
|---|---|
| Add traditional Monopoly rules that were removed | They were deliberately removed |
| Assume standard Monopoly behaviour | This is a custom ruleset |
| Add auctions | Explicitly removed |
| Grant extra rolls for normal doubles | Normal doubles end the turn |
| Send players to jail for three doubles | No three-doubles-to-jail rule |
| Apply 2× rent to developed properties | 2× only applies to unimproved complete sets |
| Give bankrupt properties to creditors | All bankruptcy assets go to the Bank |

### If a Rule Is Ambiguous

> Flag it. Do not silently invent behavior.

---

## 41. Open Decisions Before Implementation

The following items must be **explicitly confirmed** before development begins.

### A. Starting Player

**Recommendation:** Every player rolls once. The highest roll goes first.

> ✅ Confirm or amend this before implementation.

### B. Get Out of Jail Free Card — Trading

We have established that GOOJF cards **can be traded**.

**Recommendation:** Treat GOOJF cards as normal tradeable assets within the trade interface.

> ✅ Confirm or amend this before implementation.

### C. Hotel Resale Value

Previously settled:

**Hotel sells back to Bank at 100% of the hotel upgrade/purchase cost.**

> ✅ Confirmed. No change needed.

### D. Early Game-Ending Option

An optional **Declare Winner / End Game** mechanism was discussed.

**Recommendation:** Leave this out of Version 1.

> ✅ Confirm or amend before implementation.

---

## 42. Development Milestones

Once this specification is approved, development is broken into **7 milestones**:

### Milestone 1 — Foundation

- Project setup
- TypeScript configuration
- Game state model
- Data models (properties, players, cards, board)
- Rules engine scaffold

### Milestone 2 — Core Gameplay

- Dice mechanics (including 6+6 custom rule)
- Token movement (animated, space-by-space)
- Board rendering
- Property ownership
- Rent calculation and payment
- GO ($200 pass and land)
- Tax spaces
- Station rent
- Utility rent

### Milestone 3 — Strategy Layer

- Building (houses and hotels)
- Selling buildings
- Mortgages and unmortgages
- Trading interface and logic
- Jail mechanics
- Chance and Community Chest cards
- Bankruptcy flow

### Milestone 4 — UI

- Main menu
- Player setup screen
- Game board full implementation
- Player panels
- Action modals and dialogues
- Property portfolio screen
- Trade interface

### Milestone 5 — Visual Polish

- Original artwork and asset integration
- Animations (all events from Section 35)
- Transitions between states
- Micro-interactions and hover states
- Victory and bankruptcy sequences

### Milestone 6 — QA

- Automated rules tests (full coverage from Section 39)
- Full-game simulation runs
- Edge case testing
- UX review and usability testing
- Performance profiling

### Milestone 7 — Desktop

- Electron packaging
- Save / resume (if required)
- Installer creation
- Final production build

---

## 43. Key Principle

**Don't let Claude Design and Claude Code solve the same problem.**

| Tool | Answers |
|---|---|
| **Claude Design** | What should this game look and feel like? |
| **Claude Code** | How should this game work? |

The **Game Rules document** and this **Game Design Specification** sit between them as the contract that both must honour.

---

### Recommended Next Step

Now that the **Rules Specification** and **Game Design Specification** are complete, the next document to produce is the:

## 📋 Creative Direction Brief

This brief should cover:

- Game name
- World / theme concept
- Visual personality and tone
- Board aesthetic direction
- Token concepts and character
- Property visual language
- Card style and illustration direction
- Typography direction
- Colour philosophy

That brief becomes the foundation for the **first Claude Design prompt**.

---

*This document is the authoritative Game Design Specification for Version 1.0. All UX flows, architecture decisions, and feature scope listed here are final unless explicitly amended before development begins.*
