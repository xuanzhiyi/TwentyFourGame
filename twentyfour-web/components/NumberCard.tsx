interface Props {
  value: number | null;
}

export default function NumberCard({ value }: Props) {
  return (
    <div
      className={`
        w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
        flex items-center justify-center
        rounded-2xl border-2 border-brand-blue
        bg-white shadow-md
        text-5xl sm:text-6xl font-bold text-brand-blue
        select-none transition-all duration-300
        ${value === null ? 'opacity-30' : 'opacity-100'}
      `}
    >
      {value ?? '?'}
    </div>
  );
}
