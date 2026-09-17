import { useState } from 'react';
import { GameEngine } from '@/engine';
import type { CardDeckType, GameState, PlayerId, TradeProposal } from '@/engine';

export function useGameState(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);

  function run(fn: (s: GameState) => GameState) {
    setState((s) => {
      try {
        return fn(s);
      } catch (err) {
        console.error(err);
        return s;
      }
    });
  }

  const actions = {
    rollDice: () => run((s) => GameEngine.rollDice(s)),
    movePlayer: (playerId: PlayerId, spaces: number) => run((s) => GameEngine.movePlayer(playerId, spaces, s)),
    resolveLanding: () => run((s) => GameEngine.resolveLanding(s)),
    confirmPurchase: (propertyId: string) => run((s) => GameEngine.confirmPurchase(propertyId, s)),
    declinePurchase: () => run((s) => GameEngine.declinePurchase(s)),
    payRent: () => run((s) => GameEngine.payRent(s)),
    payTax: () => run((s) => GameEngine.payTax(s)),
    endTurn: () => run((s) => GameEngine.endTurn(s)),

    // Cards
    drawCard: () => run((s) => GameEngine.drawCardForCurrentSpace(s)),
    resolveCard: () => run((s) => GameEngine.resolveDrawnCard(s)),

    // Jail
    rollForJailEscape: () => run((s) => GameEngine.rollForJailEscape(s)),
    payJailFine: () => run((s) => GameEngine.payJailFine(s)),
    proceedAfterJailRelease: () => run((s) => GameEngine.proceedAfterJailRelease(s)),
    // GameEngine.useGoojfCard is a static method, not a React hook — its name
    // only coincidentally matches the `use*` convention.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGoojfCard: (deckType?: CardDeckType) => run((s) => GameEngine.useGoojfCard(s, deckType)),

    // Building
    buildHouse: (propertyId: string) => run((s) => GameEngine.buyHouse(propertyId, s)),
    buildHotel: (propertyId: string) => run((s) => GameEngine.upgradeToHotel(propertyId, s)),
    sellHouse: (propertyId: string) => run((s) => GameEngine.sellHouse(propertyId, s)),
    sellHotel: (propertyId: string) => run((s) => GameEngine.sellHotel(propertyId, s)),

    // Mortgages
    mortgageProperty: (propertyId: string) => run((s) => GameEngine.mortgageProperty(propertyId, s)),
    unmortgageProperty: (propertyId: string) => run((s) => GameEngine.unmortgageProperty(propertyId, s)),

    // Trading
    proposeTrade: (proposal: Omit<TradeProposal, 'id' | 'status'>) =>
      run((s) => GameEngine.proposeTrade(proposal, s)),
    acceptTrade: (tradeId: string) => run((s) => GameEngine.acceptTrade(tradeId, s)),
    rejectTrade: (tradeId: string) => run((s) => GameEngine.rejectTrade(tradeId, s)),

    // Bankruptcy / liquidation
    payObligation: () => run((s) => GameEngine.payObligation(s)),
    declareBankruptcy: (playerId: PlayerId) => run((s) => GameEngine.declareBankruptcy(playerId, s)),
  };

  return { state, actions };
}
