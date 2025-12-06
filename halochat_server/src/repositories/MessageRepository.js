import { supabase } from '../config/supabase.js';
import { Message } from '../models/Message.js';
import { log, err } from '../utils/logger.js';

export const messageRepo = {
	async insertDm({ sender, recipient, text }) {
		const { data, error } = await supabase
			.from('messages')
			.insert({ sender, recipient, text, status: 'sent' })
			.select()
			.single();
		if (error) {
			err('insertDm error:', error);
			throw error;
		}
		log('DM inserted:', data.id);
		return new Message(data);
	},

	async insertRoom({ sender, room_id, text }) {
		const { data, error } = await supabase
			.from('messages')
			.insert({ sender, room_id, text, status: 'sent' })
			.select()
			.single();
		if (error) {
			err('insertRoom error:', error);
			throw error;
		}
		log('Room msg inserted:', data.id);
		return new Message(data);
	},

	async updateStatus(id, status) {
		const { data, error } = await supabase.from('messages').update({ status }).eq('id', id).select().single();
		if (error) {
			err('updateStatus error:', error);
			throw error;
		}
		return new Message(data);
	},

	async addReadReceipt(messageId, reader) {
		const { data, error } = await supabase
			.from('read_receipts')
			.insert({ message_id: messageId, reader })
			.select()
			.single();
		if (error) {
			err('addReadReceipt error:', error);
			throw error;
		}
		return data;
	},

	async listDm(peerA, peerB, limit = 100) {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.or(`and(sender.eq.${peerA},recipient.eq.${peerB}),and(sender.eq.${peerB},recipient.eq.${peerA})`)
			.order('created_at', { ascending: false })
			.limit(limit);
		if (error) {
			err('listDm error:', error);
			throw error;
		}
		return (data ?? []).map((row) => new Message(row));
	},

	async listRoom(roomId, limit = 100) {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.eq('room_id', roomId)
			.order('created_at', { ascending: false })
			.limit(limit);
		if (error) {
			err('listRoom error:', error);
			throw error;
		}
		return (data ?? []).map((row) => new Message(row));
	},
};
