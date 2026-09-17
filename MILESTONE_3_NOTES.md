# Milestone 3 Notes

## Status

- `npm run build` passes with zero TypeScript errors.
- `npm run lint` passes with zero warnings/errors.
- `npm run test` passes — 79 tests across 10 files (the 53 Milestone 1/2 tests are untouched and still green, plus 26 new tests: `mortgage.test.ts`, `cards.test.ts`, `bankruptcyFlow.test.ts`).
- `npm run dev` launches a playable game exercising the full strategy layer: building/selling houses and hotels, mortgaging/unmortgaging, proposing/accepting/rejecting trades, jail (roll/pay/GOOJF), Chance/Community Chest cards (including the nearest-station and nearest-utility buy-or-rent cards), and the liquidation-before-bankruptcy flow.
- Manually exercised in-browser: dice roll → Chance card draw → move-to-nearest-style resolution → strategic-action; a full property trade proposal → accept cycle with cash and property transferring correctly; the Build and Mortgage panels' empty states for a player who owns nothing yet.

## What Was Already There

Milestones 1–2 had already built the **entire rules-engine layer** for this milestone — `rules/building.ts`, `rules/mortgage.ts`, `rules/trade.ts`, `rules/jail.ts`, `rules/bankruptcy.ts`, and most of `rules/cards.ts`, all exposed via `GameEngine` static methods, all covered by a passing test suite. Milestone 3's job was therefore mostly **UI wiring** (`useGameState`'s stub actions, `ActionPanel`'s disabled buttons, `GameScreen`'s toast-stub branches) plus **closing three real engine gaps** that the M1/M2 test suite hadn't touched:

1. **Nearest-station / nearest-utility cards** — the milestone's card list requires "advance to the nearest station/utility; buy it if unowned, otherwise pay double rent / 10× the dice roll." The existing `CardEffect` union had no such variant (the one "nearest station" card in the old deck was a hardcoded static destination). Added `move-to-nearest-station` / `move-to-nearest-utility` effect kinds and a `resolveNearestLanding` helper in `rules/cards.ts` that finds the next station/utility ahead of the player's *current* position (wrapping past GO), then resolves it exactly like a normal landing (purchase decision if unowned, rent if owned by someone else, nothing if owned by the player themself).
2. **Automatic bankruptcy escalation** — `payRent`/`payTax`/card `pay` effects previously just subtracted cash unconditionally, allowing a negative balance with no path to bankruptcy. Added `GameEngine.obligationOrBankruptcy` (checked before entering `awaiting-rent-payment`/`awaiting-tax-payment`) and a matching `payOrEscalate` helper inside `rules/cards.ts`, both of which redirect into `awaiting-bankruptcy-resolution` (an existing-but-previously-unused `TurnPhase`/`PendingAction` pair) whenever the current player's cash can't cover the debt. `GameEngine.payObligation` settles the debt once liquidation has made it affordable.
3. **`GameEngine.declareBankruptcy` left stale turn state** — it removed the player and fixed up `currentPlayerIndex` but never reset `turnPhase`/`pendingAction`, so the next player would inherit whatever payment prompt bankrupted the previous one. Now resets to `awaiting-roll` (or `turn-ended` if the game just ended).

Also rewrote `data/cards.ts`'s effect distribution (not the flavour text, which the prompt says is a placeholder) to match the milestone's required 16+16 card lists exactly, including the two nearest-station cards and the one nearest-utility card.

## New Engine Surface

- `GameEngine.payObligation(state)` — settles an `awaiting-bankruptcy-resolution` debt once cash covers it.
- `GameEngine.getLiquidationOptions(playerId, state)` — sell-house/sell-hotel/mortgage options with their cash yield, per the prompt's spec'd signature.
- `GameEngine.checkSolvency(playerId, debt, state)` — `'solvent' | 'can-liquidate' | 'bankrupt'`.
- `GameEngine.getJailOptions(playerId, state)` — `'roll' | 'pay-fine' | 'use-goojf-card'`.

## UI Additions

- `ActionPanel` gained a jail-decision branch (roll for doubles / pay $50 / use GOOJF card, the last only shown when the player holds one) that takes over the `awaiting-roll` slot whenever the current player `isInJail`. The pre-existing forced-reroll branch ("Roll Again" for a 6+6) now routes to the jail-specific reroll handler when the player is in jail, since jail escape and a normal roll dispatch different engine actions.
- New modals: `CardModal` (Chance/Community Chest draw), `BuildModal`, `MortgageModal`, `TradeModal` (two-sided offer builder) + `TradeResponseModal` (accept/reject), `LiquidationModal` (bankruptcy liquidation flow), `GameOverModal`.
- `GameScreen` now auto-draws a card the instant `turnPhase` becomes `drawing-card` (a `useEffect`, mirroring how the auto-end-turn effect already worked for `turn-ended`), and the roll/animate/resolve logic was factored into one `animateMoveAndResolve(roll)` helper shared by both the normal roll handler and the jail-escape roll handler.
- `useGameState` actions all funnel through a small `run()` wrapper that catches and logs (rather than crashes on) a thrown `RULES:` error from the engine — UI buttons are expected to gate on the corresponding `canX` query first, so this is a safety net, not the primary validation path.

## Ambiguities Resolved

- **GOOJF card deck origin on release** — `Player.getOutOfJailFreeCards` is a plain count with no record of which deck a given card came from (an M1 modelling decision, not something this milestone's prompt asked to change). `GameEngine.useGoojfCard` already defaulted to `'chance'`; the jail-decision UI calls it with no explicit deck argument, inheriting that same default. Flagging this rather than redesigning the player model, since it's a pre-existing, already-tested engine contract.
- **Trade initiation window** — the prompt says trades "can happen during any player's turn," but this is a local-hotseat game with one input surface. Initiating a trade is only available from the current player's `strategic-action` panel (matching the pre-existing disabled-button scaffold from Milestone 2); *responding* to a pending trade (`TradeResponseModal`) is rendered unconditionally whenever `state.activeTradeProposal` is set, regardless of whose turn it is or what phase they're in, which satisfies "trading is available outside of the strict turn-taking window" without adding a second concurrent input surface.
- **Card flavour text** — per the prompt's own note that "card names and flavour text are placeholder," the existing "Borough"-branded card text was kept where the effect was unchanged, and new/adjusted text was written in the same voice for the nearest-station/utility and restructured Community Chest cards, rather than reverting to the prompt's literal UK-Monopoly wording.

## What Milestone 4/5 Should Know

- The top bar still says "MENU — coming in Milestone 4" and the setup screen is still the temporary one from Milestone 1 — untouched, as instructed.
- `GameOverModal` is intentionally minimal (winner name + "New Game" button that unmounts back to the setup screen via a new `onNewGame` prop on `GameScreen`). Visual polish is explicitly out of scope for this milestone.
- All sound hooks (`onCardDrawn`, `onBankruptcy`, `onVictory`, etc.) are now called at the correct moments but remain no-op stubs, same as Milestones 1–2 left them.
