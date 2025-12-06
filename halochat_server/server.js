import { PORT } from './src/config/env.js';
import { createWsServer } from './src/services/websocket.js';
import { attachRealtimeBridge } from './src/services/realtimeBridge.js';

const wss = createWsServer({ port: PORT });
attachRealtimeBridge(wss);
