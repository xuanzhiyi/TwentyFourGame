interface Player {
  id: string;
  name: string;
}

interface Props {
  players: Player[];
  buzzedById: string | null;
  myId: string | null;
  meLabel: string;
  buzzedTag: string;
}

export default function PlayerList({ players, buzzedById, myId, meLabel, buzzedTag }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {players.map(p => {
        const isBuzzer = p.id === buzzedById;
        const isMe = p.id === myId;
        return (
          <div
            key={p.id}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
              ${isBuzzer
                ? 'bg-yellow-400 border-yellow-500 text-yellow-900 font-bold ring-2 ring-yellow-300 scale-105'
                : isMe
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-gray-700 border-gray-300'}
            `}
          >
            {p.name}
            {isMe && !isBuzzer && meLabel}
            {isBuzzer && ` ${buzzedTag}`}
          </div>
        );
      })}
    </div>
  );
}
