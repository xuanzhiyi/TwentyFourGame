import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NumberCard from '../../components/NumberCard';
import PlayerList from '../../components/PlayerList';

interface Player {
  id: string;
  name: string;
}

interface RoomState {
  players: Player[];
  numbers: number[] | null;
  solutions: string[];
  buzzedById: string | null;
  buzzedByName: string | null;
}

export default function RoomPage() {
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  const [myId, setMyId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const roomId = router.query.id as string;
    const playerName = (router.query.name as string) || 'Anonymous';

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'JOIN', roomId, playerName }));
    };

    ws.onmessage = e => {
      const msg = JSON.parse(e.data as string);
      if (msg.type === 'YOUR_ID') {
        setMyId(msg.id);
      } else if (msg.type === 'ROOM_STATE') {
        setRoomState(msg as RoomState);
        // Hide solutions panel when state resets (new round / generate)
        if (!msg.buzzedById) setShowSolutions(false);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };

    ws.onerror = () => ws.close();

    return () => ws.close();
  }, [router.isReady, router.query.id, router.query.name]);

  const send = (payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const handleShowSolutions = () => {
    send({ type: 'SHOW_SOLUTIONS' });
    setShowSolutions(true);
  };

  if (!connected) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-2xl font-semibold mb-2">Disconnected</p>
          <p className="text-sm mb-6">Lost connection to the server.</p>
          <button
            onClick={() => router.reload()}
            className="bg-brand-blue text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-900 transition-colors"
          >
            Reconnect
          </button>
        </div>
      </main>
    );
  }

  if (!roomState) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Connecting…</p>
      </main>
    );
  }

  const roomId = router.query.id as string;
  const hasBuzzed = roomState.buzzedById !== null;
  const iAmBuzzer = roomState.buzzedById === myId;
  const canBuzz = roomState.numbers !== null && !hasBuzzed;
  const canShowSolutions = roomState.numbers !== null && !showSolutions;

  return (
    <>
      <Head>
        <title>24 Game — {roomId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex flex-col items-center gap-6 p-4 md:p-8 pb-10">
        {/* Header */}
        <div className="w-full max-w-lg flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            ← Home
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-blue leading-none">24 Game</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Room</p>
            <p className="font-mono font-bold text-brand-blue tracking-widest text-lg">{roomId}</p>
          </div>
        </div>

        {/* Player list */}
        <PlayerList
          players={roomState.players}
          buzzedById={roomState.buzzedById}
          myId={myId}
        />

        {/* Number cards */}
        <div className="flex gap-3 md:gap-5 my-2">
          {(roomState.numbers ?? [null, null, null, null]).map((n, i) => (
            <NumberCard key={i} value={n} />
          ))}
        </div>

        {/* Buzz banner */}
        {hasBuzzed && (
          <div className={`
            w-full max-w-lg rounded-2xl py-4 px-6 text-center text-xl font-bold transition-all
            ${iAmBuzzer
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}
          `}>
            {iAmBuzzer ? '🔔 You buzzed first!' : `🔔 ${roomState.buzzedByName} buzzed first!`}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => send({ type: 'GENERATE' })}
            className="px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:bg-blue-900 active:scale-95 transition-all"
          >
            Generate
          </button>

          {/* Big red Buzz button */}
          <button
            onClick={() => send({ type: 'BUZZ' })}
            disabled={!canBuzz}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg transition-all duration-150
              ${canBuzz
                ? 'bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-lg cursor-pointer'
                : iAmBuzzer
                ? 'bg-red-500 text-white cursor-default'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'}
            `}
          >
            {iAmBuzzer ? 'You Buzzed!' : hasBuzzed ? 'Buzzed' : 'Buzz! 🔔'}
          </button>

          {canShowSolutions && (
            <button
              onClick={handleShowSolutions}
              className="px-6 py-3 border-2 border-brand-blue text-brand-blue rounded-xl font-semibold hover:bg-brand-light active:scale-95 transition-all"
            >
              Show Solutions
            </button>
          )}

          {hasBuzzed && (
            <button
              onClick={() => send({ type: 'NEXT_ROUND' })}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 active:scale-95 transition-all"
            >
              Next Round
            </button>
          )}
        </div>

        {/* Solutions */}
        {showSolutions && (
          <div className="w-full max-w-lg">
            <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-2">
              Solutions
            </h2>
            {roomState.solutions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No solution exists for these numbers.</p>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {roomState.solutions.map((s, i) => (
                  <p key={i} className="px-4 py-2 font-mono text-sm text-gray-700">
                    {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invite hint */}
        {roomState.players.length < 4 && (
          <p className="text-gray-400 text-xs text-center mt-auto">
            Share room code <span className="font-mono font-bold text-brand-blue">{roomId}</span> with friends to join
          </p>
        )}
      </main>
    </>
  );
}
