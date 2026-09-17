# Milestone 2 Notes

## Status

- `npm run build` passes with zero TypeScript errors.
- `npm run lint` passes with zero warnings/errors.
- `npm run test` passes — the Milestone 1 engine suite (53 tests / 7 files) is untouched and still green.
- `npm run dev` launches a playable 2–4 player game: setup screen → board → full roll/move/resolve/end-turn loop.
- Manually exercised in-browser: street purchase (with full rent table), station purchase (tiered rent table), passing on a property, the Property Inspection drawer, cash-delta driven UI updates, colour-group band bars accumulating across multiple purchases, the Chance/Community Chest "coming in Milestone 3" toast + auto-end-turn stub, and the Jail/Just-Visiting special-space modal. No console errors observed during play.

## Layout Decisions

- **Board index → grid mapping.** The prompt's section 6 contains two contradictory descriptions of the bottom-row/right-column mapping (the literal text disagrees with its own worked corner-position table). The corner table was treated as authoritative — `[row 11, col 11] = index 0` (GO, bottom-right), `[row 1, col 11] = index 10` (Jail, top-right), `[row 1, col 1] = index 20` (Free Parking, top-left), `[row 11, col 1] = index 30` (Go To Jail, bottom-left) — and the four edge formulas were re-derived to be consistent with it:
  - bottom row (row 11): `index = (29 + col) mod 40`
  - right column (col 11): `index = 11 - row`
  - top row (row 1): `index = 21 - col`
  - left column (col 1): `index = 19 + row`

  This produces a self-consistent, contradiction-free layout matching all four corners and the 9-space run on each edge. See [`src/components/board/layout.ts`](src/components/board/layout.ts).
- **Design system as CSS custom properties + CSS Modules.** `tokens.css`, `typography.css`, and `reset.css` are global (imported once in `main.tsx`); every component's own visual details live in a co-located `*.module.css` file scoped to that component. No CSS-in-JS library was added since none was requested and Vite supports CSS Modules natively.
- **Board sizing.** `Board.module.css` uses `width: min(700px, 100%)` with `min-width`/`min-height: 600px` and `aspect-ratio: 1/1`, satisfying the "min 600×600, target 700×700 on a 1440px screen" constraint without a fixed breakpoint.
- **Tile text rotation** uses `writing-mode: vertical-rl` for left/right-column tiles and horizontal text for top/bottom rows, rather than a `transform: rotate()` on the whole tile — this keeps the coloured strip and ownership badge upright and legible while only the property name reads vertically.

## Engine Method Signatures — Nothing Changed

The engine's public surface (`GameEngine.*`, all types under `@/engine`) was used exactly as delivered in Milestone 1. No signatures needed to change. Two engine behaviours worth calling out for how the UI consumes them:

- `GameEngine.rollDice` does **not** move the player — it only sets `lastDiceRoll` and, for a non-6+6 roll, flips `turnPhase` to `'moving'`. The UI is responsible for calling `GameEngine.movePlayer(playerId, roll.total, state)` itself to actually advance `boardPosition` (and credit GO cash). `movePlayer` immediately sets `turnPhase: 'resolving-landing'`, so the UI computes the animation's `fromIndex`/`toIndex` *before* calling `movePlayer`, then runs `useTokenAnimation` purely as a visual replay over the now-already-mutated state (this matches the prompt's own note in section 8 that "the cash is already credited by the engine; the animation is purely visual confirmation"). While the visual step-through is running, `GameScreen` renders `ActionPanel` against a locally-overridden `{ ...state, turnPhase: 'moving' }` view so the phase label stays "Moving…" even though the real `state.turnPhase` has already moved on to `'resolving-landing'`.
- A 6+6 roll leaves `turnPhase` unchanged (still `'awaiting-roll'`) and sets `pendingAction: { type: 'forced-reroll' }` instead. `ActionPanel` checks for this pending-action shape (not a dedicated turn phase) to switch the button from "Roll Dice" to "Roll Again" and show the dice with the gold double-six glow.

## Ambiguities Resolved

- **Landing on Go To Jail / Chance / Community Chest** — per section 15's explicit stub table, these show a 2-second `Toast` and then call `actions.endTurn()` directly (bypassing `strategic-action`) after a short delay, rather than resolving through the normal pending-action flow. `GameEngine.resolveLanding` already parks Go To Jail at `turnPhase: 'turn-ended'` on its own (jail rules are in the engine from Milestone 1, just not exposed via any M2 UI); Chance/Community Chest land at `turnPhase: 'drawing-card'`, which the UI treats as another stub state.
- **`useGameState`'s Milestone-3 stub actions** (`buyHouse`, `mortgage`) reference their unused `propertyId` parameter via `void propertyId;` rather than an `_`-prefixed name, since the project's ESLint config has no `argsIgnorePattern` for `no-unused-vars` and the prompt's own stub signature would otherwise fail lint.
- **Cash-delta tracking** (`MoneyDelta` triggers) is implemented as a render-phase "adjust state when a prop changes" comparison (a `knownCash` state snapshot compared against the latest `state.players` on every render, updated via `setState` calls made directly in the render body) rather than inside a `useEffect`, to satisfy the `react-hooks/set-state-in-effect` lint rule while still avoiding a full derived-state recomputation library.

## What Milestone 3 Needs to Know

- Jail, Chance/Community Chest card resolution, and buildings are fully implemented in the Milestone 1 engine (`rules/jail.ts`, `rules/cards.ts`, `rules/building.ts`, plus `GameEngine.rollForJailEscape` / `payJailFine` / `useGoojfCard` / `drawCardForCurrentSpace` / `resolveDrawnCard` / `buyHouse` / `upgradeToHotel` / `sellHouse` / `sellHotel`) — Milestone 2 simply never calls them from the UI. Wiring them in is a matter of replacing the toast-stub branches in `GameScreen.handleRoll`'s `onComplete` callback and the disabled buttons in `ActionPanel`'s `strategic-action` block.
- `ActionPanel` already has a `'awaiting-jail-decision'` gap: no branch renders anything for that `TurnPhase` yet, since M2 never produces it (the UI never calls `rollForJailEscape`/`payJailFine`). Milestone 3 will need to add that branch plus a jail-specific action panel state (pay $50 / roll for doubles / use GOOJF card).
- `PropertyDrawer`, `PurchaseModal`, and the rent breakdown in `RentModal` all branch on `asset.type` (`street` / `station` / `utility`) and already display mortgage value — mortgaging (Milestone 3) can reuse this exact layout by adding a Mortgage/Unmortgage button where the disabled "Mortgage" strategic action currently sits.
- `BoardTile` already renders a building-count indicator (dots for houses, "HOTEL" label) driven off `OwnershipRecord.buildings`, so Milestone 3's build/sell-house UI doesn't need any new board-rendering work — it only needs to wire up the strategic-action buttons.
- Trading is fully unimplemented in the UI (the `trade` stub in `useGameState` is a no-op); `GameEngine.proposeTrade` / `acceptTrade` / `rejectTrade` and the `TradeProposal` type are ready to be wired to a new modal.
