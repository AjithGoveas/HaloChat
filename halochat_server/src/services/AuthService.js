import { userRepo } from '../repositories/UserRepository.js';
import { sessionRepo } from '../repositories/SessionRepository.js';

export const authService = {
	async hello(ws, { username }) {
		// Lookup or create user
		let user = await userRepo.findByUsername(username).catch(() => null);
		if (!user) {
			user = await userRepo.create({ username, display_name: username });
		}

		ws.userId = user.id;

		// Create session
		await sessionRepo.connect({ user_id: user.id, device_id: ws.deviceId });

		return { type: 'hello_ok', userId: user.id };
	},

	async disconnect(ws) {
		if (!ws.userId) return;
		await sessionRepo.disconnect({ user_id: ws.userId });
		return { type: 'presence', userId: ws.userId, online: false };
	},
};
