import { roomRepo } from '../repositories/RoomRepository.js';
import { roomMemberRepo } from '../repositories/RoomMemberRepository.js';

export const roomService = {
	async createRoom({ name, created_by }) {
		const room = await roomRepo.create({ name, created_by });
		await roomMemberRepo.addMember({ room_id: room.id, user_id: created_by, role: 'owner' });
		return { type: 'room_created', ...room };
	},

	async addMember({ room_id, user_id }) {
		const member = await roomMemberRepo.addMember({ room_id, user_id });
		return { type: 'member_added', ...member };
	},

	async leaveRoom({ room_id, user_id }) {
		const member = await roomMemberRepo.leave({ room_id, user_id });
		return { type: 'member_left', ...member };
	},

	async listMembers(room_id) {
		const members = await roomMemberRepo.listMembers(room_id);
		return { type: 'members_list', room_id, members };
	},
};
