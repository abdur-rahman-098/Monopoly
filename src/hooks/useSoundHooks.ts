export interface SoundHooks {
  onDiceRoll: () => void;
  onTokenStep: () => void;
  onPropertyBought: () => void;
  onRentPaid: () => void;
  onTaxPaid: () => void;
  onPassGo: () => void;
  onCardDrawn: () => void;
  onSentToJail: () => void;
  onBankruptcy: () => void;
  onVictory: () => void;
}

export function useSoundHooks(): SoundHooks {
  return {
    onDiceRoll: () => {
      /* stub */
    },
    onTokenStep: () => {
      /* stub */
    },
    onPropertyBought: () => {
      /* stub */
    },
    onRentPaid: () => {
      /* stub */
    },
    onTaxPaid: () => {
      /* stub */
    },
    onPassGo: () => {
      /* stub */
    },
    onCardDrawn: () => {
      /* stub */
    },
    onSentToJail: () => {
      /* stub */
    },
    onBankruptcy: () => {
      /* stub */
    },
    onVictory: () => {
      /* stub */
    },
  };
}
