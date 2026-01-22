// middlewares/websocket.js
import { WebSocketServer } from 'ws';
import { messageService } from '../services/MessageService.js';
import { presenceService } from '../services/PresenceService.js';
import { roomService } from '../services/RoomService.js';
import { broadcastToUser, registerUserSocket } from '../state/connections.js';
import { markLocalEvent } from '../utils/localEvents.js';
import { err, log } from '../utils/logger.js';
import { authMiddleware } from './auth.js';

function parseJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function createWsServer({ server, port } = {}) {
	const wss = server ? new WebSocketServer({ server }) : new WebSocketServer({ port });

	wss.on('connection', (ws) => {
		log('Client connected');

		// immediate handshake: client should send 'hello' with user_id/token
		ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));

		ws.on('message', async (raw) => {
			const msg = parseJson(raw);
			if (!msg || typeof msg !== 'object') {
				ws.send(JSON.stringify({ type: 'error', payload: { code: 'invalid_json', message: 'Invalid JSON' } }));
				return;
			}

			const { type, payload } = msg;
			try {
				switch (type) {
					case 'hello': {
						const userId = await authMiddleware(ws, payload);
						if (!userId) break;
						// optional device id
						if (payload.device_id) ws.deviceId = payload.device_id;
						ws.userId = userId;
						await registerUserSocket(userId, ws);
						ws.send(
							JSON.stringify({
								type: 'welcome',
								payload: { user_id: userId, timestamp: new Date().toISOString() },
							})
						);
						break;
					}

					case 'message:create': {
						// payload: { room_id?, recipient?, text, kind? }
						const sender = ws.userId;
						if (!sender) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'unauthenticated', message: 'Not authenticated' },
								})
							);
							break;
						}
						const { room_id, recipient, text, kind } = payload || {};
						let res;
						if (room_id) {
							res = await messageService.sendRoom({ sender, room_id, text, kind });
							// mark local event to avoid relaying via realtime bridge
							if (res && res.id) markLocalEvent(res.id);
							const members = await roomService.listMembers(room_id);
							members.members.forEach((m) => broadcastToUser(m.user_id, res));
						} else if (recipient) {
							res = await messageService.sendDm({ sender, recipient, text, kind });
							if (res && res.id) markLocalEvent(res.id);
							broadcastToUser(sender, res);
							broadcastToUser(recipient, res);
						} else {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'invalid_payload', message: 'room_id or recipient required' },
								})
							);
						}
						break;
					}

					case 'message:update': {
						// payload: { message_id, status?, deleted_at?, text? }
						const sender = ws.userId;
						if (!sender) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'unauthenticated', message: 'Not authenticated' },
								})
							);
							break;
						}
						const { message_id, text, deleted_at } = payload || {};
						if (!message_id) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'invalid_payload', message: 'message_id required' },
								})
							);
							break;
						}
						const updated = await messageService.updateMessage({ message_id, text, deleted_at });
						if (updated && updated.message && updated.message.id) markLocalEvent(updated.message.id);
						// broadcast to relevant parties: message contains sender/recipient/room_id
						const m = updated.message;
						if (m.kind === 'dm' && m.recipient) {
							broadcastToUser(m.sender, { type: 'message:update', message: m });
							broadcastToUser(m.recipient, { type: 'message:update', message: m });
						} else if (m.kind === 'room' && m.room_id) {
							const members = await roomService.listMembers(m.room_id);
							members.members.forEach((mem) =>
								broadcastToUser(mem.user_id, { type: 'message:update', message: m })
							);
						} else {
							broadcastToUser(m.sender, { type: 'message:update', message: m });
						}
						break;
					}

					case 'receipt:create': {
						// payload: { message_id }
						const userId = ws.userId;
						if (!userId) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'unauthenticated', message: 'Not authenticated' },
								})
							);
							break;
						}
						const { message_id } = payload || {};
						if (!message_id) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'invalid_payload', message: 'message_id required' },
								})
							);
							break;
						}
						const receipt = await messageService.addReceipt({
							messageId: message_id,
							userId,
							status: 'delivered',
						});
						if (receipt && receipt.receipt && receipt.receipt.id) markLocalEvent(receipt.receipt.id);
						// broadcast status to sender and room members as appropriate
						broadcastToUser(userId, { type: 'receipt:create', payload: { message_id, user_id: userId } });
						break;
					}

					case 'sync_dm': {
						const result = await messageService.syncDm(payload);
						ws.send(JSON.stringify(result));
						break;
					}

					case 'sync_room': {
						const result = await messageService.syncRoom(payload);
						ws.send(JSON.stringify(result));
						break;
					}

					case 'room:create': {
						const result = await roomService.createRoom({ name: payload.name, created_by: ws.userId });
						ws.send(JSON.stringify(result));
						break;
					}

					case 'room:join': {
						// payload: { room_id }
						const user_id = ws.userId;
						if (!user_id) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'unauthenticated', message: 'Not authenticated' },
								})
							);
							break;
						}
						const { room_id } = payload || {};
						if (!room_id) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'invalid_payload', message: 'room_id required' },
								})
							);
							break;
						}
						const result = await roomService.addMember({ room_id, user_id });
						// notify room members
						const members = await roomService.listMembers(room_id);
						members.members.forEach((m) =>
							broadcastToUser(m.user_id, { type: 'room:join', room_id, user_id })
						);
						break;
					}

					case 'room:leave': {
						const user_id = ws.userId;
						const { room_id } = payload || {};
						if (!room_id) {
							ws.send(
								JSON.stringify({
									type: 'error',
									payload: { code: 'invalid_payload', message: 'room_id required' },
								})
							);
							break;
						}
						const result = await roomService.leaveRoom({ room_id, user_id });
						const members = await roomService.listMembers(room_id);
						members.members.forEach((m) =>
							broadcastToUser(m.user_id, { type: 'room:leave', room_id, user_id })
						);
						break;
					}

					case 'presence:update': {
						// payload: { status, last_seen }
						const user_id = ws.userId;
						const { status, last_seen } = payload || {};
						// simple session update via sessionRepo handled in registerUserSocket/close; provide broadcast
						const p = await presenceService.broadcastPresence(user_id, status === 'online');
						broadcastToUser(user_id, p);
						break;
					}

					default:
						ws.send(JSON.stringify({ event: 'error', payload: 'Unknown type' }));
				}
			} catch (e) {
				err('WS handler error:', e);
				ws.send(JSON.stringify({ type: 'error', payload: { code: 'server_error', message: 'Server error' } }));
			}
		});

		ws.on('close', () => log('Client disconnected'));
	});

	log(port ? `WS listening on ws://localhost:${port}` : 'WS attached to existing server');
	return wss;
}
