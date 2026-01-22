import { sessionRepo } from '../repositories/SessionRepository.js';

export const presenceService = {
	async broadcastPresence(userId, online) {
		return { type: 'presence', userId, online };
	},

	async listActive(userId) {
		const sessions = await sessionRepo.listActive(userId);
		return sessions.length > 0;
	},
};
