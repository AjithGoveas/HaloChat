import { messageRepo } from '../repositories/MessageRepository.js';
import { receiptRepo } from '../repositories/ReceiptRepository.js';
import { roomMemberRepo } from '../repositories/RoomMemberRepository.js';

export const messageService = {
	async sendDm({ sender, recipient, text }) {
		const msg = await messageRepo.insertDm({ sender, recipient, text });
		return { type: 'message', ...msg };
	},

	async sendRoom({ sender, room_id, text }) {
		// membership check
		const members = await roomMemberRepo.listMembers(room_id);
		if (!members.find((m) => m.user_id === sender)) {
			throw new Error('not_a_member');
		}
		const msg = await messageRepo.insertRoom({ sender, room_id, text });
		return { type: 'message', ...msg };
	},

	async addReceipt({ messageId, userId, status }) {
		const receipt = await receiptRepo.add({ message_id: messageId, user_id: userId, status });
		return { type: 'status', receipt, messageId, status, userId, at: receipt.at };
	},

	async syncDm({ userId, peerId, since }) {
		const messages = await messageRepo.listDm(userId, peerId, since);
		return { type: 'sync_batch', peerId, messages };
	},

	async syncRoom({ roomId, since }) {
		const messages = await messageRepo.listRoom(roomId, since);
		return { type: 'sync_batch_room', roomId, messages };
	},

	async updateMessage({ message_id, text, deleted_at }) {
		const msg = await messageRepo.update({ id: message_id, text, deleted_at });
		return { type: 'message:update', message: msg };
	},
};
