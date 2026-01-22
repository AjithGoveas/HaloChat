import { supabase } from '../config/supabase.js';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';
import { err, log } from '../utils/logger.js';

export const messageRepo = {
	async insertDm({ sender, recipient, text, type = 'text', metadata = {} }) {
		const { data, error } = await supabase
			.from('messages')
			.insert({ kind: 'dm', sender, recipient, text, type, metadata })
			.select()
			.single();
		if (error) {
			err('insertDm error:', error);
			throw error;
		}
		log('insertDm:', data.id);
		return new Message(data);
	},

	async insertRoom({ sender, room_id, text, type = 'text', metadata = {} }) {
		const { data, error } = await supabase
			.from('messages')
			.insert({ kind: 'room', sender, room_id, text, type, metadata })
			.select()
			.single();
		if (error) {
			err('insertRoom error:', error);
			throw error;
		}
		log('insertRoom:', data.id);
		return new Message(data);
	},

	async listDm(peerA, peerB, since, limit = 100) {
		let query = supabase
			.from('messages')
			.select('*')
			.eq('kind', 'dm')
			.or(`and(sender.eq.${peerA},recipient.eq.${peerB}),and(sender.eq.${peerB},recipient.eq.${peerA})`);
		if (since) query = query.gt('created_at', since);
		query = query.order('created_at', { ascending: true }).limit(limit);
		const { data, error } = await query;
		if (error) {
			err('listDm error:', error);
			throw error;
		}
		log('listDm:', data.length);
		return (data ?? []).map((r) => new Message(r));
	},

	async listRoom(room_id, since, limit = 100) {
		let query = supabase.from('messages').select('*').eq('kind', 'room').eq('room_id', room_id);
		if (since) query = query.gt('created_at', since);
		query = query.order('created_at', { ascending: true }).limit(limit);
		const { data, error } = await query;
		if (error) {
			err('listRoom error:', error);
			throw error;
		}
		log('listRoom:', data.length);
		return (data ?? []).map((r) => new Room(r));
	},

	async update({ id, text, deleted_at, metadata }) {
		const payload = {};
		if (text !== undefined) payload.text = text;
		if (deleted_at !== undefined) payload.deleted_at = deleted_at;
		if (metadata !== undefined) payload.metadata = metadata;
		const { data, error } = await supabase.from('messages').update(payload).eq('id', id).select().single();
		if (error) {
			err('update message error:', error);
			throw error;
		}
		return new Message(data);
	},
};
