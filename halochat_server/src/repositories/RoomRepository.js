import { supabase } from '../config/supabase.js';
import { Room } from '../models/Room.js';
import { log, err } from '../utils/logger.js';

export const roomRepo = {
	async create({ name, created_by, is_private = false, avatar_url }) {
		const { data, error } = await supabase
			.from('rooms')
			.insert({ name, created_by, is_private, avatar_url })
			.select()
			.single();
		if (error) {
			err('create room error:', error);
			throw error;
		}
		log('Room created:', data.id);
		return new Room(data);
	},

	async listRooms() {
		const { data, error } = await supabase.from('rooms').select('*');
		if (error) {
			err('listRooms error:', error);
			throw error;
		}
		log('listRooms:', data.length);
		return (data ?? []).map((r) => new Room(r));
	},
};
