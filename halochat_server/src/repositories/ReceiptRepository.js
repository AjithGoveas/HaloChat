import { supabase } from '../config/supabase.js';
import { Receipt } from '../models/Receipt.js';
import { err, log } from '../utils/logger.js';

export const receiptRepo = {
	async add({ message_id, user_id, status }) {
		const { data, error } = await supabase
			.from('receipts')
			.insert({ message_id, user_id, status })
			.select()
			.single();
		if (error) {
			err('add receipt error:', error);
			throw error;
		}
		log('add receipt:', data.id);
		return new Receipt(data);
	},

	async listForMessage(message_id) {
		const { data, error } = await supabase.from('receipts').select('*').eq('message_id', message_id);
		if (error) {
			err('list receipts error:', error);
			throw error;
		}
		log('list receipts:', data.length);
		return (data ?? []).map((r) => new Receipt(r));
	},
};
