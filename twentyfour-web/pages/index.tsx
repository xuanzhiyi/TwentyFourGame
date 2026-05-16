import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) { setError('Please enter your name.'); return false; }
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    router.push(`/room/${generateRoomId()}?name=${encodeURIComponent(name.trim())}`);
  };

  const handleJoin = () => {
    if (!validate()) return;
    if (!roomCode.trim()) { setError('Please enter a room code.'); return; }
    router.push(`/room/${roomCode.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  };

  const clearError = () => setError('');

  return (
    <>
      <Head>
        <title>24 Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-brand-blue">24</h1>
          <p className="text-2xl font-semibold text-gray-600 mt-1">Game</p>
          <p className="text-gray-400 mt-3 text-sm">
            Use&nbsp;+&nbsp;&minus;&nbsp;&times;&nbsp;&divide;&nbsp;on all four numbers to make&nbsp;24
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4">
          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="Your name"
            value={name}
            maxLength={20}
            onChange={e => { setName(e.target.value); clearError(); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />

          <button
            onClick={handleCreate}
            className="bg-brand-blue text-white rounded-xl py-3 font-semibold text-lg hover:bg-blue-900 active:scale-95 transition-all"
          >
            Create Room
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or join</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-center text-lg uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="Room code"
            value={roomCode}
            maxLength={6}
            onChange={e => { setRoomCode(e.target.value.toUpperCase()); clearError(); }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />

          <button
            onClick={handleJoin}
            className="border-2 border-brand-blue text-brand-blue rounded-xl py-3 font-semibold text-lg hover:bg-brand-light active:scale-95 transition-all"
          >
            Join Room
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </main>
    </>
  );
}
