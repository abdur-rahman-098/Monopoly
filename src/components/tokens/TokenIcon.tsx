import styles from './TokenIcon.module.css';

export const TOKEN_LIST = [
  { id: 'key', name: 'The Key' },
  { id: 'watch', name: 'The Watch' },
  { id: 'tower', name: 'The Tower' },
  { id: 'yacht', name: 'The Yacht' },
  { id: 'case', name: 'The Case' },
  { id: 'ring', name: 'The Ring' },
  { id: 'car', name: 'The Car' },
  { id: 'crown', name: 'The Crown' },
] as const;

export type TokenId = (typeof TOKEN_LIST)[number]['id'];

interface TokenIconProps {
  tokenId: string;
  colour: string;
  size?: number;
}

export function TokenIcon({ tokenId, colour, size = 64 }: TokenIconProps) {
  const s = size;
  const half = s / 2;

  return (
    <svg
      className={styles.icon}
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {tokenId === 'key' && (
        <>
          <circle cx={half} cy={s * 0.3} r={s * 0.15} stroke={colour} strokeWidth={2} fill="none" />
          <line x1={half} y1={s * 0.45} x2={half} y2={s * 0.85} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={s * 0.7} x2={half + s * 0.1} y2={s * 0.7} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={s * 0.8} x2={half + s * 0.1} y2={s * 0.8} stroke={colour} strokeWidth={2} />
        </>
      )}
      {tokenId === 'watch' && (
        <>
          <circle cx={half} cy={half} r={s * 0.28} stroke={colour} strokeWidth={2} fill="none" />
          <line x1={half} y1={half} x2={half} y2={half - s * 0.18} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={half} x2={half + s * 0.12} y2={half + s * 0.05} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={s * 0.22 - s * 0.08} x2={half} y2={s * 0.22} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={s * 0.78} x2={half} y2={s * 0.78 + s * 0.08} stroke={colour} strokeWidth={2} />
        </>
      )}
      {tokenId === 'tower' && (
        <>
          <rect x={half - s * 0.08} y={s * 0.15} width={s * 0.16} height={s * 0.55} stroke={colour} strokeWidth={2} fill="none" />
          <rect x={half - s * 0.15} y={s * 0.7} width={s * 0.3} height={s * 0.12} stroke={colour} strokeWidth={2} fill="none" />
          <line x1={half - s * 0.12} y1={s * 0.15} x2={half - s * 0.12} y2={s * 0.22} stroke={colour} strokeWidth={2} />
          <line x1={half + s * 0.12} y1={s * 0.15} x2={half + s * 0.12} y2={s * 0.22} stroke={colour} strokeWidth={2} />
          <line x1={half} y1={s * 0.15} x2={half} y2={s * 0.08} stroke={colour} strokeWidth={2} />
        </>
      )}
      {tokenId === 'yacht' && (
        <>
          <path d={`M${half - s * 0.25} ${s * 0.6} Q${half} ${s * 0.7} ${half + s * 0.25} ${s * 0.6}`} stroke={colour} strokeWidth={2} fill="none" />
          <line x1={half} y1={s * 0.2} x2={half} y2={s * 0.6} stroke={colour} strokeWidth={2} />
          <path d={`M${half} ${s * 0.2} L${half + s * 0.2} ${s * 0.45} L${half} ${s * 0.45} Z`} stroke={colour} strokeWidth={1.5} fill={colour} fillOpacity={0.2} />
        </>
      )}
      {tokenId === 'case' && (
        <>
          <rect x={half - s * 0.22} y={s * 0.35} width={s * 0.44} height={s * 0.35} rx={3} stroke={colour} strokeWidth={2} fill="none" />
          <path d={`M${half - s * 0.1} ${s * 0.35} V${s * 0.28} A${s * 0.1} ${s * 0.1} 0 0 1 ${half + s * 0.1} ${s * 0.28} V${s * 0.35}`} stroke={colour} strokeWidth={2} fill="none" />
          <line x1={half - s * 0.22} y1={s * 0.52} x2={half + s * 0.22} y2={s * 0.52} stroke={colour} strokeWidth={1.5} />
        </>
      )}
      {tokenId === 'ring' && (
        <>
          <circle cx={half} cy={s * 0.32} r={s * 0.1} stroke={colour} strokeWidth={2} fill={colour} fillOpacity={0.3} />
          <ellipse cx={half} cy={s * 0.58} rx={s * 0.16} ry={s * 0.2} stroke={colour} strokeWidth={2} fill="none" />
        </>
      )}
      {tokenId === 'car' && (
        <>
          <rect x={half - s * 0.25} y={s * 0.4} width={s * 0.5} height={s * 0.2} rx={3} stroke={colour} strokeWidth={2} fill="none" />
          <path d={`M${half - s * 0.12} ${s * 0.4} L${half - s * 0.06} ${s * 0.28} H${half + s * 0.14} L${half + s * 0.2} ${s * 0.4}`} stroke={colour} strokeWidth={2} fill="none" />
          <circle cx={half - s * 0.15} cy={s * 0.62} r={s * 0.05} stroke={colour} strokeWidth={2} fill="none" />
          <circle cx={half + s * 0.15} cy={s * 0.62} r={s * 0.05} stroke={colour} strokeWidth={2} fill="none" />
        </>
      )}
      {tokenId === 'crown' && (
        <>
          <path
            d={`M${half - s * 0.22} ${s * 0.6} L${half - s * 0.22} ${s * 0.3} L${half - s * 0.1} ${s * 0.42} L${half} ${s * 0.22} L${half + s * 0.1} ${s * 0.42} L${half + s * 0.22} ${s * 0.3} L${half + s * 0.22} ${s * 0.6} Z`}
            stroke={colour}
            strokeWidth={2}
            fill={colour}
            fillOpacity={0.15}
          />
          <line x1={half - s * 0.22} y1={s * 0.65} x2={half + s * 0.22} y2={s * 0.65} stroke={colour} strokeWidth={2} />
        </>
      )}
    </svg>
  );
}
