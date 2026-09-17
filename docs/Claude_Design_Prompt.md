# Claude Design Prompt — BOROUGH
## First Design Session: Visual Foundation & Key Screens

---

## What You Are Designing

**BOROUGH** is a dark, premium, local-multiplayer property strategy game for 2–4 players on desktop. It is set in a heightened, cinematic version of modern London — where real streets (Mayfair, Park Lane, Trafalgar Square, Food Street) become the territories of a high-stakes property empire.

This is not a Monopoly reskin. It is an original game with its own name, identity, and world. The rules share a numerical foundation with classic UK Monopoly, but the game's presentation, branding, and visual language are entirely original.

Your job in this session is to establish the **complete visual foundation** that every future screen will be built from. This means producing five deliverables — not full screens, but the precise, production-ready building blocks that define the game's look and feel.

---

## The Three Creative Words

Every decision you make should pass this test:

> **Precise. Powerful. Premium.**

If a choice feels decorative, casual, or generic — remove it.

---

## The World

BOROUGH is **boardroom London after dark**. Think:

- Glass towers reflecting on wet streets at midnight
- A private members' club where deals are made in low light
- A financial district where fortunes are built and lost in silence
- Old money and new ambition sharing the same postcode

The player is not a casual property buyer. They are a **magnate**. Every decision they make is a power move.

The emotional arc of the game:
- **Early:** The city is open. Everything is for sale.
- **Mid:** The board fills. Alliances form. Trades get serious.
- **Late:** Cash tightens. Rents spike. One wrong move ends you.
- **End:** One player claims the city. Everyone else is gone.

---

## Colour System

Use these exact values. Do not substitute.

### Base Surfaces

| Name | Hex | Role |
|---|---|---|
| Obsidian | `#0D0D14` | Primary background |
| Void | `#13131F` | Secondary background |
| Slate | `#1E1E30` | Panel / card surfaces |
| Steel | `#2A2A40` | Elevated surfaces — modals, overlays |

### Accent

| Name | Hex | Role |
|---|---|---|
| Gold | `#C9A84C` | Primary accent — use sparingly |
| Gold Light | `#E8C96A` | Hover / active states |
| Gold Dim | `#8A6F2E` | Borders, inactive gold |

### Text

| Name | Hex | Role |
|---|---|---|
| Ivory | `#F0EDE4` | Primary text |
| Stone | `#A09A8A` | Secondary / supporting text |
| Ash | `#5A5568` | Captions, metadata |

### Functional

| Name | Hex | Role |
|---|---|---|
| Success | `#4CAF7A` | Money received, positive outcome |
| Warning | `#E8A838` | Low cash, caution |
| Danger | `#E84545` | Rent due, bankruptcy, elimination |

### Player Colours

| Player | Name | Hex |
|---|---|---|
| 1 | Crimson | `#E84560` |
| 2 | Cobalt | `#4A7FE8` |
| 3 | Jade | `#4AC48A` |
| 4 | Amber | `#E8A838` |

### Property Group Colours

| Group | Hex |
|---|---|
| Brown | `#8B4513` |
| Light Blue | `#6BB8D4` |
| Pink | `#E8659A` |
| Orange | `#E87E30` |
| Red | `#E83030` |
| Yellow | `#E8C030` |
| Green | `#30A855` |
| Dark Blue | `#1A4FBF` |

---

## Typography

Two typefaces only. No others.

### Display & Headings
A **geometric sans-serif** — architectural, precise, authoritative. Use Google Fonts: **'Barlow'** (weights: 400, 600, 700, 900) or **'DM Sans'** (weights: 400, 500, 700).

Character: Wide, clean, confident. Strong at large sizes. Feels like it belongs on the side of a building or the cover of an annual report.

### Body & Numerics
A **monospaced face** — technical, financial, precise. Use Google Fonts: **'DM Mono'** (weights: 300, 400, 500) or **'IBM Plex Mono'** (weights: 300, 400, 600).

Character: Tabular numerals for perfect cash alignment. Feels like a financial terminal or an architectural specification sheet.

### Type Scale

| Role | Size | Weight | Typeface | Notes |
|---|---|---|---|---|
| Game Title | 64px | 900 | Geometric sans | Letter-spacing: +0.08em |
| Screen Title | 32px | 700 | Geometric sans | Letter-spacing: +0.04em |
| Section Heading | 20px | 600 | Geometric sans | Letter-spacing: +0.04em |
| Panel Heading | 15px | 600 | Geometric sans | Letter-spacing: +0.06em |
| Body | 14px | 400 | Geometric sans | Line-height: 1.65 |
| Caption / Label | 11px | 500 | Monospaced | Letter-spacing: +0.08em |
| Currency Display | 36px | 700 | Monospaced | Tabular numerals |
| Dice / Count | 56px | 900 | Geometric sans | Centered |
| Card Instruction | 15px | 400 | Geometric sans | Line-height: 1.7 |

---

## Design Rules

Apply these without exception:

1. **No pure black or white.** Use `#0D0D14` and `#F0EDE4` instead.
2. **Gold is rare.** It appears on borders, accent lines, key data, and active states — not as background fills.
3. **Surface hierarchy is created by lightness steps**, not shadows. Obsidian → Void → Slate → Steel, each step slightly lighter.
4. **Borders use gold at low opacity** — `#C9A84C` at 15–25% — to define edges without competing for attention.
5. **Ownership is never communicated by colour alone** — always pair colour with an icon or label.
6. **Type is never pure white** — always `#F0EDE4` (Ivory) or below.
7. **Spacing uses an 8px base grid** — all margins, padding, and gaps are multiples of 8.
8. **Corner radius:** 4px for tiles and small elements, 8px for cards and panels, 0px for the board itself.
9. **Animations communicate state** — only animate things that change meaning. No decorative motion.
10. **Copy is terse and confident** — no "Please", no "Oops!", no exclamation marks.

---

## What To Build — Five Deliverables

Produce each deliverable as a **complete, self-contained HTML/CSS component** on a dark (`#0D0D14`) background. They do not need to connect to each other in this session — this is a design language audit, not a full game build.

---

### DELIVERABLE 1 — Design System Reference Panel

A single scrollable reference panel showing the complete design system at a glance. Include:

**Colour swatches** — all palette tokens, labelled with name and hex, grouped by role (Surfaces / Accent / Text / Functional / Player / Property Groups).

**Typography specimens** — one line at each scale level, showing the typeface, size, weight, and a sample of real game copy at that scale. Examples:
- Display: `BOROUGH`
- Screen Title: `Your Properties`
- Currency: `$1,500`
- Caption: `FOOD STREET · ORANGE`
- Dice: `12`

**Spacing guide** — a visual ruler showing the 8px grid in multiples: 8 / 16 / 24 / 32 / 48 / 64.

**Corner radius guide** — showing 4px / 8px / 0px on identical rectangles with labels.

**UI component primitives:**
- Primary button (gold border, dark fill, ivory text)
- Secondary button (slate fill, stone text)
- Destructive button (danger red border)
- A small label/tag (e.g. `MORTGAGED`, `JAILED`, `YOUR TURN`)
- A tooltip example
- A notification/toast: `+$200 · Passed GO`

Layout: Left-aligned, two-column grid. Section headers in gold. This panel will be used as the reference for all future design work.

---

### DELIVERABLE 2 — Board Tile Set (Orange Group)

Design the complete set of **board tiles for the Orange property group** — the three Orange properties plus two adjacent special spaces — as they would appear on the board.

The Orange group is:
- **Bow Street** — $180, House cost $100
- **Marlborough Street** — $180, House cost $100
- **Food Street** — $200, House cost $100

Special spaces to include alongside:
- **Free Parking** corner tile
- **Go To Jail** directional tile

For each **property tile**, show four states:
1. **Unowned** — neutral, available
2. **Owned (no buildings)** — Player 1 (Crimson) owns it, 0 buildings, 2× rent applies
3. **Owned (3 houses)** — Player 1 owns it, 3 house icons visible
4. **Mortgaged** — desaturated, mortgage indicator visible

Each tile should contain:
- Colour band (top strip in Orange `#E87E30`)
- Property name — Ivory, geometric sans, tracked caps
- Price — Gold, monospaced
- Building indicators when applicable
- Ownership indicator (player colour border glow or fill)
- Mortgage state when applicable

Tile dimensions: approximately 80px wide × 120px tall (portrait orientation, as they appear on the board's edges).

Show all states in a grid layout with state labels beneath each tile.

---

### DELIVERABLE 3 — Player Panel (HUD)

Design the **player information panel** as it would appear during active gameplay. This is the persistent HUD element showing each player's state.

Design **all four player panels** in a row — as they would appear below or beside the board.

Each panel shows:
- Player name (e.g. `SARAH`, `JAMES`)
- Player token icon (use a simple placeholder geometric shape in the player's colour)
- Current cash — large, monospaced, gold: `$1,500`
- Property count: `6 properties`
- Status indicator — one of: `YOUR TURN` / `WAITING` / `IN JAIL` / `BANKRUPT`

Show two scenarios:

**Scenario A — Early game, all players active:**
- Player 1 (Crimson): $1,240 · 4 properties · `YOUR TURN`
- Player 2 (Cobalt): $1,500 · 2 properties · `WAITING`
- Player 3 (Jade): $960 · 5 properties · `WAITING`
- Player 4 (Amber): $1,100 · 3 properties · `WAITING`

**Scenario B — Late game stress:**
- Player 1 (Crimson): $4,820 · 14 properties · `YOUR TURN`
- Player 2 (Cobalt): $180 · 3 properties · `WAITING` (low cash — show warning colour)
- Player 3 (Jade): eliminated — show `BANKRUPT` state
- Player 4 (Amber): $0 · `IN JAIL`

The active player (`YOUR TURN`) should receive a clear visual emphasis — brighter, or with a gold accent — without being garish.

---

### DELIVERABLE 4 — Property Inspection Card

Design the **full property inspection card** — the panel a player sees when they tap a property tile on the board or open it from their portfolio.

Use **Food Street** as the subject.

**Food Street — Orange Group**

| Field | Value |
|---|---|
| Purchase Price | $200 |
| Mortgage Value | $100 |
| House Cost | $100 |
| Base Rent | $16 |
| 1 House | $80 |
| 2 Houses | $220 |
| 3 Houses | $600 |
| 4 Houses | $800 |
| Hotel | $1,000 |

The card should feel like a **luxury real estate listing** — editorial, photographic in feel, aspirational. Use an abstract architectural composition (deep orange-toned gradient, geometric shapes, or a bold typographic treatment) in the hero image zone — no literal photography needed, but the zone should feel like it could hold a stunning architectural image.

Show the card in **two ownership states:**

**State A — Unowned:**
- Hero image zone (orange-toned)
- Property name: `FOOD STREET`
- Group: `ORANGE`
- Full rent table
- Two action buttons: `BUY FOR $200` (primary) and `PASS` (secondary)

**State B — Owned by Player 2 (Cobalt):**
- Same layout
- Owner indicator: `PLAYER 2 · COBALT` with Player 2's colour accent
- Current buildings: 2 houses shown
- Current rent: `$220` highlighted (the active rent at 2 houses)
- No buy/pass buttons — replace with `CLOSE`

Card dimensions: approximately 320px wide × 520px tall (portrait, modal/panel style).

---

### DELIVERABLE 5 — RISK Card (Chance Equivalent)

Design **three RISK cards** — the game's original replacement for Chance cards.

RISK is the card deck name. The card back and front should feel like **editorial inserts from a premium financial or city magazine** — bold, minimal copy, high visual impact.

**Card Back (same for all RISK cards):**
- Dark obsidian base (`#0D0D14`)
- Gold geometric lattice pattern — angular, precise
- `RISK` in large tracked gold type — centred
- Hairline gold border

**Card Fronts — three different cards:**

**RISK Card 1 — Movement**
> Advance to Trafalgar Square.
> If you pass GO, collect $200.

**RISK Card 2 — Payment**
> Bank pays you dividend.
> Collect $50.

**RISK Card 3 — Jail**
> Go directly to Jail.
> Do not pass GO.
> Do not collect $200.

Each front card should include:
- `RISK` label — top left, small, gold, tracked
- A bold visual zone — a dramatic typographic treatment, abstract geometric art, or a strong compositional element in a dark palette with gold accents. Each card should feel **distinct** from the others.
- The card instruction — clean, readable, Ivory, generous line height
- A hairline gold border around the entire card

Card dimensions: approximately 240px wide × 360px tall (portrait, physical card proportions).

Show all three fronts and one back in a grid, slightly rotated as if physically laid out on a table.

---

## Layout Instructions

Present all five deliverables **on a single scrollable dark page** (`#0D0D14` background).

At the top of the page, display:
- The game name: **BOROUGH** — large, geometric sans, 900 weight, gold
- A single subtitle line: `Visual Design Foundation · Version 1.0` — monospaced, Stone colour, small

Between each deliverable, use a **section header** in gold — left-aligned, with a hairline gold rule extending to the right edge.

Do not add any other chrome, navigation, or UI around these deliverables. The page exists purely to display and evaluate the design language.

---

## What To Avoid

| ❌ Do Not | Why |
|---|---|
| Use bright white (`#FFFFFF`) anywhere | Blows out the premium dark surface |
| Use gradients as decoration | Reserve gradients for purposeful depth only |
| Add drop shadows under cards | Use surface-step elevation instead |
| Round every corner equally | Tiles are sharper (4px), cards are softer (8px), the board is 0px |
| Use gold as a background colour | Gold is an accent — used for text, borders, details |
| Add emojis or playful iconography | Wrong tone entirely |
| Write copy in title case for everything | Sentence case for instructions, tracked caps for labels only |
| Reproduce Monopoly visual elements | Everything is original |
| Use orange as the primary accent colour | Gold is the accent — orange appears only in the Orange property group |
| Make the dice look like children's game dice | Architectural, minimal, premium |

---

## Tone Reminder

The game speaks like this:

| Moment | Copy |
|---|---|
| Property bought | `Food Street. Acquired.` |
| Rent charged | `Rent due. $220 to Player 2.` |
| 6+6 rolled | `Double Six. Roll again.` |
| Sent to jail | `Sent to Jail.` |
| Player eliminated | `Player 3. Eliminated.` |
| Victory | `Player 1. Last standing.` |

Short. Precise. No softening. No filler.

---

## Success Criteria

When this design session is complete, you should be able to answer **yes** to all of the following:

- [ ] Does the design look **nothing** like Monopoly?
- [ ] Does the palette feel **dark, premium, and London**?
- [ ] Would this design work in a **luxury real estate or financial context** as comfortably as a game?
- [ ] Is the gold accent used **sparingly enough** to retain its power?
- [ ] Is every piece of copy **terse, confident, and clear**?
- [ ] Does each property tile **communicate ownership, buildings, and mortgage state** without relying on colour alone?
- [ ] Do the RISK cards feel **editorial and premium** — not cartoon game cards?
- [ ] Does the player panel make it **immediately obvious** whose turn it is and what their financial state is?
- [ ] Is the typography **architectural and precise** — never casual or warm?
- [ ] Does the whole page feel like it belongs to **one cohesive system**?

If any answer is no — revise before delivering.

---

*This prompt is the foundation for all BOROUGH visual design. All subsequent Claude Design sessions should reference this output as the canonical visual language.*
