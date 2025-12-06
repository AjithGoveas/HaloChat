import { supabase } from '../config/supabase.js';
import { Room } from '../models/Room.js';
import { RoomMember } from '../models/RoomMember.js';
import { log, err } from '../utils/logger.js';

export const roomRepo = {
	async create(name) {
		const { data, error } = await supabase.from('rooms').insert({ name }).select().single();
		if (error) {
			err('create room error:', error);
			throw error;
		}
		log('Room created:', data.id);
		return new Room(data);
	},

	async addMember(room_id, user_id) {
		const { data, error } = await supabase.from('room_members').insert({ room_id, user_id }).select().single();
		if (error) {
			err('addMember error:', error);
			throw error;
		}
		return new RoomMember(data);
	},

	async removeMember(room_id, user_id) {
		const { error } = await supabase.from('room_members').delete().eq('room_id', room_id).eq('user_id', user_id);
		if (error) {
			err('removeMember error:', error);
			throw error;
		}
		return true;
	},

	async listMembers(room_id) {
		const { data, error } = await supabase.from('room_members').select('*').eq('room_id', room_id);
		if (error) {
			err('listMembers error:', error);
			throw error;
		}
		return (data ?? []).map((r) => new RoomMember(r));
	},
};
