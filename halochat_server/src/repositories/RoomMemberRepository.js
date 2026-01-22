import { supabase } from '../config/supabase.js';
import { RoomMember } from '../models/RoomMember.js';
import { err, log } from '../utils/logger.js';

export const roomMemberRepo = {
	async addMember({ room_id, user_id, role = 'member' }) {
		const { data, error } = await supabase
			.from('room_members')
			.insert({ room_id, user_id, role })
			.select()
			.single();
		if (error) {
			err('add room member error:', error);
			throw error;
		}
		log('add room member:', data.id);
		return new RoomMember(data);
	},

	async leave({ room_id, user_id }) {
		const { data, error } = await supabase
			.from('room_members')
			.update({ left_at: new Date().toISOString() })
			.eq('room_id', room_id)
			.eq('user_id', user_id)
			.select()
			.single();
		if (error) {
			err('leave room member error:', error);
			throw error;
		}
		return new RoomMember(data);
	},

	async listMembers(room_id) {
		const { data, error } = await supabase
			.from('room_members')
			.select('*')
			.eq('room_id', room_id)
			.is('left_at', null);
		if (error) {
			err('list room members error:', error);
			throw error;
		}
		return (data ?? []).map((rm) => new RoomMember(rm));
	},
};
