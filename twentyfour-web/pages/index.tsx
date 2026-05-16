import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../lib/useLang';

const NAME_KEY = 'playerName';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Home() {
  const router = useRouter();
  const [t, toggleLang] = useLang();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) setName(saved);
  }, []);

  const saveName = (n: string) => localStorage.setItem(NAME_KEY, n);

  const validate = () => {
    if (!name.trim()) { setError(t.errNoName); return false; }
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    saveName(name.trim());
    router.push(`/room/${generateRoomId()}?name=${encodeURIComponent(name.trim())}`);
  };

  const handleJoin = () => {
    if (!validate()) return;
    if (!roomCode.trim()) { setError(t.errNoRoom); return; }
    saveName(name.trim());
    router.push(`/room/${roomCode.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <>
      <Head>
        <title>{t.appTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
        {/* Lang toggle */}
        <button
          onClick={toggleLang}
          className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-brand-blue border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
        >
          {t.langToggle}
        </button>

        <div className="text-center">
          <h1 className="text-6xl font-bold text-brand-blue">24</h1>
          <p className="text-2xl font-semibold text-gray-600 mt-1">{t.subtitle}</p>
          <p className="text-gray-400 mt-3 text-sm">{t.tagline}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4">
          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder={t.yourName}
            value={name}
            maxLength={20}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />

          <button
            onClick={handleCreate}
            className="bg-brand-blue text-white rounded-xl py-3 font-semibold text-lg hover:bg-blue-900 active:scale-95 transition-all"
          >
            {t.createRoom}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">{t.orJoin}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-center text-lg uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder={t.roomCode}
            value={roomCode}
            maxLength={6}
            onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />

          <button
            onClick={handleJoin}
            className="border-2 border-brand-blue text-brand-blue rounded-xl py-3 font-semibold text-lg hover:bg-brand-light active:scale-95 transition-all"
          >
            {t.joinRoom}
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </main>
    </>
  );
}
