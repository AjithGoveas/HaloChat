import { supabase } from '../config/supabase.js';
import { Attachment } from '../models/Attachment.js';
import { err, log } from '../utils/logger.js';

export const attachmentRepo = {
	async add({ message_id, storage_url, size_bytes, mime_type, width, height }) {
		const { data, error } = await supabase
			.from('attachments')
			.insert({ message_id, storage_url, size_bytes, mime_type, width, height })
			.select()
			.single();
		if (error) {
			err('add attachment error:', error);
			throw error;
		}
		log('add attachment:', data.id);
		return new Attachment(data);
	},

	async listForMessage(message_id) {
		const { data, error } = await supabase.from('attachments').select('*').eq('message_id', message_id);
		if (error) {
			err('list attachments error:', error);
			throw error;
		}
		log('list attachments:', data.length);
		return (data ?? []).map((r) => new Attachment(r));
	},
};
