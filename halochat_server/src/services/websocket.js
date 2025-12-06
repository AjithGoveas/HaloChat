import { WebSocketServer } from 'ws';
import { messageRepo } from '../repositories/MessageRepository.js';
import { roomRepo } from '../repositories/RoomRepository.js';
import { broadcastToUser, registerUserSocket } from '../state/connections.js';
import { err, log } from '../utils/logger.js';
import { verifyUserToken } from './auth.js';

function parseJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function createWsServer({ server, port } = {}) {
	let wss;

	if (server) {
		// Attach to an existing HTTP or HTTPS server (preferred for TLS / proxy setups)
		wss = new WebSocketServer({ server });
	} else if (port) {
		// Fall back to listening directly on a port (non-TLS)
		wss = new WebSocketServer({ port });
	} else {
		throw new Error('createWsServer requires either { server } or { port }');
	}

	wss.on('connection', (ws) => {
		log('Client connected');

		let authedUserId = null;

		ws.on('message', async (raw) => {
			const msg = parseJson(raw);
			if (!msg || typeof msg !== 'object') {
				ws.send(JSON.stringify({ event: 'error', payload: 'Invalid JSON' }));
				return;
			}

			const { type, payload } = msg;

			try {
				switch (type) {
					// Identify and register connection
					case 'hello': {
						// payload: { user_id, token? }
						const { user_id, token } = payload || {};

						// Optional: verify token with Supabase Auth
						if (token) {
							const user = await verifyUserToken(token);
							if (!user || user.id !== user_id) {
								ws.send(JSON.stringify({ event: 'error', payload: 'Auth failed' }));
								break;
							}
						}

						authedUserId = user_id;
						registerUserSocket(authedUserId, ws);
						ws.send(JSON.stringify({ event: 'hello', payload: { ok: true, user_id: authedUserId } }));
						break;
					}

					// Direct message send
					case 'send_dm': {
						// payload: { sender, recipient, text }
						const { sender, recipient, text } = payload || {};
						if (!sender || !recipient || !text) {
							ws.send(JSON.stringify({ event: 'error', payload: 'Missing fields' }));
							break;
						}
						const saved = await messageRepo.insertDm({ sender, recipient, text });

						// Push to sender + recipient
						broadcastToUser(sender, { event: 'message', payload: saved });
						broadcastToUser(recipient, { event: 'message', payload: saved });
						break;
					}

					// Room message send
					case 'send_room': {
						// payload: { sender, room_id, text }
						const { sender, room_id, text } = payload || {};
						if (!sender || !room_id || !text) {
							ws.send(JSON.stringify({ event: 'error', payload: 'Missing fields' }));
							break;
						}
						const saved = await messageRepo.insertRoom({ sender, room_id, text });

						// Broadcast to all room members
						const members = await roomRepo.listMembers(room_id);
						for (const m of members) {
							broadcastToUser(m.user_id, { event: 'message', payload: saved });
						}
						break;
					}

					// Delivery ack
					case 'ack_delivered': {
						// payload: { messageId }
						const { messageId } = payload || {};
						if (!messageId) break;
						const updated = await messageRepo.updateStatus(messageId, 'delivered');
						// Notify sender and recipient or room members
						if (updated.recipient) {
							broadcastToUser(updated.sender, { event: 'status', payload: updated });
							broadcastToUser(updated.recipient, { event: 'status', payload: updated });
						} else if (updated.room_id) {
							const members = await roomRepo.listMembers(updated.room_id);
							for (const m of members) {
								broadcastToUser(m.user_id, { event: 'status', payload: updated });
							}
						}
						break;
					}

					// Read ack
					case 'ack_read': {
						// payload: { messageId, reader }
						const { messageId, reader } = payload || {};
						if (!messageId || !reader) break;

						await messageRepo.addReadReceipt(messageId, reader);
						const updated = await messageRepo.updateStatus(messageId, 'read');

						if (updated.recipient) {
							broadcastToUser(updated.sender, { event: 'status', payload: updated });
							broadcastToUser(updated.recipient, { event: 'status', payload: updated });
						} else if (updated.room_id) {
							const members = await roomRepo.listMembers(updated.room_id);
							for (const m of members) {
								broadcastToUser(m.user_id, { event: 'status', payload: updated });
							}
						}
						break;
					}

					// Sync DM history
					case 'sync_dm': {
						// payload: { peerA, peerB, limit? }
						const { peerA, peerB, limit = 100 } = payload || {};
						const list = await messageRepo.listDm(peerA, peerB, limit);
						ws.send(JSON.stringify({ event: 'sync_dm', payload: list }));
						break;
					}

					// Sync room history
					case 'sync_room': {
						// payload: { room_id, limit? }
						const { room_id, limit = 100 } = payload || {};
						const list = await messageRepo.listRoom(room_id, limit);
						ws.send(JSON.stringify({ event: 'sync_room', payload: list }));
						break;
					}

					// Manage room membership
					case 'room_join': {
						// payload: { room_id, user_id }
						const { room_id, user_id } = payload || {};
						await roomRepo.addMember(room_id, user_id);
						ws.send(JSON.stringify({ event: 'room_joined', payload: { room_id, user_id } }));
						break;
					}

					case 'room_leave': {
						// payload: { room_id, user_id }
						const { room_id, user_id } = payload || {};
						await roomRepo.removeMember(room_id, user_id);
						ws.send(JSON.stringify({ event: 'room_left', payload: { room_id, user_id } }));
						break;
					}

					// Presence broadcast (who is online)
					case 'presence_all': {
						// no payload
						ws.send(JSON.stringify({ event: 'presence_all', payload: { users: [] } }));
						break;
					}

					default:
						ws.send(JSON.stringify({ event: 'error', payload: 'Unknown type' }));
				}
			} catch (e) {
				err('WS handler error:', e);
				ws.send(JSON.stringify({ event: 'error', payload: 'Server error' }));
			}
		});

		ws.on('close', () => log('Client disconnected'));
	});

	if (port) {
		log(`WS listening on ws://localhost:${port}`);
	} else {
		log('WS attached to existing server (use wss:// when the server has TLS)');
	}

	return wss;
}
