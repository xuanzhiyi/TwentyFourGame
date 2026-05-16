const SUITS = ['♠', '♥', '♦', '♣'];

interface Props {
  value: number | null;
  index: number;
  countdown?: 2 | 1 | null;
}

export default function NumberCard({ value, index, countdown }: Props) {
  const hidden = countdown !== null && countdown !== undefined && value !== null;
  const display = hidden ? '?' : (value?.toString() ?? '?');
  const suit = SUITS[index % 4];
  const isRed = index === 1 || index === 2;
  const colorClass = (value === null || hidden)
    ? (hidden ? 'text-brand-blue' : 'text-gray-300')
    : isRed ? 'text-red-600' : 'text-gray-900';

  return (
    <div
      className={`
        relative
        w-[42vw] max-w-[155px] aspect-[2/3]
        bg-white rounded-2xl
        border border-gray-200
        shadow-[0_6px_20px_rgba(0,0,0,0.18)]
        flex items-center justify-center
        select-none transition-all duration-300
        ${value === null ? 'opacity-30' : 'opacity-100'}
      `}
    >
      {/* Top-left pip */}
      <div className={`absolute top-2 left-2.5 flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-base font-bold leading-none">{display}</span>
        <span className="text-xs leading-none mt-0.5">{suit}</span>
      </div>

      {/* Center: number or countdown overlay */}
      <div className="flex flex-col items-center gap-1">
        {hidden ? (
          <span
            key={countdown}
            className="text-6xl font-bold text-brand-blue animate-ping-once"
            style={{ animation: 'countdownPop 0.35s ease-out' }}
          >
            {countdown}
          </span>
        ) : (
          <>
            <span className={`text-6xl font-bold ${colorClass}`}>{display}</span>
            <span className={`text-3xl opacity-20 ${colorClass}`}>{suit}</span>
          </>
        )}
      </div>

      {/* Bottom-right pip (rotated) */}
      <div className={`absolute bottom-2 right-2.5 flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="text-base font-bold leading-none">{display}</span>
        <span className="text-xs leading-none mt-0.5">{suit}</span>
      </div>
    </div>
  );
}
