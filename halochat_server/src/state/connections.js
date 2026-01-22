// state/connections.js
import { sessionRepo } from '../repositories/SessionRepository.js';
import { log, err } from '../utils/logger.js';

// Track user_id -> Set<WebSocket> for targeted broadcasts
const userSockets = new Map(); // Map<string, Set<ws>>

/**
 * Register a new socket for a user.
 * - Adds to in-memory map
 * - Persists presence in DB (sessions table)
 * - Broadcasts presence event
 */
export async function registerUserSocket(userId, ws) {
	if (!userId) return;
	if (!userSockets.has(userId)) userSockets.set(userId, new Set());
	userSockets.get(userId).add(ws);

	try {
		await sessionRepo.connect({ user_id: userId, device_id: ws.deviceId });
		broadcastPresence(userId, true);
		log(`User ${userId} connected`);
	} catch (e) {
		err('registerUserSocket error:', e);
	}

	ws.on('close', async () => {
		const set = userSockets.get(userId);
		if (set) {
			set.delete(ws);
			if (set.size === 0) {
				userSockets.delete(userId);
				try {
					await sessionRepo.disconnect({ user_id: userId });
					broadcastPresence(userId, false);
					log(`User ${userId} disconnected`);
				} catch (e) {
					err('disconnect error:', e);
				}
			}
		}
	});
}

/**
 * Broadcast a message to all sockets of a specific user.
 */
export function broadcastToUser(userId, message) {
	const set = userSockets.get(userId);
	if (!set) return;
	const data = JSON.stringify(message);
	for (const ws of set) {
		if (ws.readyState === 1) ws.send(data);
	}
}

/**
 * Broadcast a message to all connected clients.
 */
export function broadcastToAll(wss, message) {
	const data = JSON.stringify(message);
	for (const client of wss.clients) {
		if (client.readyState === 1) client.send(data);
	}
}

/**
 * Broadcast presence change (online/offline) to all clients.
 */
export function broadcastPresence(userId, online) {
	const data = JSON.stringify({ event: 'presence', payload: { userId, online } });
	for (const set of userSockets.values()) {
		for (const ws of set) {
			if (ws.readyState === 1) ws.send(data);
		}
	}
}

/**
 * Get list of currently online users (in-memory).
 */
export function getOnlineUsers() {
	return Array.from(userSockets.keys());
}
