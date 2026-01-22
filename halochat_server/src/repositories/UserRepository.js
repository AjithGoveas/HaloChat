import { supabase } from '../config/supabase.js';
import { User } from '../models/User.js';
import { err, log } from '../utils/logger.js';

export const UserRepository = {
	async findByUsername(username) {
		const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
		if (error) {
			err('find user by username error:', error);
			throw error;
		}
		log('User found by username:', data.id);
		return new User(data);
	},

	async create({ username, display_name, avatar_url }) {
		const { data, error } = await supabase
			.from('users')
			.insert({ username, display_name, avatar_url })
			.select()
			.single();
		if (error) {
			err('create user error:', error);
			throw error;
		}
		log('User created:', data.id);
		return new User(data);
	},
};
