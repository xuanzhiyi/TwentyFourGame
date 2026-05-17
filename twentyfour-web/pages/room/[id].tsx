import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NumberCard from '../../components/NumberCard';
import PlayerList from '../../components/PlayerList';
import { useLang } from '../../lib/useLang';

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
  const [t, toggleLang] = useLang();
  const wsRef = useRef<WebSocket | null>(null);

  const [myId, setMyId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [countdown, setCountdown] = useState<2 | 1 | null>(null);
  const prevNumbersRef = useRef<number[] | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const roomId = router.query.id as string;
    const playerName =
      (router.query.name as string) ||
      (typeof window !== 'undefined' ? localStorage.getItem('playerName') : null) ||
      'Anonymous';

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
        const newState = msg as RoomState;
        const prev = prevNumbersRef.current;
        const isNewNumbers =
          newState.numbers !== null &&
          JSON.stringify(newState.numbers) !== JSON.stringify(prev);
        prevNumbersRef.current = newState.numbers;
        setRoomState(newState);
        if (isNewNumbers) {
          setShowSolutions(false);
          setCountdown(2);
          setTimeout(() => setCountdown(1), 1000);
          setTimeout(() => setCountdown(null), 2000);
        }
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
          <p className="text-2xl font-semibold mb-2">{t.disconnected}</p>
          <p className="text-sm mb-6">{t.lostConnection}</p>
          <button
            onClick={() => router.reload()}
            className="bg-brand-blue text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-900 transition-colors"
          >
            {t.reconnect}
          </button>
        </div>
      </main>
    );
  }

  if (!roomState) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">{t.connecting}</p>
      </main>
    );
  }

  const roomId = router.query.id as string;
  const hasBuzzed = roomState.buzzedById !== null;
  const iAmBuzzer = roomState.buzzedById === myId;
  const canBuzz = roomState.numbers !== null && !hasBuzzed && countdown === null;
  const canShowSolutions = roomState.numbers !== null && !showSolutions && countdown === null;

  return (
    <>
      <Head>
        <title>{t.appTitle} — {roomId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <span
            key={countdown}
            className="text-[36vw] md:text-[20vw] font-black text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            style={{ animation: 'countdownPop 0.9s ease-out forwards' }}
          >
            {countdown}
          </span>
        </div>
      )}

      <main className="min-h-screen flex flex-col items-center gap-3 p-4 pb-8">
        {/* Header */}
        <div className="w-full max-w-lg flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            {t.home}
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-blue leading-none">{t.appTitle}</h1>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <p className="font-mono font-bold text-brand-blue tracking-widest text-sm">
              {t.roomLabel} {roomId}
            </p>
            <button
              onClick={toggleLang}
              className="text-xs font-semibold text-gray-400 hover:text-brand-blue border border-gray-200 rounded-lg px-2 py-0.5 transition-colors"
            >
              {t.langToggle}
            </button>
          </div>
        </div>

        {/* Player list */}
        <PlayerList
          players={roomState.players}
          buzzedById={roomState.buzzedById}
          myId={myId}
          meLabel={t.me}
          buzzedTag={t.buzzedTag}
        />

        {/* Number cards — 2×2 poker-card grid */}
        <div className="grid grid-cols-2 gap-3">
          {(roomState.numbers ?? [null, null, null, null]).map((n, i) => (
            <NumberCard key={i} value={n} index={i} hidden={countdown !== null} />
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
            {iAmBuzzer ? t.youBuzzed : t.buzzedFirst(roomState.buzzedByName ?? '')}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => send({ type: 'GENERATE' })}
            className="px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:bg-blue-900 active:scale-95 transition-all"
          >
            {t.generate}
          </button>

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
            {iAmBuzzer ? t.youBuzzedBtn : hasBuzzed ? t.buzzedBtn : t.buzzBtn}
          </button>

          {canShowSolutions && (
            <button
              onClick={handleShowSolutions}
              className="px-6 py-3 border-2 border-brand-blue text-brand-blue rounded-xl font-semibold hover:bg-brand-light active:scale-95 transition-all"
            >
              {t.showSolutions}
            </button>
          )}

          {hasBuzzed && (
            <button
              onClick={() => send({ type: 'NEXT_ROUND' })}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 active:scale-95 transition-all"
            >
              {t.nextRound}
            </button>
          )}
        </div>

        {/* Solutions */}
        {showSolutions && (
          <div className="w-full max-w-lg">
            <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-2">
              {t.solutionsTitle}
            </h2>
            {roomState.solutions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t.noSolution}</p>
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
            {t.inviteHint(roomId)}
          </p>
        )}
      </main>
    </>
  );
}
