# Borough — Claude Code Prompt
## Milestone 2: Core Gameplay

> Hand this prompt to Claude Code verbatim. It is self-contained.
> Milestone 1 (engine, data models, rules engine, tests) must be complete before starting this.

---

## Context

You are continuing development of **Borough**, a 2–4 player local multiplayer property-strategy board game for Windows desktop (shipped as an `.exe` via Electron in Milestone 7). The stack is React 18 + TypeScript + Vite.

Milestone 1 delivered:
- All TypeScript types and interfaces
- Full property economics data
- All 40 board spaces
- Chance and Community Chest card data
- The complete rules engine (`src/engine/`)
- Passing unit tests for all rules modules

**Milestone 2 covers:** the first playable build. A real game loop rendered on screen — board, dice, movement, landing resolution, property purchase, rent, GO, taxes, stations, utilities. No buildings, no trading, no jail yet. But a real game you can sit down and play turn by turn.

---

## 1. What to Build

At the end of Milestone 2 the game must be:

- **Launchable** with `npm run dev`
- **Playable** turn by turn with 2–4 players on a single machine
- **Complete** for the following events: rolling, moving, buying, paying rent, paying tax, passing GO, landing on special spaces
- **Wired to the engine** — the UI never calculates anything; it only calls `GameEngine.*` and renders the result

The following are **out of scope** for this milestone and must not be partially implemented:
- Buildings (houses/hotels)
- Trading
- Jail mechanics
- Chance / Community Chest cards
- Bankruptcy
- Mortgage / unmortgage
- Main menu
- Player setup screen

Those come in Milestone 3 and 4. Stub them gracefully — a "Coming in Milestone 3" placeholder is fine wherever these would normally appear.

---

## 2. Design System — Implement First

Before building any screen, establish the design system. Extract it from the existing UI design file and implement it as a single source of truth.

### `src/styles/tokens.css`

```css
:root {
  /* Background */
  --colour-bg:           #0D0D14;
  --colour-surface:      #1E1E30;
  --colour-surface-alt:  #2A2A40;
  --colour-elevated:     #13131F;

  /* Text */
  --colour-text:         #F0EDE4;
  --colour-text-muted:   #A09A8A;
  --colour-text-dim:     #5A5568;

  /* Accent */
  --colour-gold:         #C9A84C;
  --colour-gold-bright:  #E8C96A;
  --colour-gold-subtle:  rgba(201, 168, 76, 0.12);

  /* Semantic */
  --colour-success:      #4CAF7A;
  --colour-warning:      #E8A838;
  --colour-danger:       #E84545;

  /* Borders */
  --border-subtle:       rgba(201, 168, 76, 0.12);
  --border-default:      rgba(201, 168, 76, 0.20);
  --border-strong:       rgba(201, 168, 76, 0.40);

  /* Player colours */
  --colour-p1:           #E84560;   /* Crimson */
  --colour-p2:           #4A7FE8;   /* Cobalt */
  --colour-p3:           #4CAF7A;   /* Jade */
  --colour-p4:           #E8A838;   /* Amber */

  /* Property group colours */
  --colour-brown:        #8B6343;
  --colour-light-blue:   #6BB8D4;
  --colour-pink:         #D45F8A;
  --colour-orange:       #E8843A;
  --colour-red:          #E84545;
  --colour-yellow:       #E8C838;
  --colour-green:        #4CAF7A;
  --colour-dark-blue:    #2C5EBB;

  /* Typography */
  --font-display:        'Barlow', sans-serif;
  --font-mono:           'IBM Plex Mono', monospace;

  /* Radii */
  --radius-sm:           4px;
  --radius-md:           8px;

  /* Transitions */
  --transition-fast:     120ms ease;
  --transition-default:  200ms ease;
}
```

### `src/styles/typography.css`

```css
/* Display — game title, victory screen */
.text-display {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1;
}

/* H1 — screen titles */
.text-h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* H2 — section headings */
.text-h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* H3 — panel headings */
.text-h3 {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

/* Body */
.text-body {
  font-family: var(--font-display);
  font-size: 14px;
  line-height: 1.65;
}

/* Label / caption — mono, all caps */
.text-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Numeric display — dice totals, counters */
.text-numeric {
  font-family: var(--font-mono);
  font-size: 44px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Currency — cash amounts, prices */
.text-currency {
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Small currency — rent rows, small amounts */
.text-currency-sm {
  font-family: var(--font-mono);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
```

Import both in `src/main.tsx` before anything else. Google Fonts link for Barlow + IBM Plex Mono goes in `index.html`.

---

## 3. Directory Structure

```
src/
  engine/           ← Milestone 1 (do not modify)
  styles/
    tokens.css
    typography.css
    reset.css       ← box-sizing, margin reset
  components/
    board/
      Board.tsx
      BoardTile.tsx
      PlayerToken.tsx
    dice/
      DiceDisplay.tsx
    panels/
      PlayerPanel.tsx
      ActionPanel.tsx
    modals/
      PurchaseModal.tsx
      RentModal.tsx
      TaxModal.tsx
      SpecialSpaceModal.tsx   ← GO, Free Parking, Just Visiting
    shared/
      Button.tsx
      Modal.tsx
      MoneyDelta.tsx          ← animated cash change indicator
  screens/
    GameScreen.tsx            ← main game layout
    TempSetupScreen.tsx       ← temporary setup (Milestone 4 replaces this)
  hooks/
    useGameState.ts           ← wraps GameEngine calls, exposes state + actions
    useTokenAnimation.ts      ← drives space-by-space movement
    useSoundHooks.ts          ← stub — dispatches events, no audio yet
  App.tsx
  main.tsx
```

---

## 4. Temporary Setup Screen

A minimal `TempSetupScreen` to get into a game without a proper menu (that's Milestone 4).

Requirements:
- Input fields for 2–4 player names
- "Add Player" button (up to 4)
- "Start Game" button (minimum 2 players)
- On start: call `GameEngine.createNewGame(players)`, `GameEngine.initializeDeckOrder(state)`, store the resulting state, navigate to `GameScreen`
- No token selection needed yet — assign tokens automatically (token IDs: `'watch'`, `'yacht'`, `'ring'`, `'crown'`)
- Player colours assigned in order: P1 = Crimson, P2 = Cobalt, P3 = Jade, P4 = Amber

---

## 5. Game Screen Layout

`GameScreen.tsx` is the main game view. The board dominates the screen.

```
┌────────────────────────────────────────────────────────────────┐
│  MENU (top-left)                        CURRENT PLAYER (top-right) │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Player panels (left)       BOARD (centre)   Action area (right) │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Layout constraints
- `background: var(--colour-bg)`
- Board must be square, centred, and as large as the viewport allows while leaving room for panels
- Min board size: 600×600px. Target: 700×700px on a 1440px wide screen
- Player panels on the left, stacked vertically (one per player)
- Action panel on the right — this is where ROLL, BUY, PAY, etc. appear
- The board is never obscured by modals — modals overlay the action area or the full screen

---

## 6. Board Component

`Board.tsx` renders the 40-space board as a **CSS Grid**.

### Grid structure
The board is an 11×11 grid. Corner spaces occupy the full cell. Side spaces occupy one cell each.

```
┌──────────────────────────────┐
│ c9  s8  s7  s6  s5  s4  s3  s2  s1  s0  c10 │  ← top row (left→right)
│ s10                              s39 │  ← left/right columns
│ s11                              s38 │
│ ...        [CENTRE]              ... │
│ s19                              s30 │
│ c20 s21 s22 s23 s24 s25 s26 s27 s28 s29 c30 │  ← bottom row
└──────────────────────────────┘
```

More precisely:
- **Row 1, Cols 1–11**: spaces 39 (top-right corner) down through 30 (top-left corner), left to right: indices 30→39 reversed → actually board index 30=GO is bottom-left; lay out the board with GO at bottom-right corner (index 0), proceeding clockwise
- Use the standard UK board clockwise layout:
  - **Bottom row** (left→right): indices 20–0 (Free Parking corner at left, GO at right)
  - **Right column** (bottom→top): indices 1–9
  - **Top row** (right→left): indices 10–20 (Jail at right, Free Parking at left)  
  - **Left column** (top→bottom): indices 21–29

Wait — implement the correct layout:

```
Corner positions in the 11×11 grid:
  [row 11, col 11] = index 0  (GO)             ← bottom-right
  [row 1,  col 11] = index 10 (Jail/Visiting)  ← top-right
  [row 1,  col 1]  = index 20 (Free Parking)   ← top-left
  [row 11, col 1]  = index 30 (Go To Jail)     ← bottom-left

Bottom row (row 11): cols 11→1 = indices 0→10 reversed: 0,1,2,...,10
  col 11=0, col 10=1, col 9=2, col 8=3, col 7=4, col 6=5, col 5=6, col 4=7, col 3=8, col 2=9, col 1=10

Right column (col 11): rows 11→1 = indices 0,39,38,37,...,30
  row 11=0 (corner), row 10=39, row 9=38, row 8=37, row 7=36, row 6=35, row 5=34, row 4=33, row 3=32, row 2=31, row 1=30 (corner)

Top row (row 1): cols 11→1 = indices 10,11,12,...,20
  col 11=10 (corner), col 10=11, col 9=12, col 8=13, col 7=14, col 6=15, col 5=16, col 4=17, col 3=18, col 2=19, col 1=20

Left column (col 1): rows 1→11 = indices 20,21,22,...,30
  row 1=20 (corner), row 2=21, row 3=22, row 4=23, row 5=24, row 6=25, row 7=26, row 8=27, row 9=28, row 10=29, row 11=30 (corner)
```

### `BoardTile.tsx`

Each tile receives its `BoardSpace` and current `OwnershipRecord` (if applicable) as props.

**Every tile must display:**
- Property name (abbreviated if needed — max 2 lines)
- Colour group band (a coloured strip, 8px wide, on the side facing the board centre)
- Ownership indicator: if owned, show the player's colour as a small dot or band
- Buildings: show house/hotel count visually (dots or small icons)
- Mortgage state: if mortgaged, show a distinct "MORTGAGED" overlay or indicator
- Never rely on colour alone to communicate ownership — use a label or icon too

**Corner tiles** are larger (the full corner cell). They display their name and an icon/symbol.

**Tile text rotation:**
- Bottom row tiles: text reads upward (rotate 90° or lay out normally with bottom-to-top reading)
- Top row tiles: text reads downward
- Left column tiles: text reads rightward (rotate)
- Right column tiles: text reads leftward (rotate)
- Corner tiles: no rotation

**Colour group strip placement:**
- Bottom row: strip at top of tile (facing board centre)
- Top row: strip at bottom of tile
- Left column: strip at right of tile
- Right column: strip at left of tile

**Special space tiles** (GO, Jail, Free Parking, Go To Jail, Chance, Community Chest, Income Tax, Super Tax): use a background symbol or short label. No colour strip.

**Tile click**: clicking any tile opens the Property Inspection panel (implemented as a side drawer or modal). This must never interrupt active gameplay state — it is read-only.

### `PlayerToken.tsx`

- A coloured diamond shape (rotated square, matching the design system)
- 12×12px minimum
- Shows the player's colour and a 1-letter initial
- Multiple tokens on the same space stack horizontally with slight overlap
- Tokens animate between spaces (see Section 8)

---

## 7. Player Panels

`PlayerPanel.tsx` — one per active player, stacked vertically on the left side.

Each panel shows:
- Player name (`text-h3`)
- Token colour indicator (rotated square diamond, 12×12px)
- Cash (`text-currency` — large, always visible)
- Property count (`text-label`)
- Status badge: `YOUR TURN` (gold) / `WAITING` (dim) / `IN JAIL` (danger)
- A colour band bar at the bottom: small coloured segments representing owned colour groups

The **active player's panel** receives visual emphasis:
- Brighter border: `var(--border-strong)`
- Slightly elevated background

**Cash change animation:** when a player's cash changes, briefly show a `MoneyDelta` indicator (`+$200` in green, `-$100` in red) floating above the cash figure before settling.

`MoneyDelta.tsx`: a small absolutely positioned element that fades in, floats upward 16px, then fades out over 600ms. Use CSS keyframes.

---

## 8. Token Movement Animation

`useTokenAnimation.ts` drives the space-by-space movement animation.

### Behaviour
1. When `GameEngine.rollDice()` resolves with a non-6+6 result, the engine returns the target position
2. The UI does **not** teleport the token — it steps through intermediate spaces
3. Each space step takes **120ms**
4. After the final space, wait **150ms** then trigger landing resolution
5. During movement, the `TurnPhase` is `'moving'` — no UI interaction is permitted

### Implementation
```ts
// useTokenAnimation.ts
export function useTokenAnimation() {
  // Accepts: playerId, fromIndex, toIndex, onComplete callback
  // Returns: currentDisplayPosition (the index the token is currently shown at)
  // Internally: steps through each space index with setInterval/setTimeout
  // Wraps correctly around index 39 → 0
  // Calls onComplete() after reaching toIndex and the 150ms settle delay
}
```

### GO detection during animation
If any intermediate step crosses index 0 (the token's step goes from a high index to a lower one, wrapping), display a brief `+$200` flash on the GO tile and the player's panel simultaneously. The cash is already credited by the engine; the animation is purely visual confirmation.

---

## 9. Dice Display

`DiceDisplay.tsx` renders two dice and handles the five visual states from the design.

### States

| State | Visual |
|---|---|
| Idle | Two blank dice faces, `ROLL DICE` button visible |
| Rolling | Dice faces blur and rotate slightly (CSS animation), button disabled |
| Normal roll | Dice settle showing result, total displayed below |
| Normal double | Dice settle showing matching faces, "DOUBLE" label shown, total displayed |
| 6+6 | Both show 6, gold border + glow (`box-shadow: 0 0 0 3px rgba(201,168,76,0.18)`), "DOUBLE SIX — ROLL AGAIN" displayed prominently |

### Dice face rendering
Each die is a square with the correct pip layout for values 1–6. Render pips as small circles in the correct positions using CSS Grid. Do not use images.

```
1: centre
2: top-right, bottom-left
3: top-right, centre, bottom-left
4: four corners
5: four corners + centre
6: three left, three right (no centre)
```

### Roll animation
On roll: apply `animation: diceRoll 400ms ease-out` which rotates the die ±15° and blurs it slightly, then settles. After 400ms, show the result. The 400ms must complete before landing resolution begins.

---

## 10. Action Panel

`ActionPanel.tsx` renders the right side of the screen. Its content changes with `TurnPhase`.

### `awaiting-roll`
```
[CURRENT PLAYER NAME]
YOUR TURN

[ ROLL DICE ]
```

### `rolling` / `moving`
```
[CURRENT PLAYER NAME]

Rolling...   (or)   Moving...

[dice display]
```
No interactive buttons. Show the dice animation.

### `resolving-landing` → delegated to modals

The action panel shows a brief "Resolving..." state while the engine determines what happened. This should be near-instant; it's just a visual buffer.

### `strategic-action`
```
[CURRENT PLAYER NAME]

[Dice result shown, settled]

─────────────────────────
STRATEGIC ACTIONS
─────────────────────────
[ BUILD ]        (disabled — Milestone 3)
[ TRADE ]        (disabled — Milestone 3)
[ MORTGAGE ]     (disabled — Milestone 3)
─────────────────────────

[ END TURN ]
```

Disabled actions show as greyed-out buttons with a "Coming soon" tooltip. `END TURN` is always active during `strategic-action` phase.

### `turn-ended`
Brief "Passing to [next player]..." message, then auto-advance to next player's `awaiting-roll` state after 800ms.

---

## 11. Modals

All modals use the shared `Modal.tsx` wrapper:
- Dark overlay (`rgba(0, 0, 0, 0.7)`) over the whole screen
- Centred card, `background: var(--colour-surface-alt)`, `border: 1px solid var(--border-strong)`, `border-radius: var(--radius-md)`
- Padding: 28px
- Max width: 480px

### `PurchaseModal.tsx`

Triggered when `pendingAction.type === 'purchase-decision'`.

```
[COLOUR BAND — full width, 8px tall, property group colour]

[PROPERTY NAME]          ← text-h1
[COLOUR GROUP NAME]      ← text-label, muted

PURCHASE PRICE
$XXX                     ← text-numeric, gold

─────────────────────────
BASE RENT        $XX
1 HOUSE          $XX
2 HOUSES         $XX
3 HOUSES         $XX
4 HOUSES         $XX
HOTEL            $XX
─────────────────────────
HOUSE COST       $XX
MORTGAGE VALUE   $XX

YOUR CASH: $X,XXX
AFTER PURCHASE: $X,XXX  (shown in warning colour if < $200)

[ BUY FOR $XXX ]         ← primary button
[ PASS ]                 ← secondary button
```

No auction. Passing simply closes the modal and leaves the property unowned.

### `RentModal.tsx`

Triggered when `pendingAction.type === 'rent-payment'`.

```
RENT DUE

[PROPERTY NAME]
Owner: [OWNER NAME]

[rent amount]            ← text-numeric, danger colour

[breakdown — e.g. "Complete colour group × 2" or "2 Houses"]

YOUR CASH: $X,XXX
AFTER: $X,XXX

[ PAY $XXX ]             ← primary button (auto-executes after 1500ms if no interaction)
```

The pay button auto-triggers after 1500ms to keep the game flowing. Show a countdown progress bar under the button.

### `TaxModal.tsx`

Triggered when `pendingAction.type === 'tax-payment'`.

```
[INCOME TAX | SUPER TAX]

$XXX DUE TO BANK

YOUR CASH: $X,XXX

[ PAY $XXX ]             ← auto-executes after 1000ms
```

### `SpecialSpaceModal.tsx`

For spaces that resolve with a message but no player decision:
- **GO** (landed directly): "YOU LANDED ON GO · +$200"
- **Free Parking**: "FREE PARKING · Nothing happens."
- **Just Visiting**: "JUST VISITING · Nothing happens."

Auto-dismisses after 1200ms.

### Property Inspection Panel

Triggered by clicking any board tile. Renders as a side drawer sliding in from the right (not a full modal — the board remains visible).

Displays all property info (same fields as `PurchaseModal` minus the buy/pass buttons). Accessible at any time during gameplay. A close button or clicking outside dismisses it.

---

## 12. Sound Hook Stubs

`useSoundHooks.ts` must be implemented now even though no audio plays yet. This ensures audio can be wired in Milestone 5 without touching game logic.

```ts
// useSoundHooks.ts
export function useSoundHooks() {
  return {
    onDiceRoll:        () => { /* stub */ },
    onTokenStep:       () => { /* stub */ },
    onPropertyBought:  () => { /* stub */ },
    onRentPaid:        () => { /* stub */ },
    onTaxPaid:         () => { /* stub */ },
    onPassGo:          () => { /* stub */ },
    onCardDrawn:       () => { /* stub */ },
    onSentToJail:      () => { /* stub */ },
    onBankruptcy:      () => { /* stub */ },
    onVictory:         () => { /* stub */ },
  };
}
```

Call the appropriate hook at each event site. Never call audio APIs directly in game logic.

---

## 13. `useGameState` Hook

`useGameState.ts` is the bridge between the engine and the UI. The UI imports this hook and never imports `GameEngine` directly.

```ts
// useGameState.ts
export function useGameState(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);

  const actions = {
    rollDice:         () => setState(GameEngine.rollDice(state)),
    confirmPurchase:  (propertyId: string) => setState(GameEngine.confirmPurchase(propertyId, state)),
    declinePurchase:  () => setState(GameEngine.declinePurchase(state)),
    payRent:          () => setState(GameEngine.payRent(state)),
    payTax:           () => setState(GameEngine.payTax(state)),
    endTurn:          () => setState(GameEngine.endTurn(state)),
    // Stubs for Milestone 3:
    buyHouse:         (_propertyId: string) => { /* stub */ },
    trade:            () => { /* stub */ },
    mortgage:         (_propertyId: string) => { /* stub */ },
  };

  return { state, actions };
}
```

All state transitions flow through this hook. React re-renders on every `setState` call, which updates the board, panels, and modals automatically.

---

## 14. Turn Flow — Wiring it Together

The complete turn flow for Milestone 2 (no jail, no cards, no buildings):

```
1. GameScreen mounts → TurnPhase: 'awaiting-roll'
2. Current player sees [ ROLL DICE ] in ActionPanel
3. Player clicks ROLL DICE
   → actions.rollDice() called
   → engine returns new state with lastDiceRoll set
   → if 6+6: TurnPhase stays at needs re-roll — show DiceDisplay in 6+6 state, show "ROLL AGAIN" — go to step 3
   → if not 6+6: TurnPhase → 'moving'
4. useTokenAnimation steps the token space by space
   → if any step crosses index 0: flash +$200 on GO tile and player panel
5. Animation completes → call actions.resolveLanding()
   → engine determines what happened based on the space
6. Pending action set based on space type:
   → 'purchase-decision'  → PurchaseModal opens
   → 'rent-payment'       → RentModal opens
   → 'tax-payment'        → TaxModal opens
   → GO / Free Parking / Just Visiting → SpecialSpaceModal opens (auto-dismiss)
   → Go To Jail           → stub for Milestone 3; for now just log it and end turn
   → Chance / Community Chest → stub; log "Card draw coming in M3" and end turn
7. Player resolves the pending action (buy/pass/pay)
8. TurnPhase → 'strategic-action'
9. Player clicks END TURN (or auto-advances for rent/tax)
10. TurnPhase → 'turn-ended' → 800ms delay → next player → step 1
```

---

## 15. Stubs for Out-of-Scope Features

These events will occur during gameplay even in Milestone 2. Handle them gracefully:

| Event | Milestone 2 behaviour |
|---|---|
| Land on Go To Jail | Log to game log, show brief "Go To Jail — coming in Milestone 3" toast, end turn |
| Land on Chance | Log, show "Chance — coming in Milestone 3" toast, end turn |
| Land on Community Chest | Log, show "Community Chest — coming in Milestone 3" toast, end turn |
| Player runs out of money | Do not handle bankruptcy yet; allow negative cash temporarily (clearly shown in danger colour) |

A `Toast.tsx` component — a temporary notification that appears for 2 seconds at the top of the screen — covers all stubs.

---

## 16. Game Log

A scrollable log panel sits at the bottom of the action area (or below the action panel).

Each `GameLogEntry` from `state.log` is rendered as one line:
```
[PLAYER NAME]  Bought Food Street for $200
[PLAYER NAME]  Paid $32 rent to JAMES
[PLAYER NAME]  Passed GO · +$200
```

Player names are coloured with their player colour. Show the last 8 entries. Newest at the bottom. Auto-scroll to bottom on new entry.

---

## 17. Milestone 2 Checklist

Before considering this milestone complete, every item must pass:

### Functional
- [ ] 2-player game starts and completes turns without errors
- [ ] 4-player game starts and completes turns without errors
- [ ] 6+6 shows "ROLL AGAIN" and does not move the player
- [ ] Normal double moves player and ends turn (no extra roll)
- [ ] Non-double moves player and ends turn
- [ ] Passing GO awards $200 (visible in animation and cash)
- [ ] Landing on GO awards $200
- [ ] Buying a property transfers ownership and deducts cash
- [ ] Passing on a property leaves it unowned
- [ ] Landing on opponent's property opens RentModal with correct amount
- [ ] 2× rent applies for complete colour group with no buildings
- [ ] Mortgaged property shows $0 rent (not triggered in M2 but data is there)
- [ ] Income Tax deducts $100 to bank
- [ ] Super Tax deducts $200 to bank
- [ ] Station rent calculates correctly (1/2/3/4 owned)
- [ ] Utility rent calculates correctly (4× or 10× dice total)
- [ ] Free Parking does nothing
- [ ] Just Visiting does nothing
- [ ] Ownership indicator appears on tile after purchase
- [ ] Player panels show correct cash at all times
- [ ] Game log updates after every event
- [ ] Turn passes to next player correctly
- [ ] Bankrupt state not yet handled — negative cash shown clearly

### Visual
- [ ] Board renders all 40 spaces in correct positions
- [ ] Colour group bands visible on all street tiles
- [ ] Corner tiles visually distinct and larger
- [ ] Player tokens visible on correct spaces
- [ ] Multiple tokens on same space stack without overlapping
- [ ] Token animation is smooth and space-by-space
- [ ] Dice faces render correctly for all values 1–6
- [ ] 6+6 state has gold border/glow
- [ ] Active player panel is visually emphasised
- [ ] Cash change delta animation plays on gain/loss
- [ ] All modals dismiss correctly

### Code quality
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] No `any` types introduced
- [ ] UI never calls rules modules directly — only `GameEngine.*` via `useGameState`
- [ ] Sound hook stubs are in place and called at every event site

---

## Deliverables

When Milestone 2 is complete:

1. `npm run dev` launches a playable game
2. The board renders correctly with all 40 spaces
3. A full turn cycle (roll → move → resolve → end turn) works end-to-end
4. All Milestone 2 checklist items pass
5. `MILESTONE_2_NOTES.md` in the project root documenting: any layout decisions made, any engine method signatures that needed to change, and anything Milestone 3 needs to know

---

*This prompt is the complete specification for Milestone 2. Do not implement Milestone 3+ features. Stub gracefully and move on.*
