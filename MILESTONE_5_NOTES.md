# Milestone 5 Notes — Bug Fixes & Visual Polish

## Status

- `npm run build` passes with zero TypeScript errors (10 errors from Milestone 4 code were also fixed).
- `npm run lint`: 0 errors, 1 old warning in `TokenIcon.tsx` (react-refresh). The Milestone 4 lint errors were fixed.
- `npm run test`: 86 tests pass (79 existing + 7 new jail tests).
- Checked in headless Chrome at 1920×1080: roll → tumble → hop → purchase, jail states A–D, rent transfer, card flip, house → hotel, mortgage, GO mid-move, sent-to-jail bounce, trade transfer, bankruptcy → victory, and all four speed settings.

## Bug Fix 1 — Jail 3-roll limit (engine)

- `Player.jailTurnsUsed` (0–3). It resets on entering jail and on every release path.
- Each failed roll-for-double counts, including 6+6. A 6+6 still forces an immediate reroll (Rules §18), and that reroll is the next attempt.
- On the third miss the player is released and $50 is taken. The turn then waits on a new `jail-fine-applied` pending action (State D). `GameEngine.proceedAfterJailRelease` moves with that same roll. If that roll was 6+6, which never moves, it hands back a normal roll instead.
- If cash is under $50, the standard `bankruptcy-resolution` flow runs first. Its new optional `resumeAfter` field restores State D once `payObligation` settles the debt.

## Bug Fix 2 — Activity log

The log now lives in the left column under the action panel. The label stays pinned and only the list scrolls (`flex: 1; min-height: 0; overflow-y: auto`). It shows the full history, oldest first, and follows the newest entry. Scrollbars are thin and themed.

## Bug Fix 3 — Board ×2

- The frame is 2880×1620 and is scaled to fit the window (`useFrameScale`). The optional `frameScale` prop multiplies the fit scale (default 1).
- Board is 1560px with 208px corners. Tile fonts, buildings (house 9×9, hotel 12×18), tokens (18px), wordmark (96px) and dice (100px) match the spec.
- A 1560px board plus a top bar can't fit in 1620px with the old bottom bar, so the dice moved to the board centre and the log moved to the left panel, as in the UI reference. Side columns are 420px and use `zoom: 1.5` so their contents scale with the board.
- Tokens now sit on one layer over the board so they can travel between tiles.

## Milestone 5 — Animation

- Library: `motion` (Framer Motion). Multi-step sequences use `useAnimate`, awaited `animate()` calls and AnimatePresence exits. Movement starts from the dice's `onSettled` callback, not a timer.
- Every duration lives in `src/animation/config.ts` (`DURATIONS`, `ANIMATION_SPEED`). Motion reads the speed through `useAnimationTiming()`. CSS reads `--anim-scale`, which `AnimationProvider` sets from Settings: Slow 1.5, Normal 1, Fast 0.5, Off 0. **Off** is a new fourth option in Settings; it also sets `MotionGlobalConfig.skipAnimations`.
- The engine stays the source of truth. It updates immediately, and the UI catches up: token display positions, held receiver cash during transfers, and a kept "ghost" panel for an eliminated player until its collapse finishes.
- Sound hooks: new `AudioEvent`s (`special_double`, `pass_go`, `building_sold`, `mortgage`, `unmortgage`, `trade_completed`, `jail_release`) are emitted and remain silent.

## Other changes worth knowing

- Owner bars, tokens, panels and log dots are coloured by player **id**, not array index. Before, colours shifted after a bankruptcy removed a player.
- Log line added on elimination: "[PLAYER] has been eliminated."
- `PlayerPanel` had no CSS for name/cash/property count; styles added.
- Toasts moved to a bottom-right stack (`ToastStack`); the old top-centre `Toast` component was removed.

## Open items (not changed)

- `LiquidationModal`'s confirm text says assets "transfer to" the creditor. Rules §19 says everything goes to the Bank, which is what the engine does.
- `ActionPanel` has no content during `awaiting-purchase-decision` (the modal covers it). This predates Milestone 5.
