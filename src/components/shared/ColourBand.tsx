import styles from './ColourBand.module.css';

interface ColourBandProps {
  colour: string;
  direction?: 'horizontal' | 'vertical';
}

export function ColourBand({ colour, direction = 'horizontal' }: ColourBandProps) {
  return (
    <div
      className={direction === 'horizontal' ? styles.horizontal : styles.vertical}
      style={{ background: colour }}
    />
  );
}
