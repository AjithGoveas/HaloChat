import { PORT } from './src/config/env.js';
import { createWsServer } from './src/services/websocket.js';
import { attachRealtimeBridge } from './src/services/realtimeBridge.js';
import express from 'express';

const server = express();
const wss = createWsServer({
	server: server.listen(PORT),
	port: PORT
});
attachRealtimeBridge(wss);
