# Claude Design Prompt — BOROUGH
## Second Design Session: All Remaining Screens & UI

---

## Context

This is the **second and final Claude Design session** for BOROUGH. The first session established the visual foundation:

✅ Design system (colours, typography, spacing, components)
✅ Board tile set — Orange group, 4 states per tile
✅ Player HUD panels — early and late game scenarios
✅ Property inspection card — Food Street, 2 states
✅ RISK cards — 3 fronts + 1 back

**Everything in this session builds directly on that foundation.** Do not reinvent or deviate from the established design language. Every colour, typeface, spacing unit, corner radius, and copy tone from Session 1 applies here without exception.

---

## The Design System (Canonical Reference)

Apply these values throughout every deliverable in this session.

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

### Typography
- **Headings / Display:** Barlow or DM Sans — geometric sans, weights 400/600/700/900
- **Body / Numerics:** DM Mono or IBM Plex Mono — monospaced, tabular numerals
- **8px spacing grid** throughout
- **Corner radius:** 4px tiles · 8px cards/panels · 0px board

### Copy Tone
Terse. Precise. Confident. No exclamation marks. No filler words.

---

## What Was NOT Covered in Session 1

This session must produce designs for every remaining screen and UI state:

1. Main Menu
2. Player Setup Screen
3. Token Selection
4. Game Introduction / First Turn Screen
5. Full Game Board (complete board layout)
6. THE CITY Card (Community Chest equivalent)
7. All Remaining Board Tile Groups (7 remaining colour groups + stations + utilities + all special spaces)
8. Dice Component — all states
9. Purchase Panel (unowned property landing)
10. Rent Due Panel (owned property landing)
11. Building Interface
12. Hotel Upgrade Panel
13. Mortgage / Unmortgage Panel
14. Trade Interface
15. Jail Panel
16. Card Draw Overlay (RISK + THE CITY)
17. Money Transfer Feedback
18. Bankruptcy Flow
19. Player Portfolio Screen
20. Game Menu (in-game pause)
21. Victory Screen
22. How to Play Screen

---

## Deliverable Instructions

Present all deliverables on a **single scrollable dark page** (`#0D0D14`). Use gold section dividers with a hairline rule between each deliverable, labelled clearly. The page does not need to simulate a running game — it is a complete UI specification for developers.

---

### DELIVERABLE 1 — Main Menu

The first screen a player sees when launching BOROUGH. This must immediately communicate the game's premium dark identity.

**Layout:** Full-screen. Board-width centred column.

**Content:**
- Game logo / wordmark: `BOROUGH` — large, geometric sans, 900 weight, gold. This is the game's primary brand moment. Give it space and presence.
- Tagline beneath: `Own the city. Outlast everyone.` — monospaced, Stone, small, tracked
- Four menu items stacked vertically with generous spacing:
  - `New Game` — primary (gold border, dark fill)
  - `How to Play` — secondary
  - `Settings` — secondary
  - `Quit` — tertiary / muted

**Visual treatment:**
- The background should feel like a **night view over London** — not a literal photo, but a dark abstract architectural composition. Geometric building silhouettes, grid lines, or a city-grid pattern in very low opacity gold on obsidian. Subtle. The menu sits in front of it, not on top of noise.
- No hero image. No illustration. Typography and texture carry this screen.
- Version number bottom-right: `v1.0` — Ash, caption size

Show the full screen at 1440×900px viewport.

---

### DELIVERABLE 2 — Player Setup Screen

Where 2–4 players configure themselves before the game begins.

**Header:** `New Game` — Screen title
**Subheader:** `2 to 4 players. Add players to begin.` — Stone, body size

**Layout:** A row of player cards — up to 4. Show the screen with **3 players configured and 1 slot empty.**

**Each configured player card shows:**
- Player number label: `PLAYER 1`, `PLAYER 2`, etc. — small, tracked, in the player's colour
- Token preview — a placeholder circle/shape in the player's colour (tokens chosen in next step)
- Name input field — showing example names: `SARAH`, `JAMES`, `PRIYA`
- Player colour swatch — small indicator
- `READY ✓` status

**The empty 4th slot:**
- Muted, dashed border
- `+ Add Player` — Stone text, centred
- Clearly optional

**Bottom action bar:**
- `Start Game` — primary button, active (all 3 ready)
- `Back` — secondary

Show the screen at 1440×900px.

---

### DELIVERABLE 3 — Token Selection

After player setup, each player chooses their token. This screen appears once per player in sequence (e.g. "Player 1, choose your token").

**Header:** `PLAYER 1 · Choose your token` — Player 1's colour (Crimson) for the player reference

**Token grid:** 8 tokens displayed in a 4×2 grid. Each token is:
- A distinct luxury lifestyle object rendered as a clean isometric or flat icon in Ivory
- Token name beneath: `THE KEY`, `THE WATCH`, `THE PENTHOUSE`, `THE YACHT`, `THE BRIEFCASE`, `THE RING`, `THE CAR`, `THE CROWN`
- Unselected state: dark tile, Ash border, Ivory icon
- Selected state: player colour border glow, icon fills with player colour, name turns Ivory
- Unavailable state (already taken by another player): heavily muted, `TAKEN` label

Show the screen with `THE WATCH` selected by Player 1 (Crimson). Show `THE KEY` as already taken (greyed).

**Bottom:** `Confirm` — primary button

Show at 1440×900px.

---

### DELIVERABLE 4 — Full Game Board

The complete BOROUGH game board — the most complex and critical deliverable in this session.

**Board dimensions:** Square. Fills the majority of the viewport. Show it at approximately 700×700px within a 1440×900px viewport, with player panels visible below.

**Board structure:** Classic 11×11 grid. 9 tiles per edge, 4 corner tiles.

**All 40 spaces must appear on the board:**

**Bottom edge (left to right):**
GO · Old Kent Road · Community Chest · Whitechapel Road · Income Tax · King's Cross Station · The Angel Islington · RISK · Euston Road · Pentonville Road · JAIL/JUST VISITING

**Left edge (bottom to top):**
Pall Mall · Electric Company · Whitehall · Northumberland Avenue · Marylebone Station · Bow Street · THE CITY · Marlborough Street · Food Street · RISK

**Top edge (right to left):**
FREE PARKING · Strand · RISK · Fleet Street · Trafalgar Square · Fenchurch St Station · Leicester Square · Coventry Street · Water Works · Piccadilly · GO TO JAIL

**Right edge (top to bottom):**
Regent Street · THE CITY · Oxford Street · Bond Street · Liverpool St Station · RISK · Park Lane · Super Tax · Mayfair

**Board visual requirements:**
- Board background: `#0D0D14` — not a green felt look, not a bright game board
- Each property tile shows its colour band (the group's colour as a strip on the outer edge of the tile)
- Property name on each tile — small, Ivory, legible
- Price on each tile — Gold, monospaced, smaller
- Corner tiles (GO, Jail, Free Parking, Go To Jail) are larger and have distinct treatment
- Station tiles: a minimal train/transport icon
- Utility tiles: lightning bolt (Electric Company), water drop (Water Works)
- RISK spaces: the RISK card mark — distinct and recognisable
- THE CITY spaces: a different mark — clearly distinct from RISK
- Tax spaces: the amount prominently displayed

**Show the board mid-game:**
- Several properties owned: assign at least 2–3 full colour groups to different players, shown with their player colour border/glow on the tiles
- Player tokens on the board: 4 tokens at various positions (use simple geometric shapes as placeholders — circles in player colours with a small icon)
- A few properties with buildings: show 2–3 houses on one property, a hotel on another

**Board atmosphere:**
- The board should look like a premium city map — dark, architectural, precise
- Owned properties should glow subtly in their owner's colour
- The board is immediately readable — who owns what, where the players are, what's been built

Show the full viewport (1440×900px) with the board centred and all 4 player panels visible below it.

---

### DELIVERABLE 5 — All Remaining Board Tile Groups

Session 1 designed the Orange group tiles. Design the remaining 7 colour groups plus stations and utilities, following the exact same tile structure.

Show each group as a horizontal row of tiles in their unowned state. Label each row with the group name.

**Brown Group:**
- Old Kent Road — $60
- Whitechapel Road — $60

**Light Blue Group:**
- The Angel, Islington — $100
- Euston Road — $100
- Pentonville Road — $120

**Pink Group:**
- Pall Mall — $140
- Whitehall — $140
- Northumberland Avenue — $160

**Red Group:**
- Strand — $220
- Fleet Street — $220
- Trafalgar Square — $240

**Yellow Group:**
- Leicester Square — $260
- Coventry Street — $260
- Piccadilly — $280

**Green Group:**
- Regent Street — $300
- Oxford Street — $300
- Bond Street — $320

**Dark Blue Group:**
- Park Lane — $350
- Mayfair — $400

**Stations (×4):**
- King's Cross Station — $200
- Marylebone Station — $200
- Fenchurch Street Station — $200
- Liverpool Street Station — $200
(All same design, different name — show the station tile design once with all four names listed)

**Utilities (×2):**
- Electric Company — $150
- Water Works — $150
(Different icons — lightning bolt vs water drop — same tile structure otherwise)

Also show one **owned state** example for each of the following groups — pick one property per group, show it owned by a different player each time:
- Brown → Player 4 (Amber)
- Dark Blue → Player 2 (Cobalt)
- Green → Player 3 (Jade)

---

### DELIVERABLE 6 — THE CITY Card (Community Chest Equivalent)

Design **three THE CITY cards** — the game's original replacement for Community Chest.

THE CITY card back must be **clearly distinct** from the RISK card back:
- RISK back: angular gold lattice on obsidian
- THE CITY back: a circular, interconnected pattern — more organic, community-feeling — gold on obsidian, but clearly different geometry

**THE CITY Card Back:**
- Obsidian base
- Circular gold mandala / interconnected ring pattern
- `THE CITY` in large tracked gold type — centred
- Hairline gold border

**THE CITY Card Fronts — three cards:**

**THE CITY Card 1 — Collect**
> Community fund pays out.
> Collect $100.

**THE CITY Card 2 — Pay**
> Street repairs assessment.
> Pay $40 per house. $115 per hotel.

**THE CITY Card 3 — Move**
> Advance to GO.
> Collect $200.

Same structure as RISK cards — `THE CITY` label top left in gold, bold visual zone, instruction text, gold border. But visually distinct from RISK cards — a different compositional feel. Where RISK felt sharp and angular, THE CITY should feel slightly more civic and connected — still dark and premium, but with a different visual character.

Show all three fronts and one back in a grid, slightly rotated.

---

### DELIVERABLE 7 — Dice Component

Design the dice as they appear during gameplay — not as children's dice, but as architectural minimal objects. Think: a premium board game from a design-forward publisher.

**Dice form:** Two cubes. Clean faces. Rounded corners — 6px radius. Dark surface (`#1E1E30`) with Ivory pips or numerals.

Show the following states, labelled:

**State 1 — Idle (awaiting roll):**
Both dice blank/neutral. `ROLL` button prominent below.

**State 2 — Rolling (animation frame):**
Dice appear mid-tumble — blurred or offset to suggest motion.

**State 3 — Normal roll result (4 + 3 = 7):**
Both dice settled. 4 pips and 3 pips clearly visible. Total: `7` displayed large below in gold monospaced. Small label: `Move 7 spaces`

**State 4 — Normal double (3 + 3 = 6):**
Both dice show 3 pips. Total: `6`. Small label: `Double. Turn ends after landing.` — make it clear no extra roll is granted.

**State 5 — Special 6+6:**
Both dice show 6 pips. A distinct visual treatment — gold border pulse or emphasis. Label: `Double Six.` below in gold. `Roll again.` beneath that in Stone. This state must feel different from a normal double — players need to understand something special is happening.

**State 6 — 6+6 in jail:**
Same as State 5 but with an additional label: `In Jail. No movement. Roll again.`

Show all 6 states in a 3×2 grid.

---

### DELIVERABLE 8 — Purchase Panel

The panel that appears when a player lands on an unowned property.

Design this as a **bottom sheet or side panel** — it slides up or in from an edge, overlaying the board without covering it entirely.

Use **Mayfair** as the subject (Dark Blue group — the most prestigious property):

**Mayfair — Dark Blue**
| Field | Value |
|---|---|
| Purchase Price | $400 |
| Mortgage Value | $200 |
| House Cost | $200 |
| Base Rent | $50 |
| 1 House | $200 |
| 2 Houses | $600 |
| 3 Houses | $1,400 |
| 4 Houses | $1,700 |
| Hotel | $2,000 |

**Panel content:**
- Property name: `MAYFAIR` — large, geometric sans, Ivory
- Group colour band across the top of the panel: Dark Blue `#1A4FBF`
- Group label: `DARK BLUE`
- Purchase price prominently: `$400`
- Rent table — all levels listed cleanly
- House cost: `$200 per house`
- Player's current cash shown as context: `Your cash: $1,500`
- Two action buttons: `BUY FOR $400` (primary) and `PASS` (secondary, smaller)

Show the panel in context — overlaying the bottom portion of the board.

Also show a **second variant** for a Station landing:

**King's Cross Station — $200**
Station panels are simpler — no building rents. Show:
- `KING'S CROSS STATION`
- Station icon
- Purchase price: `$200`
- Rent table: `1 station: $25 · 2: $50 · 3: $100 · 4: $200`
- `BUY FOR $200` / `PASS`

---

### DELIVERABLE 9 — Rent Due Panel

The panel that appears when a player lands on a property owned by another player.

Use three rent scenarios, shown as three separate panel states:

**Scenario A — Normal rent, no colour group bonus:**
> Player 2 (Cobalt) owns Strand. Player 1 lands on it. No other Red properties owned by Player 2. 1 house on Strand.
- `RENT DUE`
- `Strand · Red`
- `Owner: JAMES · Player 2` — with Cobalt colour accent
- Building indicator: 🏠 ×1
- Rent amount: `$90` — large, Danger red
- `PAY $90` — primary button

**Scenario B — Complete colour group, no buildings (2× applies):**
> Player 3 (Jade) owns all three Green properties. Player 1 lands on Regent Street. No buildings.
- `RENT DUE`
- `Regent Street · Green`
- `Owner: PRIYA · Player 3` — Jade accent
- `Complete group. No buildings.` — small explanatory label in Stone
- Base rent: `$26` — struck through, Stone
- Multiplied rent: `$52` — large, Danger red, `2× GROUP BONUS` label beside it
- `PAY $52`

**Scenario C — High rent, hotel:**
> Player 2 (Cobalt) owns Mayfair with a hotel. Player 1 lands on it with only $180 cash.
- `RENT DUE`
- `Mayfair · Dark Blue`
- `Owner: JAMES · Player 2` — Cobalt
- Hotel indicator
- Rent: `$2,000` — very large, Danger red
- Player's cash: `$180` — shown in Warning amber below: `Insufficient funds`
- `MANAGE ASSETS` — primary button (leads to bankruptcy flow)

---

### DELIVERABLE 10 — Building Interface

The panel where a player manages building on their properties.

Show this as a **full-width panel or modal** that opens over the board.

**Header:** `Build · Orange Group`

Show the Orange group with mid-game building state:
- Bow Street: 2 houses
- Marlborough Street: 1 house
- Food Street: 0 houses

For each property, show:
- Property name
- Current buildings (house icons)
- `+ BUILD HOUSE · $100` button — active
- `− SELL HOUSE · $100` button — active only if has houses

**Player context bar at bottom:**
- `Available cash: $620`
- Running total if multiple builds selected: `Building 2 houses · Total: $200 · Remaining cash: $420`
- `CONFIRM` — primary button
- `CANCEL` — secondary

Also show a **hotel-eligible state** for one property:
- Food Street: 4 houses → show a highlighted `UPGRADE TO HOTEL · $100` button distinctly separate from the house buttons — gold border, more prominent

Show the panel at full width, positioned as an overlay.

---

### DELIVERABLE 11 — Hotel Upgrade Panel

A focused confirmation panel specifically for the hotel upgrade moment. This is a significant in-game event and deserves its own visual treatment.

**Header:** `Hotel Upgrade`

**Content:**
- Property name: `FOOD STREET`
- Visual transformation: `🏠🏠🏠🏠` → `🏨` — show this as a visual with the 4 house icons on the left, an arrow, and the hotel icon on the right. Use architectural icon style — not emoji.
- Cost: `$100`
- Current cash: `$820`
- Remaining after upgrade: `$720`
- `UPGRADE` — primary button (gold)
- `CANCEL` — secondary

The hotel icon should feel premium — a tall tower silhouette in gold, distinct from the house icons (small cube outlines in Ivory).

---

### DELIVERABLE 12 — Mortgage / Unmortgage Panel

Show as a panel within the player portfolio, accessible during a player's action phase.

Show **two states:**

**State A — Mortgage a property:**
> Player wants to mortgage Euston Road to raise cash.
- `MORTGAGE PROPERTY`
- `Euston Road · Light Blue`
- Mortgage value: `+$50`
- Warning: `Mortgaged properties earn no rent.`
- Current cash: `$80`
- Cash after mortgage: `$130`
- `MORTGAGE FOR $50` — Warning amber border (this is a significant decision)
- `CANCEL`

**State B — Unmortgage a property:**
> Player wants to unmortgage Euston Road (previously mortgaged).
- `UNMORTGAGE PROPERTY`
- `Euston Road · Light Blue`
- Cost to unmortgage: `$50`
- `Property will earn rent again.`
- Current cash: `$340`
- Cash after: `$290`
- `UNMORTGAGE FOR $50` — primary
- `CANCEL`

---

### DELIVERABLE 13 — Trade Interface

Trading is one of the game's defining features. The trade interface must feel like a **negotiation table** — not a shop screen.

**Layout:** Two-column. Left = what the current player offers. Right = what the other player offers. A central dividing line or zone.

**Header:** `Trade · SARAH and JAMES`

Show a specific trade scenario:
- Player 1 (Sarah / Crimson) offers: **Food Street** + **$100 cash**
- Player 2 (James / Cobalt) offers: **Strand**

**Left column (YOU OFFER):**
- Player 1's colour header: `YOU · SARAH`
- Property card: `FOOD STREET · Orange` — compact version of the property card
- Cash chip: `$100` — shown as a distinct cash token/badge
- `+ Add property` — muted add button
- `+ Add cash` — muted add button

**Right column (JAMES OFFERS):**
- Player 2's colour header: `JAMES · PLAYER 2` — Cobalt accent
- Property card: `STRAND · Red`
- `+ Add property`
- `+ Add cash`

**Bottom action bar:**
- `PROPOSE TRADE` — primary button
- `CANCEL` — secondary

**Also show two response states** (smaller, below the main trade interface):

**Response State A — Trade proposed, awaiting James:**
> The trade proposal has been sent to James. Show a waiting state — same layout but dimmed, with `Awaiting JAMES · Player 2` in Stone text and a subtle pulse indicator.

**Response State B — Trade declined:**
> `JAMES declined the trade.` — brief, precise. Danger-adjacent but not red — Stone text. `CLOSE` button.

**Also show the 2-for-1 trade variant:**
Player 1 offers: **Bow Street + Marlborough Street**
Player 2 offers: **Trafalgar Square**
This is a valid trade — the interface should handle it without special treatment.

---

### DELIVERABLE 14 — Jail Panel

The panel displayed when a player is in jail at the start of their turn.

**Header:** `In Jail`
Subheader: `SARAH · Player 1` — Crimson

**Three options clearly presented:**

**Option 1 — Roll for double:**
- `Roll for Double` — primary action
- Small explanation: `A double releases you. 6+6 does not.` — Stone, caption
- No cost

**Option 2 — Pay $50:**
- `Pay $50 to leave` — secondary action
- Player's cash shown: `Your cash: $340`
- Cash after: `$290`

**Option 3 — Use Get Out of Jail Free:**
- `Use Get Out of Jail Free` — secondary action
- Only active if the player holds the card
- If they don't hold it: greyed out, label: `Not in your possession`

Show two states:

**State A:** Player has all options available (holds GOOJF card, has enough cash).

**State B:** Player has no GOOJF card and only $30 — can roll for double, cannot pay $50 (insufficient), GOOJF unavailable. Show the pay option as disabled with `Insufficient funds` label.

---

### DELIVERABLE 15 — Card Draw Overlay

The full-screen overlay that appears when a player lands on a RISK or THE CITY space. This is a cinematic moment — it pauses the board and draws the card.

**Layout:** Dark overlay (`#0D0D14` at 92% opacity) over the board. The card is centred, large, slightly elevated.

Show two overlays:

**RISK Card Draw:**
- Card animates in (show final settled state)
- The card: `RISK · Go directly to Jail. Do not pass GO. Do not collect $200.`
- Below the card: `SARAH · Player 1` — Crimson accent
- `Sent to Jail.` — body text in Stone
- `CONTINUE` — primary button below

**THE CITY Card Draw:**
- Card animates in
- The card: `THE CITY · Collect $100.`
- Below: `JAMES · Player 2` — Cobalt accent
- `+$100` — large Success green
- `CONTINUE`

---

### DELIVERABLE 16 — Money Transfer Feedback

The visual feedback layer showing money moving between parties. This appears as an overlay or notification on the board momentarily after a payment.

Design these as **transaction notifications** — appearing in the upper area of the screen, stacked if multiple.

Show 5 notification variants:

1. **Passing GO:**
`+$200 · Passed GO` — Success green, Ivory text, gold left border

2. **Rent paid:**
`−$220 · Rent to JAMES` — Danger red, shows the amount leaving, recipient name

3. **Rent received:**
`+$220 · Rent from SARAH` — Success green, shows the amount arriving

4. **Tax paid:**
`−$100 · Income Tax · Bank` — Danger red, muted (money disappears, no recipient)

5. **Low cash warning (passive):**
`Cash: $80 · Running low` — Warning amber, appears in the player's own panel zone

Each notification: pill shape, 8px radius, surface `#1E1E30`, coloured left border, Ivory text, monospaced cash amount, geometric sans label. Auto-dismiss implied.

---

### DELIVERABLE 17 — Bankruptcy Flow

A multi-step flow. Show each step as a separate screen state.

**Step 1 — Payment required:**
> Player 3 (Jade / Priya) owes $850 rent to Player 1. They have $120 cash.
- `PAYMENT REQUIRED`
- `You owe $850 to SARAH · Player 1`
- `Your cash: $120`
- `Shortfall: $730` — Danger red
- Options: `SELL BUILDINGS` · `MORTGAGE PROPERTIES`
- These are buttons — not a passive screen. Player must act.

**Step 2 — Asset management:**
Show the player's properties during the liquidation phase:
- A simplified portfolio view — properties listed with their sellable/mortgageable values
- Buildings can be sold: `Bow Street · 2 houses · Sell for $200`
- Properties can be mortgaged: `Marlborough Street · Mortgage for $90`
- Running total updates: `Raised: $290 · Still owed: $440`
- `CANNOT MEET PAYMENT` — shown if the player exhausts options

**Step 3 — Elimination:**
Full-screen moment.
- Background dims
- `ELIMINATED` — large, geometric sans, Danger red
- `PRIYA · Player 3`
- Brief summary: `$850 owed. Assets insufficient.`
- Below: `Properties return to the Bank.` — Stone, body
- An animation implied: properties drain of colour on the board (show static end state — all of Player 3's tiles now grey/neutral)
- `CONTINUE` — for the remaining players

---

### DELIVERABLE 18 — Player Portfolio Screen

The full screen a player opens to manage their assets — accessible during their action phase.

**Header:** `Your Properties · SARAH`

**Layout:** Grouped by colour group. Each group section shows:
- Group colour band (left border or header)
- Group name label
- Properties within the group, each showing:
  - Property name
  - Building state (house/hotel icons or `—` for none)
  - Mortgage state (`MORTGAGED` tag if applicable)
  - Available actions as small buttons: `BUILD`, `SELL`, `MORTGAGE`, `UNMORTGAGE`

Show a **mid-game portfolio:**

```
ORANGE · Complete group
Bow Street         🏠🏠      [ SELL ] [ BUILD ]
Marlborough Street 🏠        [ SELL ] [ BUILD ]
Food Street        —         [ BUILD ]

RED · Incomplete
Strand             —         [ MORTGAGE ]
Fleet Street       MORTGAGED [ UNMORTGAGE ]

STATIONS · 2 owned
King's Cross Station         [ MORTGAGE ]
Marylebone Station           [ MORTGAGE ]
```

**Bottom summary bar:**
- `Cash: $620`
- `Properties: 7`
- `Net worth: ~$2,840`
- `DONE` — closes the portfolio

Show the full screen at 1440×900px.

---

### DELIVERABLE 19 — Game Menu (In-Game Pause)

A modal overlay accessible during gameplay. Minimal — players should spend as little time here as possible.

**Overlay:** `#0D0D14` at 90% opacity over the board.

**Modal:** Centred, `#1E1E30` surface, 8px radius, gold hairline border.

**Content:**
- `BOROUGH` — small game wordmark at top, gold
- Menu items stacked:
  - `Resume` — primary (most important — get back to the game)
  - `How to Play`
  - `Settings`
  - `Restart Game` — Warning amber border (destructive)
  - `Quit to Main Menu` — Danger red border (destructive)
- `Resume` has clear visual emphasis — largest, brightest button

**Restart confirmation sub-state:**
When player clicks `Restart Game`:
- Modal content changes to: `Restart game? All progress will be lost.`
- `RESTART` — Danger red
- `CANCEL` — back to menu

---

### DELIVERABLE 20 — Victory Screen

The final screen. One player remains. This is BOROUGH's biggest visual moment.

**Layout:** Full-screen. Cinematic. The board is visible beneath, dimmed.

**Visual treatment:**
- The board dims to near-black beneath the overlay
- A single beam of light / architectural spotlight effect illuminates the centre (abstract — not literal)
- Gold particle effects or geometric gold fragments — subtle, premium, not fireworks

**Content:**
- `BOROUGH` — small gold wordmark, top centre
- `LAST STANDING` — small tracked label, Stone, below wordmark
- Winner's token icon — large, centred, in the player's colour, elevated treatment
- Winner's name: `SARAH` — very large, geometric sans, 900 weight, Ivory
- `Player 1 · Crimson`
- Final cash: `$4,820` — large, monospaced, gold
- A final stat line: `14 properties · 3 hotels · 7 houses` — Stone, body

**Eliminated players listed below in muted state:**
```
JAMES · Player 2 · Eliminated round 12
PRIYA · Player 3 · Eliminated round 8
ALI   · Player 4 · Eliminated round 15
```

**Action buttons:**
- `PLAY AGAIN` — primary
- `MAIN MENU` — secondary

Show at 1440×900px.

---

### DELIVERABLE 21 — How to Play Screen

A clean, readable in-game rules reference. Accessible from the main menu and the in-game game menu.

**Header:** `How to Play BOROUGH`

**Layout:** Scrollable, single-column, generous line height. Divide into clearly headed sections.

Cover only the most critical and custom rules — this is a reference for players who need a reminder, not a full rulebook:

**Sections to include:**

**The Basics**
> Be the last player remaining. Buy properties, build on them, collect rent. If you can't pay — you're out.

**Rolling the Dice**
> Roll two dice and move. If you roll doubles (any matching pair) — move, resolve, and your turn ends. If you roll 6+6 specifically — do not move. Roll again. This can repeat.

**Buying Properties**
> Land on an unowned property to buy it. If you pass — it stays unowned. No auctions.

**Rent**
> Land on another player's property and pay rent. If they own the full colour group with no buildings — you pay double the base rent. Once buildings are placed, use the building rent exactly.

**Building**
> Own a full colour group to build. No restriction on even building — place houses wherever you like within your group. 4 houses upgrades to a hotel.

**Trading**
> Offer and receive any combination of properties and cash. Two properties for one is valid. Mortgaged properties and properties with buildings cannot be traded.

**Jail**
> Roll a double (not 6+6) to escape free. Pay $50. Or use a Get Out of Jail Free card.

**Bankruptcy**
> If you can't pay, sell buildings and mortgage properties first. If still short — you're eliminated. Your properties return to the Bank. The player you owed receives nothing.

**Visual style:** Clean, editorial. Section headings in gold geometric sans. Body in Ivory geometric sans. Stone dividers between sections. No bullets — paragraph prose. A simple `CLOSE` button at top right.

---

### DELIVERABLE 22 — Settings Screen

Accessible from main menu and in-game menu.

**Header:** `Settings`

**Sections:**

**Display**
- `Window mode` — toggle: Fullscreen / Windowed
- `Resolution` — dropdown

**Audio** *(architecture only — not functional in v1)*
- `Master volume` — slider, muted label: `Coming soon`
- `Sound effects` — toggle, muted
- `Music` — toggle, muted

**Gameplay**
- `Animation speed` — three options: `Slow · Normal · Fast`
- `Show rent calculations` — toggle: shows the rent breakdown tooltip before confirming payment. Default: on.
- `Confirm before buying` — toggle: adds a confirmation step when purchasing a property. Default: off.

**Reset**
- `Restore defaults` — muted secondary button

**Style:** Clean list layout. Toggle switches use gold when on, Steel when off. Sliders use gold fill. Dropdowns in Steel surface. `BACK` button — returns to the previous screen.

---

## Layout of the Full Deliverable Page

Present all 22 deliverables on a **single long scrollable page** with:

- Page header: `BOROUGH · UI Design · Session 2 · Complete Screen Specification`
- Gold section dividers between each deliverable, labelled with the deliverable number and name
- Each deliverable in its own clearly bounded zone
- Viewport mockups (1440×900) shown at reduced scale (~60%) to fit the page width
- Smaller components (panels, cards, notifications) shown at full size or 1:1

---

## Non-Negotiables — Do Not Violate

1. Every screen uses the exact colour tokens from the system — no new colours introduced
2. Gold remains rare — it accents, it does not dominate
3. No screen uses pure white or pure black
4. Typography never deviates from the two defined typefaces
5. All copy is terse — no softening language, no exclamation marks
6. Ownership is always communicated with both colour AND label/icon
7. Destructive actions (restart, quit, bankruptcy) use Warning amber or Danger red borders — never the primary gold style
8. The board is always the visual centrepiece when visible — no panel or modal should fully obscure it
9. Nothing looks like Monopoly — no primary colours on white, no cartoon styling, no Monopoly typography
10. Every state communicates clearly what happened, what the player owes or earned, and what they can do next

---

## Success Criteria

Before delivering, confirm yes to all:

- [ ] Can a player understand **whose turn it is** at a glance on every game screen?
- [ ] Is the **board always readable** — who owns what, what's been built, where each player is?
- [ ] Does the **6+6 state** look visually distinct from a normal double — no player will confuse them?
- [ ] Does the **2× rent bonus** have a clear visual explanation when it applies?
- [ ] Does the **trade interface** feel like a negotiation — not a shop?
- [ ] Does the **bankruptcy flow** feel weighty and final — not a minor UI event?
- [ ] Does the **victory screen** feel like a genuine payoff moment?
- [ ] Is every **destructive action** (restart, quit, bankrupt confirm) visually distinct from neutral actions?
- [ ] Is the **How to Play** screen readable without needing the full rulebook?
- [ ] Does the **entire system feel cohesive** — as if every screen was designed by the same hand?

---

*This prompt completes the BOROUGH visual design specification. All screens delivered here, combined with the Session 1 visual foundation, constitute the complete design handoff to Claude Code.*
