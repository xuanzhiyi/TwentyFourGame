const SUITS = ['♠', '♥', '♦', '♣'];

interface Props {
  value: number | null;
  index: number;
  phase?: 'hidden' | 'flipping' | 'idle';
}

export default function NumberCard({ value, index, phase = 'idle' }: Props) {
  const suit = SUITS[index % 4];
  const isRed = index === 1 || index === 2;
  const numColor = isRed ? 'text-red-600' : 'text-gray-900';
  const emptyColor = 'text-gray-300';

  const isHidden = phase === 'hidden' || phase === 'flipping';

  // Outer card shell — always visible, provides shadow/border
  return (
    <div
      className={`
        relative
        w-[42vw] max-w-[155px] aspect-[2/3]
        select-none
        ${value === null ? 'opacity-30' : 'opacity-100'}
      `}
      style={{ perspective: '600px' }}
    >
      {/* Inner flipper — rotates on reveal */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          animation: phase === 'flipping' ? 'cardFlip 0.55s ease-in-out forwards' : undefined,
          transform: phase === 'idle' && value !== null ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: phase === 'idle' ? undefined : undefined,
        }}
      >
        {/* Front face — shows "?" */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-[0_6px_20px_rgba(0,0,0,0.18)] flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`absolute top-2 left-2.5 flex flex-col items-center leading-none ${emptyColor}`}>
            <span className="text-base font-bold leading-none">?</span>
            <span className="text-xs leading-none mt-0.5">{suit}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={`text-6xl font-bold ${emptyColor}`}>?</span>
            <span className={`text-3xl opacity-20 ${emptyColor}`}>{suit}</span>
          </div>
          <div className={`absolute bottom-2 right-2.5 flex flex-col items-center leading-none rotate-180 ${emptyColor}`}>
            <span className="text-base font-bold leading-none">?</span>
            <span className="text-xs leading-none mt-0.5">{suit}</span>
          </div>
        </div>

        {/* Back face — shows the actual number */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-[0_6px_20px_rgba(0,0,0,0.18)] flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {value !== null && (
            <>
              <div className={`absolute top-2 left-2.5 flex flex-col items-center leading-none ${numColor}`}>
                <span className="text-base font-bold leading-none">{value}</span>
                <span className="text-xs leading-none mt-0.5">{suit}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-6xl font-bold ${numColor}`}>{value}</span>
                <span className={`text-3xl opacity-20 ${numColor}`}>{suit}</span>
              </div>
              <div className={`absolute bottom-2 right-2.5 flex flex-col items-center leading-none rotate-180 ${numColor}`}>
                <span className="text-base font-bold leading-none">{value}</span>
                <span className="text-xs leading-none mt-0.5">{suit}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
