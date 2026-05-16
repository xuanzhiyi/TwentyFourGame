'use strict';

const { solve } = require('./solver');

// Map<roomId, Room>
const rooms = new Map();

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generatePlayerId() {
  return Math.random().toString(36).slice(2, 10);
}

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      players: new Map(),   // ws → { id, name }
      numbers: null,
      solutions: [],
      buzzedById: null,
      buzzedByName: null,
      cleanupTimeout: null,
    });
  }
  return rooms.get(roomId);
}

function buildRoomState(room) {
  return {
    type: 'ROOM_STATE',
    players: [...room.players.values()],
    numbers: room.numbers,
    solutions: room.solutions,
    buzzedById: room.buzzedById,
    buzzedByName: room.buzzedByName,
  };
}

function broadcast(room, payload) {
  const msg = JSON.stringify(payload);
  for (const [ws] of room.players) {
    if (ws.readyState === 1 /* OPEN */) ws.send(msg);
  }
}

function send(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

function scheduleCleanup(room) {
  if (room.cleanupTimeout) clearTimeout(room.cleanupTimeout);
  room.cleanupTimeout = setTimeout(() => {
    if (room.players.size === 0) rooms.delete(room.id);
  }, 60_000);
}

function cancelCleanup(room) {
  if (room.cleanupTimeout) {
    clearTimeout(room.cleanupTimeout);
    room.cleanupTimeout = null;
  }
}

function findRoomByWs(ws) {
  for (const [, room] of rooms) {
    if (room.players.has(ws)) return room;
  }
  return null;
}

function handleMessage(ws, rawData) {
  let msg;
  try { msg = JSON.parse(rawData); } catch { return; }

  if (msg.type === 'JOIN') {
    const room = getOrCreateRoom(msg.roomId);
    cancelCleanup(room);
    const playerId = generatePlayerId();
    room.players.set(ws, { id: playerId, name: String(msg.playerName || 'Anonymous').slice(0, 20) });
    send(ws, { type: 'YOUR_ID', id: playerId });
    broadcast(room, buildRoomState(room));
    return;
  }

  const room = findRoomByWs(ws);
  if (!room) return;

  switch (msg.type) {
    case 'GENERATE': {
      room.numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 1);
      room.solutions = [];
      room.buzzedById = null;
      room.buzzedByName = null;
      broadcast(room, buildRoomState(room));
      break;
    }

    case 'BUZZ': {
      if (!room.numbers) return;
      if (room.buzzedById !== null) return; // first arrival wins
      const buzzer = room.players.get(ws);
      if (!buzzer) return;
      room.buzzedById = buzzer.id;
      room.buzzedByName = buzzer.name;
      broadcast(room, buildRoomState(room));
      break;
    }

    case 'SHOW_SOLUTIONS': {
      if (!room.numbers) return;
      room.solutions = solve(room.numbers);
      broadcast(room, buildRoomState(room));
      break;
    }

    case 'NEXT_ROUND': {
      room.numbers = null;
      room.solutions = [];
      room.buzzedById = null;
      room.buzzedByName = null;
      broadcast(room, buildRoomState(room));
      break;
    }
  }
}

function handleDisconnect(ws) {
  for (const [, room] of rooms) {
    if (!room.players.has(ws)) continue;
    const player = room.players.get(ws);
    room.players.delete(ws);

    // Clear buzz if the buzzer disconnected so the game isn't stuck
    if (room.buzzedById === player.id) {
      room.buzzedById = null;
      room.buzzedByName = null;
    }

    if (room.players.size === 0) {
      scheduleCleanup(room);
    } else {
      broadcast(room, buildRoomState(room));
    }
    break;
  }
}

module.exports = { handleMessage, handleDisconnect, generateRoomId };
