import { Button } from '@/components/shared/Button';
import styles from './HowToPlay.module.css';

const SECTIONS = [
  {
    title: 'Objective',
    body: 'Be the last player standing. Buy properties, collect rent from your opponents, and build houses and hotels to increase your income. Drive your opponents into bankruptcy to win.',
  },
  {
    title: 'Taking Turns',
    body: 'On your turn, roll the dice and move your token clockwise around the board. After landing, resolve the space (buy property, pay rent, draw a card, etc.) then take any strategic actions before ending your turn.',
  },
  {
    title: 'Buying Property',
    body: 'When you land on an unowned property, you may buy it for the listed price. If you decline, the property remains available for the next player to land on it. Own all properties in a colour group to unlock building.',
  },
  {
    title: 'Rent',
    body: 'When you land on a property owned by another player, you must pay rent. Rent increases with houses and hotels. Properties in a complete colour group charge double base rent even without buildings. Mortgaged properties charge no rent.',
  },
  {
    title: 'Building',
    body: 'Once you own all properties in a colour group, you may build houses (up to 4) and then a hotel on each property. Houses must be built evenly across the group. Buildings increase rent dramatically.',
  },
  {
    title: 'Mortgages & Trading',
    body: 'You may mortgage properties to raise cash (receiving the mortgage value). Mortgaged properties earn no rent. Unmortgage by paying the same amount. Trade properties, cash, and Get Out of Jail Free cards with other players at any time.',
  },
  {
    title: 'Jail',
    body: 'Go directly to Jail by landing on the Go To Jail space or drawing a card. To leave, roll doubles, pay a $50 fine, or use a Get Out of Jail Free card. You may still collect rent and trade while in Jail.',
  },
  {
    title: 'Bankruptcy',
    body: 'If you cannot pay a debt (rent, tax, or card effect), you must sell buildings and mortgage properties to raise funds. If your total assets are still insufficient, you are eliminated and your properties return to the Bank.',
  },
];

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className="text-h1" style={{ color: 'var(--colour-text)', marginBottom: 32 }}>How to Play</h1>

        <div className={styles.sections}>
          {SECTIONS.map((section, i) => (
            <div key={i} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onBack}>
            BACK
          </Button>
        </div>
      </div>
    </div>
  );
}
