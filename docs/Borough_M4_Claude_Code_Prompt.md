# Milestone 4 — UI

## Context

You are continuing development of **Borough**, a 2–4 player local multiplayer property strategy board game for desktop. Milestones 1–3 are complete. The codebase contains:

- A fully working rules engine (all game logic, validation, state transitions)
- Dice mechanics, token movement, property ownership, rent calculation
- Building, selling, mortgages, trading, jail, cards, bankruptcy
- Functional (unstyled) UI wired to the engine

This milestone replaces the functional UI with the **full designed interface**. The rules engine must not be modified. All logic continues to live in the engine; this milestone is purely about the UI layer.

---

## Architecture Reminder

The UI calls the engine. It does not implement rules.

```
// ✅ Correct
const options = gameEngine.getJailOptions(playerId, gameState);
ui.renderJailPanel(options);

// ❌ Never
if (player.cash >= 50) showPayButton();
```

---

## Design System

Apply this design system consistently across every screen and component.

### Game Name & Tagline
- **Name:** BOROUGH
- **Tagline:** OWN THE CITY. OUTLAST EVERYONE.

### Colour Tokens

| Token | Value | Notes |
|---|---|---|
| Background | `#0D0D14` | Base layer — all screens |
| Surface | `#1E1E30` | Panels, cards, player setup tiles |
| Elevated Surface | `#2A2A40` | Modals, overlays, hover states |
| Deep Surface | `#13131F` | Inset areas, inputs, board interior |
| Gold (Primary) | `#C9A84C` | Brand colour, borders, interactive gold |
| Gold Hover | `#E8C96A` | Gold on hover |
| Text Primary | `#F0EDE4` | Main readable text |
| Text Muted | `#A09A8A` | Secondary labels, captions |
| Text Faint | `#5A5568` | Tertiary, disabled hints |
| Success | `#4CAF7A` | Credits, positive outcomes |
| Warning | `#E8A838` | Insufficient funds, cautions |
| Danger | `#E84545` | Debt, debit, bankruptcy |
| Danger Red | `#E84560` | Player 1 default colour |

### Player Colours (defaults)

| Player | Name | Colour |
|---|---|---|
| Player 1 | Crimson | `#E84560` |
| Player 2 | Cobalt | `#4A7FE8` |
| Player 3 | Jade | `#4AC48A` |
| Player 4 | Amber | `#E8A838` |

Players choose their own name and colour during setup. These are defaults.

### Property Group Colours

| Group | Colour |
|---|---|
| Brown | `#8B5E3C` |
| Light Blue | `#6BB8D4` |
| Pink | `#D45C8B` |
| Orange | `#E88A35` |
| Red | `#E84545` |
| Yellow | `#E8D035` |
| Green | `#30A855` |
| Dark Blue | `#1A4FBF` |

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / Game Title | Barlow | 900 | All caps, wide tracking |
| Headings | Barlow | 700 | Mixed case |
| Subheadings / UI Labels | Barlow | 600 | Often all caps with tracking |
| Body | Barlow or DM Sans | 400 | Readable weight |
| Monospace Labels / Data | IBM Plex Mono | 400–600 | Caps, wide tracking — all numbers, stats, codes |
| Currency Display | IBM Plex Mono | 500–600 | `font-variant-numeric: tabular-nums` always |

Load from Google Fonts:
```
Barlow:wght@400;600;700;900
DM Sans:wght@400;500;700
IBM Plex Mono:wght@300;400;500;600
```

### Spacing & Shape

- Border radius: `4px` for buttons and tiles; `8px` for cards and panels
- Board tile border radius: `0` (hard grid)
- Borders: `1px solid` — gold variants at low opacity for structural, full gold for active/focus
- Transitions: `80ms cubic-bezier(0.4,0,0.2,1)` on interactive elements

### Grid / Layout

- Background grid: `repeating-linear-gradient` at 80px intervals in gold at 5% opacity — used on full-screen backgrounds
- All screens: 1440×900px target canvas, browser-playable
- Main game board: 780×780px centered, 11×11 grid (9 inner + corner cells each side)
- Corner cells: 104×104px; inner cells equal-width

---

## Screens to Build

### Screen 1 — Main Menu

**Layout:**
- Full 1440×900 background: `#0D0D14` with the subtle gold grid overlay
- Cityscape silhouette behind everything: vertical rectangles of varying heights at bottom, `#13131F` fill with faint gold top borders, opacity ~50%, fading up via gradient
- Centred content: game title at 112px/900 weight in Gold, tagline in IBM Plex Mono 13px/0.22em tracking in Muted
- Buttons below title in a 340px column, stacked 16px gap

**Buttons:**

| Label | Style |
|---|---|
| NEW GAME | `#13131F` bg, `1px solid Gold`, Text Primary, 16px/600 |
| HOW TO PLAY | `#1E1E30` bg, `1px solid rgba(Gold, 0.15)`, Text Muted |
| SETTINGS | Same as How to Play |
| QUIT | No border, Text Faint only |

All buttons: `border-radius:4px`, `padding:18px`, `letter-spacing:0.12em`, 80ms transition. Hover: gold bg lightens / border brightens / text goes Primary.

**Footer:** `v1.0` in IBM Plex Mono Faint, bottom-right.

---

### Screen 2 — Player Setup

**Layout:**
- Full-screen `#0D0D14`, padding 64px
- Title: "New Game" in Barlow 700 32px, subtitle: "2 to 4 players. Add players to begin." in Muted 14px
- 4-column grid (4 equal columns, 24px gap) containing player cards + one "Add Player" card

**Player cards:**
- `#1E1E30` bg, 8px radius, 28px/24px padding, flex column, 24px gap
- Player slot label at top: IBM Plex Mono 11px/600 in player colour (e.g. "PLAYER 1")
- Token preview: 88×88px `#13131F` box, 8px radius, token icon centred in player colour
- Name section: "NAME" label in Faint mono, name value in 18px/600 Text Primary, underlined by gold rule at 25% opacity
- Bottom row: colour swatch (12×12px, 2px radius in player colour) + colour name in Muted mono; READY badge (mono 11px, green border/bg, `#4CAF7A` text) on right

**Add Player card:**
- `#13131F` bg, dashed border `rgba(Text Muted, 0.35)`, centred `+` icon in a bordered square, "Add Player" label in Muted, "OPTIONAL" in Faint mono
- Hover: border shifts to `rgba(Gold, 0.5)`

**Footer bar:**
- `padding-top:40px`, `border-top:1px solid rgba(Gold,0.12)`
- Left: player count + starting cash in Muted mono
- Right: BACK (secondary style) + START GAME (gold border primary)

---

### Screen 3 — Token Selection

**Layout:** Same outer chrome as Player Setup.

- Active player label at top (player colour + "PLAYER N"), heading "Choose your token" 32px/700
- Subtitle: "One token per player. Taken tokens are unavailable."
- 4-column token grid

**Token cards:**
- Available: `#1E1E30` bg, faint gold border, full opacity
- Selected: `#2A2A40` bg, full gold border, gold glow (`box-shadow:0 0 0 3px rgba(Gold,0.18)`)
- Taken (by another player): opacity 0.35, `cursor:not-allowed`
- Each card: token icon (64px height, CSS-drawn in token colour), token name, "TAKEN BY [PLAYER]" or "AVAILABLE" label

**Tokens (8 available, CSS-drawn icons):**
The Key, The Watch, The Tower, The Yacht, The Case, The Ring, The Car, The Crown

**Footer:** player colour/name reminder on left + CONFIRM button (gold primary) on right.

---

### Screen 4 — Game Introduction

Full-screen animated reveal before the board appears.

- Background: board outline fading in behind content
- Large centred BOROUGH wordmark
- Player roster: each player's name, token, slot and colour shown in a horizontal row
- Tagline
- "BEGIN" button to enter the board

This can be a simple 2–3 second auto-advance or a manual "let's go" moment.

---

### Screen 5 — Main Game Board

This is the primary screen. Every element below must be present and functional.

#### Overall Layout (1440×900)

```
┌─────────────────────────────────────────────────────────────┐
│  [MENU]  ROUND N                          PLAYER NAME  $CASH │  ← top bar (40px)
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────┐   ┌─────┐ │
│  │              │    │                          │   │     │ │
│  │  ACTION      │    │       BOARD              │   │  P2 │ │
│  │  PANEL       │    │    (780×780px)            │   │  P3 │ │
│  │              │    │                          │   │  P4 │ │
│  └──────────────┘    └──────────────────────────┘   └─────┘ │
│                                                              │
│  [Activity Log]              [Dice area]                     │
└─────────────────────────────────────────────────────────────┘
```

**Top bar:** MENU button (mono, secondary), ROUND counter (Faint mono), active player name + token colour indicator, active player cash.

**Board (780×780):**
- `#0D0D14` background
- `1px solid rgba(Gold,0.22)` border
- 11×11 CSS grid. Corner cells: 104×104px. Side cells: equal 1fr.
- Inner centre: subtle gold grid pattern, BOROUGH wordmark at 58px/900 in Gold at low opacity
- Each tile: correct colour group band (full-width strip, 8px tall for horizontal tiles, 8px wide strip for vertical tiles at the appropriate edge). Background: Deep Surface (`#13131F`). Border: `1px solid rgba(Gold,0.14)` between cells.
- Tile content: property name (tiny text, 2–3 lines max), price, colour band. Corner tiles: special treatment (GO, Jail, Free Parking, Go To Jail).
- Ownership indicator: when owned, a player-colour dot or bar appears on the tile. When mortgaged, tile is visually greyed. Buildings shown as small house/hotel icons.
- Player tokens: coloured 10×10px diamonds (rotated squares) on the correct tile. Stack gracefully if multiple tokens share a space.

**Player panels (right column):** One compact card per non-active player. Each shows: player colour swatch, name, cash (IBM Plex Mono tabular), property count. Active player is visually emphasised (larger or in the top bar instead).

**Action panel (left):** Context-sensitive. See "Action States" section below.

**Activity log:** Scrolling list of recent game events. Each entry: coloured diamond bullet in player colour, mono text, timestamp or round indicator.

**Dice area:** Two dice displayed at all times. See "Dice States" below.

---

### Board Action States

The left action panel changes based on game phase. Wire each state to the relevant engine output.

#### State: ROLL REQUIRED
```
[ PLAYER NAME ]  $CASH
YOUR TURN

[ ROLL DICE ]

Actions available before rolling:
  [ VIEW PORTFOLIO ]
  [ PROPOSE TRADE ]
```

#### State: PROPERTY PURCHASE — UNOWNED STREET
```
[ COLOUR GROUP LABEL ]
PROPERTY NAME

PRICE  $NNN
HOUSE COST · $NN   MORTGAGE · $NN

RENT SCHEDULE
  Base         $N
  1 House      $N
  2 Houses     $N
  3 Houses     $N
  4 Houses     $N
  Hotel        $N

YOUR CASH  $NNN

[ BUY FOR $NNN ]   [ PASS ]
```
Colour band runs full width at top (group colour, 8px). Property name at 44px/700.

#### State: RENT PAYMENT
```
RENT DUE

PROPERTY NAME
Owned by PLAYER NAME

[ Applicable rent level highlighted in schedule ]

YOU PAY   $NNN

[ CONFIRM PAYMENT ]
```
Active rent row highlighted in Gold.

#### State: TAX
```
INCOME TAX

$100 to the Bank.

[ PAY $100 ]
```

#### State: GO TO JAIL
```
GO TO JAIL

Move directly to Jail.
Do not pass GO.

[ CONTINUE ]
```

#### State: FREE PARKING
```
FREE PARKING

Nothing happens.

[ END TURN ]
```

#### State: STRATEGIC ACTIONS (between roll and end turn, or during another player's turn)
Show the current player's options:
- BUILD — only if they own a complete colour group with buildable properties
- SELL BUILDINGS — only if they have houses or hotels
- MORTGAGE — only if they have unmortgageable properties
- UNMORTGAGE — only if they have mortgaged properties
- PROPOSE TRADE — always available unless game is resolving
- VIEW PORTFOLIO — always available
- END TURN

---

### Screen 6 — Jail Panel

Shown when the active player is in jail (replaces normal action panel).

```
IN JAIL

[ PLAYER NAME ]

Options:

[ ROLL FOR DOUBLE ]
  A double releases you. 6+6 does not.

[ PAY $50 TO LEAVE ]
  → dimmed + "Insufficient funds · $N" if cash < $50

[ USE GET OUT OF JAIL FREE ]
  → dimmed + "Not in your possession" if card not held
```

States for each option: active (gold border), disabled (faint border, dimmed, explanation in Warning or Faint).

---

### Screen 7 — Dice States (all 6)

The dice are always visible. Render all 6 states correctly:

| State | Visual |
|---|---|
| Idle | Two blank/zero dice, ROLL button below |
| Rolling | Dice blurred and rotated slightly, "Rolling." label |
| Normal Roll | Dice showing result, total in Gold IBM Plex Mono 40px, "Move N spaces." label |
| Normal Double | Dice showing matching values, total shown, "Double. Turn ends after landing." |
| Double Six | Dice showing 6+6, gold border glow, "Double Six." headline, "Roll again." note |
| Double Six In Jail | Same as Double Six + red jail badge: "In Jail. No movement. No escape." |

Dice visual: 72×72px squares, `#13131F` bg, 6px radius, 3×3 pip grid. Active pips filled in Gold or Text Primary; empty pip slots transparent. Glow on 6+6: `box-shadow: 0 0 0 3px rgba(Gold, 0.18)`.

---

### Screen 8 — Purchase Panel (Bottom Sheet Variant)

For property purchases, use a bottom sheet that slides up over the board (board remains visible but dimmed above).

```
[Colour band 8px full width]
COLOUR GROUP LABEL (mono, group colour)
PROPERTY NAME (44px/700)

PRICE  $NNN                      RENT SCHEDULE
HOUSE COST · $NNN                BASE RENT    $N   ←  active row highlighted in Gold
MORTGAGE · $NNN                  1 HOUSE      $N
                                 2 HOUSES     $N
                                 3 HOUSES     $N
                                 4 HOUSES     $N
                                 HOTEL        $N

YOUR CASH  $NNN

[ BUY FOR $NNN ]
[ PASS ]
```

---

### Screen 9 — Card Draw Overlay

When a Chance or Community Chest card is drawn, the board freezes and a full-screen overlay appears.

**Visual:**
- Background: board dimmed behind a translucent dark overlay (`rgba(13,13,20,0.92)`)
- Gold grid visible through overlay
- Card centred at 240×300px, `#1E1E30` bg, gold border
- Card header: "RISK" (for Chance) or "THE CITY" (for Community Chest) in IBM Plex Mono/600/Gold/16em tracking
- Card illustration zone: 110px tall, `#13131F`, stylised artwork area for the card effect (abstract shapes referencing the effect type: bars for jail, concentric circles for money, etc.)
- Card text: effect description in 14px/1.7 line-height, Text Primary
- Below card: player colour badge + name, then effect result (e.g. "+$100" in 40px/600 in Success)
- CONTINUE button (gold primary)

**Card types that need distinct illustration zones:**
- Jail → vertical stripe pattern in Danger
- GO movement → "GO" in Gold
- Money collect → concentric gold circles
- Money pay → downward bar chart
- Move to space → destination name
- Per-building charge → house/hotel icons with amounts

---

### Screen 10 — Money Transfer Notifications

Stacked toast notifications in the upper board area, auto-dismiss after ~3 seconds.

Each notification: `#1E1E30` bg, 8px radius, `border-left: 3px solid [accent]`, padding 16px/20px.

| Event | Amount colour | Accent |
|---|---|---|
| Pass GO | Success | Gold |
| Pay rent | Danger | Danger |
| Receive rent | Success | Success |
| Pay tax | Muted | Faint |
| Low cash warning | Warning | Warning |

Amount: IBM Plex Mono 18px/500 tabular, min-width 80px. Label: 14px Text Primary.

---

### Screen 11 — Property Portfolio

Accessed via "VIEW PORTFOLIO" or by tapping a player panel. Shows the current player's full holdings.

**Layout:** Full-screen overlay or side panel (choose the approach that fits cleanest).

**Grouped by colour:**
Each group section:
- Colour band left-border (4px, group colour)
- Group name (mono caps) + group note ("COMPLETE GROUP" in Success, "INCOMPLETE" in Muted, "N OWNED" for stations/utilities)
- Property rows within the group

**Property rows:**
- Property name (14px/600)
- Building state: house icons (small squares in gold) or hotel icon, or "—" if unimproved
- Status tag: "MORTGAGED" in Warning mono if mortgaged
- Action buttons (right): context-sensitive from engine output
  - BUILD (gold border) if buildable
  - SELL (muted) if has buildings
  - MORTGAGE (warning) if eligible
  - UNMORTGAGE (muted) if mortgaged

---

### Screen 12 — Build / Sell Interface

Triggered from portfolio or strategic action panel when the player selects BUILD or SELL.

Shows all properties in the selected colour group:

```
COLOUR GROUP NAME

PROPERTY 1   🏠 🏠   [ - SELL ]  [ + BUILD ]
PROPERTY 2   🏠       [ - SELL ]  [ + BUILD ]
PROPERTY 3   —                    [ + BUILD ]

HOUSE COST: $NNN

TOTAL COST THIS SESSION: $NNN
YOUR CASH: $NNN  →  AFTER: $NNN

[ CONFIRM ]   [ CANCEL ]
```

- Houses shown as small gold squares; hotel as a wider rectangle
- BUILD button: gold border; disabled (faint) if at max or insufficient funds
- SELL button: muted border; disabled if no buildings
- Running total of cash impact shown before confirmation
- CONFIRM applies all changes atomically

---

### Screen 13 — Trade Interface

Full-screen or large overlay. Two-column negotiation layout.

```
TRADE

YOU OFFER                         PLAYER NAME GIVES
┌─────────────────────────┐      ┌─────────────────────────┐
│  Properties              │      │  Properties              │
│  [ eligible prop cards ] │      │  [ eligible prop cards ] │
│                          │      │                          │
│  Cash: [ ______ ] $      │      │  Cash: [ ______ ] $      │
│                          │      │                          │
│  GOOJF Card  [ + add ]   │      │  GOOJF Card  [ + add ]   │
└─────────────────────────┘      └─────────────────────────┘

                    [ PROPOSE TRADE ]
```

**Property cards in trade builder:**
- Eligible: clickable, gold border on selection, tick when selected
- Ineligible (mortgaged, has buildings): greyed out, not selectable, tooltip on hover: "Cannot trade — [reason]"

**Responding player view (when a trade is proposed):**
Same layout but read-only, showing what is being offered vs requested. Two large buttons: ACCEPT (gold) and DECLINE (danger outline).

**After acceptance:**
Brief animation — properties "move" between the two sides, then interface closes.

---

### Screen 14 — Bankruptcy Flow (3 Steps)

#### Step 1 — Payment Required

```
[Danger border card]
STEP 1
PAYMENT REQUIRED

You owe $850 to PLAYER NAME

YOUR CASH    $120
SHORTFALL    $730   ← large, Danger colour

[ SELL BUILDINGS ]    [ MORTGAGE PROPERTIES ]
```

#### Step 2 — Asset Management

Full list of the player's assets with liquidation options. Each property row:
- Name + detail (e.g. "2 HOUSES" or "UNIMPROVED")
- Action button: "SELL FOR $NNN" (gold border), "MORTGAGE FOR $NNN" (Warning border), or "NO VALUE" (Faint, disabled) if already mortgaged

Running footer: "RAISED $NNN · STILL OWED $NNN" — updates live as player takes actions. If still short: "CANNOT MEET PAYMENT" in Danger badge.

#### Step 3 — Eliminated

Full-screen takeover:
```
[Dark overlay with red border]
STEP 3
ELIMINATED   ← 64px/900 in Danger

PLAYER NAME · PLAYER N

$850 owed. Assets insufficient.
Properties return to the Bank.

[greyed-out mini property cards showing what goes back]

[ CONTINUE ]   ← resumes game for remaining players
```

---

### Screen 15 — Victory Screen

Full-screen. Strong celebratory treatment.

```
VICTORY

PLAYER NAME WINS

$N,NNN NET WORTH
LAST PLAYER STANDING

[Eliminated players listed in order with round numbers]
  PLAYER 2 · Eliminated Round 12
  PLAYER 3 · Eliminated Round 8
  PLAYER 4 · Eliminated Round 15

[ PLAY AGAIN ]     [ MAIN MENU ]
```

Visual: dark background, winner's player colour as a dominant accent, large type. The word VICTORY in the display style.

---

### Screen 16 — Game Menu (In-Game Overlay)

Accessible at any point via the MENU button.

```
MENU

RESUME
RULES
SETTINGS
RESTART GAME     ← Warning colour
QUIT TO MAIN MENU  ← Danger colour
```

RESTART GAME must trigger a confirmation modal before executing (irreversible). QUIT TO MAIN MENU also requires confirmation.

---

### Screen 17 — How to Play

Simple scrollable rules reference. Eight sections, each with a title and body paragraph. Content from the game rules — paraphrase for the interface. Accessible from main menu and in-game menu.

---

### Screen 18 — Settings

Three sections with toggles and selectors:

**SOUND** (not yet implemented — controls should be present but labelled "Coming soon" or disabled)
- Music volume
- Effects volume

**GAMEPLAY**
- Animation speed: SLOW / NORMAL / FAST (segmented control)
- Show rent calculations: toggle (on by default — shows rent breakdown before confirming payment)
- Confirm before buying: toggle (off by default — adds a confirmation step on purchase)

**DISPLAY**
- (Reserved for future options)

---

## Component Library

Build each of these as a reusable React component. They must be consistent across all screens.

| Component | Notes |
|---|---|
| `Button` | Props: variant (primary \| secondary \| destructive \| ghost), size, label, disabled, onClick |
| `PropertyTile` | Board space tile — shows name, colour band, ownership indicator, buildings, tokens |
| `PlayerPanel` | Compact player card for right column — name, colour, cash, property count |
| `DiceDisplay` | Two dice, supports all 6 states |
| `ActionPanel` | Left panel container — renders the correct sub-panel based on game phase |
| `CardOverlay` | Full-screen card draw overlay with card, effect, player indicator, continue button |
| `TradeInterface` | Two-column trade builder with property card grid and cash input |
| `PortfolioPanel` | Full player portfolio grouped by colour with action buttons |
| `BuildInterface` | Build/sell for a colour group with running total |
| `BankruptcyFlow` | 3-step bankruptcy panel (steps are separate sub-components) |
| `VictoryScreen` | Full victory overlay |
| `Notification` | Toast notification with amount and label, auto-dismiss |
| `Modal` | Generic confirmation modal with title, body, confirm + cancel buttons |
| `MonoBadge` | IBM Plex Mono small label with colour variants |
| `ColourBand` | Horizontal or vertical colour strip for property group identity |

---

## Sound Architecture

Sound is not implemented in this milestone but hooks must be present. Create an `AudioManager` module (or equivalent) with a single `emit(event: AudioEvent)` method. Call it at every relevant game moment. Use a no-op implementation now; real audio is added in Milestone 5.

```typescript
type AudioEvent =
  | 'dice_roll'
  | 'token_move_step'
  | 'property_purchase'
  | 'rent_payment'
  | 'house_placed'
  | 'hotel_upgrade'
  | 'card_drawn'
  | 'sent_to_jail'
  | 'bankruptcy'
  | 'victory';
```

---

## Accessibility

- All ownership states use text/icon reinforcement — never colour alone
- Irreversible actions (restart, quit, bankruptcy confirm) always have a confirmation modal
- Disabled buttons must have tooltips explaining why (e.g. "Cannot trade — property is mortgaged")
- Keyboard navigation: at minimum, modal close on Escape, ROLL on Space when roll is the active action
- All money values: `font-variant-numeric: tabular-nums`
- No horizontal scroll on the main game screen

---

## Milestone Completion Criteria

This milestone is complete when:

1. All 18 screens/states above are implemented and visually match the design system.
2. The full design system (colours, typography, spacing) is applied consistently.
3. Every component in the component library exists and is reused across screens.
4. The game is fully playable in the browser from start to a declared winner using the new UI.
5. The rules engine is untouched — no game logic added or moved to the UI layer.
6. Sound hook architecture is in place (no-op).
7. Confirmation modals gate all irreversible actions.
8. Notifications appear and auto-dismiss for money transfers.
9. The board correctly renders all 40 spaces with colour groups, ownership states, and buildings.
10. Accessibility requirements above are met.

Animations and visual polish are **Milestone 5** — transitions, motion, and micro-interactions are not required here. Build static correctness first.
