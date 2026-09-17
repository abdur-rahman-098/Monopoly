# BOROUGH — Milestone 5 & Bug Fixes Prompt

2026-09-17 · @Someone

## Context

Milestones 1–4 are complete. The game has a working rules engine (TypeScript) covering all custom mechanics: 6+6 forced reroll, 2× rent for unimproved complete sets, no auctions, unlimited house supply, 100% resale, custom bankruptcy. The full UI exists: main menu, player setup, game board, player panels, action modals, portfolio, trade interface, jail panel, card draw, notifications, victory and bankruptcy screens.

This prompt covers two things:

1. **Three bug fixes** to apply to the existing codebase before Milestone 5 work begins
2. **Milestone 5 — Visual Polish** in full, covering animations, transitions, micro-interactions, and the victory/bankruptcy sequences

The authoritative rules are `Game_Rules_v1.0.md`. The design spec is `Game_design.md`. The UI reference is `BOROUGH UI Session 2.dc.html`.

## Bug Fix 1 — Jail: 3-Roll Limit with Auto-Deduct

The current implementation has no cap on how many turns a player can attempt to roll doubles while in Jail. Apply the following rule:

**Rule:** A player in Jail has a maximum of **3 turns** to roll a normal double (any double except 6+6). If they fail all 3, **$50 is automatically deducted** from their cash and they are released immediately — regardless of whether they can afford it (bankruptcy rules apply if they cannot).

**Engine changes (`src/engine/jail.ts` or equivalent):**

- Add `jailTurnsUsed: number` (0–3) to the player's in-jail state, initialised to `0` when a player enters Jail.
- On each Jail turn where the player chooses "Roll for Double" and does not escape: increment `jailTurnsUsed`.
- After the third failed roll: deduct $50 from the player's cash, clear jail state (`inJail: false`, `jailTurnsUsed: 0`), and proceed to normal movement using that same roll result. If the deduction causes the player's cash to go negative, trigger the standard bankruptcy/asset-liquidation flow before movement.
- The 3-roll limit does **not** apply if the player pays the $50 fine voluntarily or uses a Get Out of Jail Free card — those clear jail immediately with no counter.
- 6+6 rolled in Jail: no movement, no escape, counts as one of the 3 attempts (jailTurnsUsed increments).

**UI changes (Jail panel):**

The Jail panel must show the attempt counter at all times. Four states are now required — see Section 14 of `BOROUGH UI Session 2.dc.html` for the reference design:

- **State A (Attempt 1/3):** All options available. Progress bar shows 1 pip filled. Hint: "No double after 3 attempts · $50 auto-deducted · released."
- **State B (Attempt 2/3):** Amber warning. 2 pips filled. Hint: "1 roll remaining · miss and $50 is auto-deducted."
- **State C (Attempt 3/3):** Red alert. All 3 pips filled in red. "ROLL FOR DOUBLE — FINAL CHANCE" button styled in danger red. Warning banner: "Last chance. Miss and $50 is deducted automatically — then you're released regardless."
- **State D (Released — fine applied):** Shown after the third failed roll. "Released from Jail" heading, −$50 deduction displayed, remaining cash, then a "ROLL TO MOVE" button to proceed with that turn's movement.

## Bug Fix 2 — Activity Log Overflow

The activity log in the left panel of the main game board screen is currently cut off — items beyond the visible height are hidden with no scroll. This is a CSS layout bug.

**Fix:** The log's inner item list needs `overflow-y: auto` (or `overflow-y: scroll`) on a flex child that has `flex: 1; min-height: 0`. The parent container must also use `min-height: 0` to allow the flex shrink to work correctly in a column flex layout.

**Correct structure (React / CSS):**

```tsx
// Outer panel — flex column with fixed height or flex:1
<div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
  <span className="label">ACTIVITY</span>
  {/* Scrollable list — min-height:0 is essential */}
  <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
    {log.map(entry => (
      <LogEntry key={entry.id} entry={entry} />
    ))}
  </div>
</div>
```

The label "ACTIVITY" stays pinned at the top; only the list scrolls. The scrollbar should use the game's dark theme styling (thin, subtle). Most recent entries should be appended to the bottom so the log naturally shows the latest action last — this is the conventional log direction.

## Bug Fix 3 — Board Scale ×2

The game board is too small to read comfortably at the current layout size. Double the board's rendered dimensions.

**Target dimensions:**

| Element | Before | After |
| --- | --- | --- |
| Board grid | 780 × 780 px | 1560 × 1560 px |
| Corner tiles | 104 px | 208 px |
| Regular tile text | \~8 px | \~14–16 px |
| Side panels | 290 px | 420 px |
| Overall screen frame | 1440 × 900 px | 2880 × 1620 px |

**Implementation notes:**

- The board is rendered inside a scalable screen frame. Double the frame base dimensions and all internal fixed pixel values proportionally.
- The board grid uses `grid-template-columns: 104px repeat(9, 1fr) 104px` — update corner columns to `208px`.
- Tile font sizes: property name from `8px → 14px`, price label from `8px → 13px`, owner tag from `7px → 11px`.
- Building indicators (house squares, hotel block) scale up proportionally: house from `5×5px → 9×9px`, hotel from `7×10px → 12×18px`.
- Player tokens on tiles from `11×11px → 18×18px`.
- The board center logo and dice: `BOROUGH` wordmark from `58px → 96px`, dice from `60×60px → 100×100px`.
- Corner tile labels (GO, JAIL, FREE PARKING, GO TO JAIL) scale up — font sizes from `9–20px → 16–36px`.
- The screen's `frameScale` prop (currently `0.85` default) still controls the overall display scale — this change is to the base design dimensions, not the viewport scale.

## Milestone 5 — Visual Polish

Milestone 5 adds all animation, transitions, micro-interactions, and the victory/bankruptcy sequences to the existing working game. The game should feel like a **premium modern digital board game** — not a digitized physical board, and not a generic HTML game. Every animation must *communicate state*, not merely decorate.

### Core Principle

Animation speed must prioritise feel over spectacle. A turn should never feel slow because of animations. The guidance from `Game_design.md` Section 35 is authoritative:

> *Animations must be fast enough that they don't make normal turns feel slow or frustrating. They should inform, not delay.*

The suggested default speeds below are starting points. All durations should be tunable via a single animation speed constant (or config object) so they can be adjusted globally.

### Technology

Use whatever animation library is already in the project, or introduce one of:

- **Framer Motion** (preferred if React is the UI framework — it handles layout animations, shared element transitions, and gesture states cleanly)
- **CSS transitions + keyframes** for simpler effects (fade, scale, colour change)
- **GSAP** if complex sequenced animations are required (e.g. the token movement chain)

Do not use `setTimeout` chains to orchestrate multi-step animations — use the animation library's sequencing primitives (Framer Motion's `useAnimate`, GSAP timelines, or `AnimationSequence`).

### Architecture note

Animations belong in the **UI layer only**. The game engine should not know or care that an animation is playing. The engine emits events (player moved, rent paid, property purchased, etc.) and the UI layer plays the corresponding animation before confirming the event to the player. Never block engine state updates waiting for an animation to complete — the engine is the source of truth; the UI catches up visually.

## Animation Inventory & Specifications

Implement every item in this table. Suggested durations are defaults at "Normal" speed; build a global multiplier (0.5× for Fast, 1.5× for Slow) that scales all of them.

| Event | Animation | Duration | Notes |
| --- | --- | --- | --- |
| Dice roll | Both dice tumble with rotation + blur, settle to final face | 600 ms total | Ease-out. Show both values clearly when settled. |
| 6+6 result | Brief red flash/glow on both dice, "ROLL AGAIN" label fades in | 300 ms | Communicates the special rule visually. |
| Token movement | Token hops space-by-space along the board path | 80 ms per space | Must be sequential, not teleport. Passing GO triggers the +$200 notification mid-move. |
| GO passed | +$200 toast fades in and slides up, auto-dismisses | 1 200 ms | Triggered at the moment the token crosses GO, not at turn end. |
| Property purchased | Ownership colour bar fades in on the tile | 250 ms | Use the buying player's colour. |
| Rent paid | A number flies from payer's cash display toward owner's | 500 ms | Payer cash decreases; owner cash increases at the point the number arrives. |
| House placed | House icon scales in from 0 on the tile | 200 ms | Spring easing — slight overshoot. |
| Hotel upgrade | 4 house icons scale out while hotel icon scales in | 350 ms | Sequence: houses out (150 ms) → hotel in (200 ms). |
| House/hotel sold | Reverse of the placed animation | 200 ms |  |
| Card drawn (Chance/Community Chest) | Card flips in from edge of screen, displays, pauses, dismisses | 800 ms total | Flip on Y axis. |
| Sent to Jail | Token moves to Jail corner with a "bounce" settle | 400 ms | Play after movement animation if from Go To Jail space. |
| Trade completed | Assets animate from one player panel to the other | 600 ms | Properties and cash visually transfer. |
| Property mortgaged | Tile darkens + mortgage overlay fades in | 250 ms |  |
| Property unmortgaged | Reverse of mortgage animation | 250 ms |  |
| Player bankruptcy | Player panel collapses with a fade-out, properties on board fade to unowned state | 800 ms | Stagger tile resets by 30 ms each for a wave effect. |
| Victory | See Victory sequence below | — |  |
| Screen transitions | Cross-fade between major screens (menu → setup → game) | 300 ms | Fade, no slide — the board should feel like it "appears". |
| Button hover | Subtle border brightens, background lifts slightly | 80 ms | All interactive controls. |
| Button press | Brief scale-down (0.97) + immediate release | 120 ms | Spring. |
| Modal / overlay open | Scale from 0.95 → 1.0 + fade in | 200 ms |  |
| Modal close | Reverse | 150 ms |  |
| Toast / notification | Slides in from bottom-right, auto-dismisses or user closes | 300 ms in, 200 ms out |  |
| Tile hover (board) | Subtle scale-up (1.02) + glow border | 100 ms | On all interactable tiles. |
| Player panel — active turn | Subtle pulse on the gold border (2 s loop) | — | Communicates whose turn it is without being distracting. |

### Victory Sequence

The victory screen must feel like a genuine win — this is the emotional payoff of the game. It must be the **strongest animation in the entire game**.

1. All other players' panels fade and collapse (300 ms, staggered 100 ms apart)
2. The winner's token on the board pulses gold (400 ms)
3. The board fades to background (500 ms, opacity to 0.15)
4. The victory screen overlays with the winner's colour flooding in from the bottom (600 ms)
5. The BOROUGH wordmark and winner name slam in (scale from 1.2 → 1.0, 400 ms, spring)
6. A particle or geometric burst radiates outward in the winner's colour (1 000 ms)
7. Final stats and net worth count up from 0 (800 ms, ease-out)
8. New Game / Main Menu buttons fade in last (300 ms delay after stats)

### Bankruptcy Sequence

1. A "BANKRUPT" overlay slams onto the relevant player panel (red, bold, 300 ms)
2. All of that player's properties on the board animate to unowned state in a wave (30 ms stagger per tile)
3. The player panel collapses with a fade (400 ms)
4. An activity log entry reads "\[PLAYER\] has been eliminated."
5. If 2+ players remain: game continues. If 1 player remains: victory sequence triggers after a 600 ms pause.

## Delivery Notes & Constraints

### What to deliver

- All animations and transitions listed in the inventory above, implemented and working in the existing game
- The three bug fixes applied before any animation work begins
- A global `ANIMATION_SPEED` constant (or config object) that scales all durations by a multiplier, wired to the existing "Animation speed" setting in the Settings screen (Slow / Normal / Fast)
- No new gameplay rules, no new screens, no new features outside what is listed here

### What not to change

- Game engine logic — Milestone 5 is UI-only
- Existing component structure beyond what is needed to add animation wrappers
- Any game rule, value, or calculation
- The visual design: colours, typography, spacing, layout are already specified and implemented; polish does not mean redesign

### Rules that govern this build

- `Game_Rules_v1.0.md` is the authoritative gameplay spec. Do not add, remove, or modify any rule.
- `Game_design.md` Section 35 governs animation principles. Do not invent behaviour outside what is described there or here.
- If any animation feels slow at "Normal" speed during testing, shorten its duration — speed is more important than spectacle.
- Do not add sound. Sound is Milestone 6+ (`Game_design.md` Section 36). Build the event hooks but leave them silent.

### Acceptance criteria

- [ ] All 3 bug fixes are applied and verified
- [ ] All animations in the inventory table are implemented
- [ ] Token movement is space-by-space, not teleport
- [ ] GO is triggered mid-movement when passed
- [ ] Rent payment shows a visual transfer between players
- [ ] Victory sequence plays on game end
- [ ] Bankruptcy sequence plays on player elimination
- [ ] Animation speed setting (Slow/Normal/Fast) scales all durations correctly
- [ ] No animation blocks user input for more than its stated duration
- [ ] Game remains fully playable with animations disabled (speed = instant)
