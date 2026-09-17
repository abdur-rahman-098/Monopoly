# Milestone 1 Notes

## Status

- `npm run build` passes with zero TypeScript errors.
- `npm run test` passes — 53 tests across 7 files, all green.
- `npm run lint` (ESLint) passes with zero warnings/errors.
- The engine is importable via `import { GameEngine } from '@/engine'`.
- No UI components exist beyond the default `App.tsx` placeholder text — this milestone is engine-only.

## Project Setup Deviations

- **Scaffolded into the existing working directory** (`D:\Monopoly\monopoly game`) rather than a nested `borough/` folder, since the directory was already the intended project root and was empty.
- **ESLint + Prettier replace the Vite template's default `oxlint`.** The latest `create-vite` react-ts template ships with `oxlint` instead of ESLint. Since the spec explicitly asked for ESLint + Prettier, `oxlint` and its config were removed and replaced with a flat `eslint.config.js` (typescript-eslint, react-hooks, react-refresh, eslint-config-prettier) plus `.prettierrc.json`. `npm run lint` now runs ESLint; `npm run format` runs Prettier.
- **`baseUrl` omitted from `tsconfig.app.json`.** The installed TypeScript version (6.0, current stable-adjacent release) deprecates `compilerOptions.baseUrl` under bundler module resolution. The `@/*` → `./src/*` path alias works without it, so `baseUrl` was left out rather than suppressing the deprecation warning.
- **`vite.config.ts` uses `vitest/config`'s `defineConfig`** (which layers Vitest's `test` option on top of Vite's config type) so a single config file drives both the dev server/build and the test runner, with the `test.environment: 'jsdom'` and `test.globals: true` options set as required by the Vitest + Testing Library devDependencies requested in the prompt.

## Implementation Decisions on Ambiguous Points

The prompt said to throw rather than invent behaviour for genuine ambiguities. Two spots in the spec were underspecified enough to need a documented resolution instead of a thrown error, since they concern static card data rather than a live rules branch:

1. **Chance card #16 ("Move to nearest station")** — the `CardEffect` union only supports a fixed `move-to` destination, not a "nearest of type X from current position" effect. Implemented as a fixed move to King's Cross Station (`boardIndex: 5`) with `collectGoIfPassed: true`. A true "nearest station" effect would need a new `CardEffect` variant (e.g. `{ kind: 'move-to-nearest'; spaceType: 'station' | 'utility' }`) resolved against the player's current position — left for a later milestone if the flavour distinction matters.
2. **Community Chest card #15 ("Pay $50 per player as a collective fine, or equivalent social mechanic")** — the `CardEffect` union has `collect-from-each` (bank → player) but no "pay-to-each" (player → each other player) variant. Implemented as a flat `pay: 50` to the bank, which is the closest existing effect kind and keeps the card's cost roughly equivalent. If a genuine "pay each opponent" mechanic is wanted, it needs its own `CardEffect` kind.

## Structural Additions Not in the Spec's File List

- **`src/engine/rules/helpers.ts`** — a small internal module (`getPlayer`, `updatePlayer`, `addLogEntry`, `otherActivePlayers`) shared by every rules module to avoid duplicating player-lookup and immutable-update boilerplate. It is not part of the public API; only `GameEngine.ts` and `index.ts` are meant to be imported by the UI.
- **`src/tests/testUtils.ts`** — a shared `makeTestState()` builder used by all seven test files to construct a valid baseline `GameState` (two active players, all 28 purchasables bank-owned, shuffled-but-seeded-by-default decks) with targeted overrides. Not one of the explicitly listed test files, but necessary to keep each test file focused on its own rules module rather than re-deriving a full game state by hand.

## Notable Rules Resolutions Worth Knowing for Milestone 2

- **`useGetOutOfJailFreeCard` needs a `deckType` argument.** `Player.getOutOfJailFreeCards` is a plain count with no record of which deck (Chance vs. Community Chest) a held card came from. `GameEngine.useGoojfCard(state, deckType = 'chance')` defaults to crediting the Chance deck's card back to its bottom when the UI doesn't specify. If a player could plausibly hold one card from each deck simultaneously and the UI needs to let them choose which to redeem, the UI must pass `deckType` explicitly. A more complete model would track deck-of-origin per held card (e.g. `getOutOfJailFreeCards: CardDeckType[]` instead of a number).
- **Held GOOJF cards are absent from their deck's live array while held**, per spec 7.9 (`drawCard` doesn't return a GOOJF card to the deck until used). `useGetOutOfJailFreeCard` therefore looks up the specific card to reinsert from the static `CHANCE_CARDS` / `COMMUNITY_CHEST_CARDS` definitions (each deck has exactly one GOOJF card by design) rather than from `state.chanceDeck` / `state.communityChestDeck`, since the live array won't contain it.
- **`GameEngine.declareBankruptcy` adjusts `currentPlayerIndex`** after the bankrupt player is spliced out of `players[]`, so the turn pointer keeps referring to the correct next player rather than shifting silently. This bookkeeping lives in the engine orchestrator, not in `rules/bankruptcy.ts`, since it's a turn-flow concern rather than a bankruptcy-resolution rule.
- **`GameEngine.movePlayer` is exposed publicly** (not in the spec's method list) so the UI can drive the `moving` → `resolving-landing` transition after a dice roll or card resolves; it wraps `rules/movement.ts`'s `movePlayer` and sets `turnPhase: 'resolving-landing'`. `resolveLanding` then reads the player's new position and branches on the landed board space.
- **No auction, no three-doubles-to-jail, no extra roll on doubles, no even-building restriction, no Free Parking jackpot, no creditor property transfer** — all implemented per the spec's explicit exclusions list, and covered by the corresponding rejected-behaviour assertions in the test suite (e.g. doubles always end the turn after landing resolution; a declined purchase never triggers an auction path in `GameEngine.declinePurchase`).

## What Milestone 2 Needs to Know

- The only import surface for the UI is `@/engine` (re-exporting `GameEngine`, all model types, `BOARD`, property/station/utility data, and both card decks).
- Every `GameEngine` method is a pure function: `(args, state) => newState`. No method mutates its input `GameState`; the UI must always use the returned value.
- Invalid actions throw `Error` with a `RULES: ...`-prefixed message rather than failing silently — the UI layer should catch and surface these as user-facing validation messages.
- `TurnPhase` and `PendingAction` together describe exactly what the UI should be prompting for at any moment; the UI should treat these as the source of truth for which controls to render; it should never re-derive "what can happen next" from board/ownership state directly.
