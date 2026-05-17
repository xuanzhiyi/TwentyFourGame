'use strict';

const http = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { handleMessage, handleDisconnect } = require('./lib/rooms');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  // noServer so we control the upgrade ourselves — avoids intercepting
  // Next.js's own HMR websocket (/_next/webpack-hmr) in dev mode.
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws));
    } else {
      socket.destroy();
    }
  });

  // Ping every 25 s so proxies (Railway, Nginx, Cloudflare) don't kill idle connections.
  // Any client that misses two consecutive pings is considered dead and terminated.
  const pingInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) { handleDisconnect(ws); return ws.terminate(); }
      ws.isAlive = false;
      ws.ping();
    });
  }, 25_000);
  wss.on('close', () => clearInterval(pingInterval));

  wss.on('connection', ws => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', data => handleMessage(ws, data.toString()));
    ws.on('close', () => handleDisconnect(ws));
    ws.on('error', () => ws.terminate());
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? 'dev' : 'production'}]`);
  });
});
