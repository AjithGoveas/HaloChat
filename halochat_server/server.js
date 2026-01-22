import express from 'express';
import { PORT } from './src/config/env.js';
import { attachRealtimeBridge } from './src/middleware/realtimeBridge.js';
import { createWsServer } from './src/middleware/websocket.js';

const server = express();
server.use(express.json());

// Health check route
server.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Start HTTP server
const httpServer = server.listen(PORT, () => {
	console.log(`HTTP server listening on port ${PORT}`);
});

// Attach WebSocket server
const wss = createWsServer({ server: httpServer });

// Attach realtime bridge
attachRealtimeBridge(wss);

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('Shutting down...');
	wss.close(() => process.exit(0));
});
