# Claude Design Patch Prompt — BOROUGH
## Session 2 Gap Fill · 3 Missing Pieces

---

## Context

Sessions 1 and 2 of BOROUGH's visual design are complete. This is a **targeted patch session** to fill three specific gaps identified in the Session 2 audit. Do not redesign anything that already exists. Match the established visual language exactly.

---

## Canonical Design System (Apply Without Exception)

### Surfaces
| Token | Hex |
|---|---|
| Obsidian | `#0D0D14` |
| Void | `#13131F` |
| Slate | `#1E1E30` |
| Steel | `#2A2A40` |

### Accent
| Token | Hex |
|---|---|
| Gold | `#C9A84C` |
| Gold Light | `#E8C96A` |
| Gold Dim | `#8A6F2E` |

### Text
| Token | Hex |
|---|---|
| Ivory | `#F0EDE4` |
| Stone | `#A09A8A` |
| Ash | `#5A5568` |

### Functional
| Token | Hex |
|---|---|
| Success | `#4CAF7A` |
| Warning | `#E8A838` |
| Danger | `#E84545` |

### Player Colours
| Player | Hex |
|---|---|
| Crimson (P1) | `#E84560` |
| Cobalt (P2) | `#4A7FE8` |
| Jade (P3) | `#4AC48A` |
| Amber (P4) | `#E8A838` |

### Typography
- **Headings:** Barlow or DM Sans — geometric sans, weights 400/600/700/900
- **Numerics/Labels:** IBM Plex Mono — monospaced, tabular numerals
- **8px spacing grid** · Corner radius: 4px tiles · 8px cards/panels · 0px board

---

## GAP 1 — Late Game HUD Stress Scenario

### What's Missing
Session 2 showed the player HUD panels in a mid-game state. The prompt required a **second explicit scenario** showing the HUD under late-game stress — low cash, jail, and an eliminated player all visible simultaneously.

### What To Build
Design the **four player HUD panels** in their late-game stress state, as they appear below the board.

**Exact data to show:**

| Player | Name | Cash | Properties | Status | Notes |
|---|---|---|---|---|---|
| Player 1 | SARAH | $4,820 | 14 properties | `YOUR TURN` | Dominant — gold accent, full brightness |
| Player 2 | JAMES | $180 | 3 properties | `WAITING` | Cash shown in Warning amber `#E8A838` — dangerously low |
| Player 3 | PRIYA | — | — | `BANKRUPT` | Eliminated — panel heavily muted, desaturated, `BANKRUPT` in Danger red |
| Player 4 | ALI | $0 | 2 properties | `IN JAIL` | Cash shown as `$0` in Danger red, jail indicator visible |

### Design Requirements

**Player 1 (YOUR TURN):**
- Gold border on the panel
- `YOUR TURN` status badge in gold
- Cash `$4,820` in large gold monospaced
- `14 PROPERTIES` — Ivory
- Token icon in Crimson

**Player 2 (WAITING — low cash):**
- Standard panel surface
- Cash `$180` in Warning amber `#E8A838` — not the normal gold
- A subtle Warning amber left border or indicator to draw the eye
- `3 PROPERTIES`
- No `LOW CASH` text needed — the colour communicates it

**Player 3 (BANKRUPT — eliminated):**
- Panel heavily desaturated — use `#13131F` background
- All text in Ash `#5A5568`
- `BANKRUPT` status badge in Danger red `#E84545`
- No cash shown — or show `—`
- A diagonal line or desaturated overlay signals elimination
- Player name and token still legible but clearly inactive

**Player 4 (IN JAIL — $0):**
- Standard panel surface
- Cash `$0` in Danger red
- `IN JAIL` status badge — red border, red text
- A small jail bar icon or indicator beside the status
- `2 PROPERTIES`

**Layout:** All four panels in a horizontal row — same layout as Session 2's board HUD. Show as a component at full width, not inside a full viewport mockup. Label this: `LATE GAME · STRESS STATE`

---

## GAP 2 — Game Introduction Screen

### What's Missing
The confirmed setup flow is:

```
Launch → Main Menu → New Game → Player Setup → Token Selection → Game Introduction → Board
```

The **Game Introduction** screen was never designed. This is the transitional moment between setup and the first dice roll — it welcomes players into the game world, establishes the stakes, and hands off to the board.

### What To Build
A **full-screen Game Introduction** at 1440×900px.

### Purpose of This Screen
- Players have been set up. Tokens are chosen. The game is about to begin.
- This screen appears for approximately 3–5 seconds or until the player dismisses it.
- It should feel like the **opening frame of a premium film** — cinematic, atmospheric, brief.
- It is not a tutorial. It is a mood-setter.

### Content

**Background:**
- The board is visible — faded, dark, atmospheric. Use the same board grid from the main game but dimmed to ~20% opacity.
- A dark gradient overlay brings it close to obsidian.

**Centre content:**
- `BOROUGH` — game wordmark, large, gold, 900 weight, same treatment as the main menu
- Below it, a thin gold hairline rule — full width of the content column
- Player roster — list all confirmed players in the game. Show 4 players:

```
SARAH    ◆  THE WATCH     PLAYER 1  ·  CRIMSON
JAMES    ◆  THE YACHT     PLAYER 2  ·  COBALT
PRIYA    ◆  THE RING      PLAYER 3  ·  JADE
ALI      ◆  THE CROWN     PLAYER 4  ·  AMBER
```

Each row shows: player name (Ivory, geometric sans), token name (Stone, monospaced), player number and colour name (in the player's colour, small, tracked). The diamond `◆` separator in gold at low opacity.

- Below the roster, another thin gold hairline rule
- Starting player announcement:

```
SARAH GOES FIRST
```

Large, geometric sans, 700 weight, Ivory. Or if random roll was used:

```
Highest roll. SARAH goes first.
```

Stone, body size, beneath.

- Finally, at the bottom:

```
[ BEGIN ]
```

Primary button — gold border, dark fill, Ivory text. Tracked caps.

**Bottom-right corner:**
- `$1,500 · EACH PLAYER` — monospaced, Ash, small. A quiet reminder of the starting stakes.

### Tone
No welcome message. No "Good luck!" No tutorial text. The screen should feel like the moment before a high-stakes negotiation begins — not the start of a family game night.

---

## GAP 3 — Property Inspection Card (Standalone, Two States)

### What's Missing
Session 1 designed the Food Street inspection card. However it was designed as part of the foundation deliverables and may not fully match the final design language established across Sessions 1 and 2. This patch produces the **definitive, final version** of the property inspection card — the one developers will implement — in both required states.

### What To Build
The **Food Street property inspection card** — as it appears when a player clicks/taps a property tile on the board or opens it from their portfolio.

**Card dimensions:** 320px wide × 520px tall. Portrait orientation. Modal/panel style.

**Food Street data:**
| Field | Value |
|---|---|
| Group | Orange |
| Group colour | `#E87E30` |
| Purchase Price | $200 |
| Mortgage Value | $100 |
| House Cost | $100 |
| Base Rent | $16 |
| 1 House | $80 |
| 2 Houses | $220 |
| 3 Houses | $600 |
| 4 Houses | $800 |
| Hotel | $1,000 |

### State A — Unowned

**Structure top to bottom:**
1. **Colour band** — full-width strip, Orange `#E87E30`, approximately 8px tall at top of card
2. **Hero zone** — abstract architectural composition, approximately 140px tall. Deep orange-toned: a bold geometric arrangement of rectangles and lines in `#E87E30` at varying opacities on a `#13131F` base. Architectural, not decorative. No literal imagery.
3. **Property name:** `FOOD STREET` — geometric sans, 700 weight, Ivory, tracked caps, 22px
4. **Group label:** `ORANGE` — monospaced, `#E87E30`, 11px, tracked
5. **Price:** `$200` — monospaced, Gold, 32px, 600 weight
6. **Divider:** hairline gold rule
7. **Rent table** — all rows:
   - `BASE RENT` · `$16`
   - `1 HOUSE` · `$80`
   - `2 HOUSES` · `$220`
   - `3 HOUSES` · `$600`
   - `4 HOUSES` · `$800`
   - `HOTEL` · `$1,000`
   - Each row: label in Stone monospaced, value in Ivory monospaced, separated by a hairline, 8px vertical padding
8. **House cost note:** `HOUSE COST · $100` — Stone, monospaced, 11px, below rent table
9. **Mortgage note:** `MORTGAGE VALUE · $100` — Stone, monospaced, 11px
10. **Action buttons:**
    - `BUY FOR $200` — primary (gold border, dark fill, Ivory text, full width)
    - `PASS` — secondary (Slate fill, Stone text, full width, smaller)

### State B — Owned by Player 2 (Cobalt), 2 Houses

**Same card structure, with these changes:**

1. Colour band — same Orange strip
2. Hero zone — same architectural composition but with a **Cobalt `#4A7FE8` tint overlay at ~20% opacity** — signalling ownership subtly
3. Property name and group — same
4. **Owner indicator** replaces the price zone:
   - `PLAYER 2 · JAMES` — Cobalt `#4A7FE8`, monospaced, 11px, tracked
   - A small Cobalt colour swatch square beside the name
5. **Building state:** `🏠 🏠` — two house icons (use architectural square outlines, not emoji). Ivory. Below the owner line.
6. **Rent table** — same rows, but **2 HOUSES** row is highlighted:
   - Row background: `rgba(201,168,76,0.08)`
   - Value `$220` in Gold instead of Ivory
   - A small `ACTIVE` label in Gold beside the value or row
   - All other rows remain in standard Stone/Ivory treatment
7. **House cost and mortgage notes** — same, shown in Stone
8. **Action button:**
   - Single button: `CLOSE` — secondary style, full width

### Presentation
Show both states **side by side** — State A on the left, State B on the right — at full card size. Label each with `UNOWNED` and `OWNED · PLAYER 2 · 2 HOUSES` in Ash monospaced above each card.

---

## Layout of This Patch Session

Present all three gap deliverables on a **single dark page** (`#0D0D14`), using the same gold section dividers as Sessions 1 and 2.

**Page header:**
```
BOROUGH · UI Design · Session 2 Patch · Gap Fill
```

**Section headers:**
- `GAP 1 · LATE GAME HUD — STRESS STATE`
- `GAP 2 · GAME INTRODUCTION SCREEN`
- `GAP 3 · PROPERTY INSPECTION CARD — DEFINITIVE VERSION`

No other chrome. No navigation. Pure design output.

---

## Non-Negotiables

1. Every value exactly matches the canonical design system above
2. No new colours, typefaces, or spacing units introduced
3. Copy remains terse — no softening language, no exclamation marks
4. The Game Introduction screen must feel cinematic and atmospheric — not welcoming or playful
5. The Player 3 BANKRUPT panel must feel visually dead — clearly eliminated at a glance
6. The Property Inspection Card State B must make it instantly obvious who owns it and what the current rent is

---

## Success Criteria

- [ ] Does the late game HUD communicate **four distinct player states** (dominant, struggling, eliminated, jailed) at a single glance?
- [ ] Does the Game Introduction screen feel like the **opening of a premium film** — not a game tutorial?
- [ ] Is the starting player (`SARAH GOES FIRST`) **the most prominent piece of information** on the Game Introduction screen after the BOROUGH wordmark?
- [ ] Does the Property Inspection Card State B make the **active rent ($220)** immediately identifiable without reading the whole table?
- [ ] Does the **BANKRUPT** panel look visually dead — not just labelled, but truly inactive in appearance?
- [ ] Does everything on this page feel like it was **designed in the same session** as Sessions 1 and 2 — seamlessly consistent?

---

*This patch completes the BOROUGH visual design. Combined with Sessions 1 and 2, this constitutes the full design handoff to Claude Code.*
