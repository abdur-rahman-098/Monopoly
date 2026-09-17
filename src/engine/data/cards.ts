import type { Card } from '@/engine/models/types';

export const CHANCE_CARDS: Card[] = [
  {
    id: 'chance-01',
    deck: 'chance',
    text: 'Your startup gets acquired. Advance to GO and collect $200.',
    effect: { kind: 'move-to', destinationIndex: 0, collectGoIfPassed: true },
  },
  {
    id: 'chance-02',
    deck: 'chance',
    text: 'Penthouse living calls. Advance to Mayfair.',
    effect: { kind: 'move-to', destinationIndex: 39, collectGoIfPassed: true },
  },
  {
    id: 'chance-03',
    deck: 'chance',
    text: 'Meet the team at Trafalgar Square. Advance there; collect $200 if you pass GO.',
    effect: { kind: 'move-to', destinationIndex: 24, collectGoIfPassed: true },
  },
  {
    id: 'chance-04',
    deck: 'chance',
    text: "Catch a train. Advance to King's Cross Station.",
    effect: { kind: 'move-to', destinationIndex: 5, collectGoIfPassed: true },
  },
  {
    id: 'chance-05',
    deck: 'chance',
    text: 'A gallery opening awaits. Advance to Pall Mall; collect $200 if you pass GO.',
    effect: { kind: 'move-to', destinationIndex: 11, collectGoIfPassed: true },
  },
  {
    id: 'chance-06',
    deck: 'chance',
    text: 'Take the scenic route. Go back 3 spaces.',
    effect: { kind: 'move-relative', spaces: -3 },
  },
  {
    id: 'chance-07',
    deck: 'chance',
    text: 'Advance to the nearest station. If unowned you may buy it; if owned pay double the normal rent.',
    effect: { kind: 'move-to-nearest-station' },
  },
  {
    id: 'chance-08',
    deck: 'chance',
    text: 'Advance to the nearest station. If unowned you may buy it; if owned pay double the normal rent.',
    effect: { kind: 'move-to-nearest-station' },
  },
  {
    id: 'chance-09',
    deck: 'chance',
    text: 'Advance to the nearest utility. If unowned you may buy it; if owned pay ten times the dice total.',
    effect: { kind: 'move-to-nearest-utility' },
  },
  {
    id: 'chance-10',
    deck: 'chance',
    text: 'Caught jaywalking. Go directly to Jail. Do not pass GO, do not collect $200.',
    effect: { kind: 'go-to-jail' },
  },
  {
    id: 'chance-11',
    deck: 'chance',
    text: 'Your side hustle pays off. Collect $150.',
    effect: { kind: 'collect', amount: 150 },
  },
  {
    id: 'chance-12',
    deck: 'chance',
    text: 'Parking fine. Pay $15.',
    effect: { kind: 'pay', amount: 15 },
  },
  {
    id: 'chance-13',
    deck: 'chance',
    text: 'Emergency plumber call-out. Pay $100.',
    effect: { kind: 'pay', amount: 100 },
  },
  {
    id: 'chance-14',
    deck: 'chance',
    text: 'Speeding fine. Pay $50.',
    effect: { kind: 'pay', amount: 50 },
  },
  {
    id: 'chance-15',
    deck: 'chance',
    text: "It's your birthday! Collect $50 from every other player.",
    effect: { kind: 'collect-from-each', amount: 50 },
  },
  {
    id: 'chance-16',
    deck: 'chance',
    text: 'A favour is owed to you. Get Out of Jail Free.',
    effect: { kind: 'get-out-of-jail-free' },
  },
];

export const COMMUNITY_CHEST_CARDS: Card[] = [
  {
    id: 'community-chest-01',
    deck: 'community-chest',
    text: 'Community grant approved. Advance to GO and collect $200.',
    effect: { kind: 'move-to', destinationIndex: 0, collectGoIfPassed: true },
  },
  {
    id: 'community-chest-02',
    deck: 'community-chest',
    text: 'Jaywalking ticket ignored too long. Go directly to Jail.',
    effect: { kind: 'go-to-jail' },
  },
  {
    id: 'community-chest-03',
    deck: 'community-chest',
    text: 'Bank error in your favour. Collect $200.',
    effect: { kind: 'collect', amount: 200 },
  },
  {
    id: 'community-chest-04',
    deck: 'community-chest',
    text: "Doctor's fee. Collect $100.",
    effect: { kind: 'collect', amount: 100 },
  },
  {
    id: 'community-chest-05',
    deck: 'community-chest',
    text: 'You sell some old furniture. Collect $50.',
    effect: { kind: 'collect', amount: 50 },
  },
  {
    id: 'community-chest-06',
    deck: 'community-chest',
    text: 'Recycling rebate. Collect $25.',
    effect: { kind: 'collect', amount: 25 },
  },
  {
    id: 'community-chest-07',
    deck: 'community-chest',
    text: 'Library fine refunded in error. Collect $20.',
    effect: { kind: 'collect', amount: 20 },
  },
  {
    id: 'community-chest-08',
    deck: 'community-chest',
    text: 'Lottery ticket pays out. Collect $10.',
    effect: { kind: 'collect', amount: 10 },
  },
  {
    id: 'community-chest-09',
    deck: 'community-chest',
    text: 'School fees due. Pay $50.',
    effect: { kind: 'pay', amount: 50 },
  },
  {
    id: 'community-chest-10',
    deck: 'community-chest',
    text: 'Consultancy fee due. Pay $100.',
    effect: { kind: 'pay', amount: 100 },
  },
  {
    id: 'community-chest-11',
    deck: 'community-chest',
    text: 'Hospital fees. Pay $150.',
    effect: { kind: 'pay', amount: 150 },
  },
  {
    id: 'community-chest-12',
    deck: 'community-chest',
    text: "It's your birthday! Collect $50 from every other player.",
    effect: { kind: 'collect-from-each', amount: 50 },
  },
  {
    id: 'community-chest-13',
    deck: 'community-chest',
    text: 'Street repairs assessment. Pay $40 per house and $115 per hotel you own.',
    effect: { kind: 'pay-per-building', houseAmount: 40, hotelAmount: 115 },
  },
  {
    id: 'community-chest-14',
    deck: 'community-chest',
    text: 'You win second prize in a beauty contest. Collect $10 from every other player.',
    effect: { kind: 'collect-from-each', amount: 10 },
  },
  {
    id: 'community-chest-15',
    deck: 'community-chest',
    text: 'Life insurance matures. Collect $100.',
    effect: { kind: 'collect', amount: 100 },
  },
  {
    id: 'community-chest-16',
    deck: 'community-chest',
    text: 'A friend clears your record. Get Out of Jail Free.',
    effect: { kind: 'get-out-of-jail-free' },
  },
];
