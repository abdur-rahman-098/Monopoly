export type AudioEvent =
  | 'dice_roll'
  | 'token_move_step'
  | 'property_purchase'
  | 'rent_payment'
  | 'house_placed'
  | 'hotel_upgrade'
  | 'card_drawn'
  | 'sent_to_jail'
  | 'bankruptcy'
  | 'victory'
  | 'special_double'
  | 'pass_go'
  | 'building_sold'
  | 'mortgage'
  | 'unmortgage'
  | 'trade_completed'
  | 'jail_release';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function emit(_event: AudioEvent): void {
  // Hook point only — sound is Milestone 6+ (Game_design.md §36). Stays silent.
}
