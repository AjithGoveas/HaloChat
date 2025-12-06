// Track user_id -> Set<WebSocket> for targeted broadcasts
const userSockets = new Map(); // Map<string, Set<ws>>

export function registerUserSocket(userId, ws) {
	if (!userId) return;
	if (!userSockets.has(userId)) userSockets.set(userId, new Set());
	userSockets.get(userId).add(ws);
	ws.on('close', () => {
		const set = userSockets.get(userId);
		if (set) {
			set.delete(ws);
			if (set.size === 0) userSockets.delete(userId);
		}
	});
}

export function broadcastToUser(userId, message) {
	const set = userSockets.get(userId);
	if (!set) return;
	const data = JSON.stringify(message);
	for (const ws of set) {
		if (ws.readyState === 1) ws.send(data);
	}
}

export function broadcastToAll(wss, message) {
	const data = JSON.stringify(message);
	for (const client of wss.clients) {
		if (client.readyState === 1) client.send(data);
	}
}

export function getOnlineUsers() {
	return Array.from(userSockets.keys());
}
