import { supabase } from '../config/supabase.js';
import { Session } from '../models/Session.js';
import { err, log } from '../utils/logger.js';

export const sessionRepo = {
	async connect({ user_id, device_id }) {
		const { data, error } = await supabase
			.from('sessions')
			.insert({ user_id, device_id, connected_at: new Date().toISOString() })
			.select()
			.single();
		if (error) {
			err('connect session error:', error);
			throw error;
		}
		log('Session connected:', data.id);
		return new Session(data);
	},

	async disconnect({ user_id }) {
		const { data, error } = await supabase
			.from('sessions')
			.update({ disconnected_at: new Date().toISOString(), last_seen_at: new Date().toISOString() })
			.eq('user_id', user_id)
			.is('disconnected_at', null)
			.select();
		if (error) {
			err('disconnect session error:', error);
			throw error;
		}
		log('Session disconnected for user:', user_id);
		return (data ?? []).map((session) => new Session(session));
	},

	async listActive(user_id) {
		const { data, error } = await supabase
			.from('sessions')
			.select('*')
			.eq('user_id', user_id)
			.is('disconnected_at', null);
		if (error) {
			err('listActive sessions error:', error);
			throw error;
		}
		log('listActive sessions for user:', user_id, 'count:', data.length);
		return (data ?? []).map((session) => new Session(session));
	},
};
