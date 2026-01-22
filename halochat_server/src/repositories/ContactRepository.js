import { supabase } from '../config/supabase.js';
import { Contact } from '../models/Contact.js';
import { err, log } from '../utils/logger.js';

export const ContactRepository = {
	async addContact({ owner_id, contact_user_id, alias }) {
		const { data, error } = await supabase
			.from('contacts')
			.insert({ owner_id, contact_user_id, alias })
			.select()
			.single();
		if (error) {
			err('add contact error:', error);
			throw error;
		}
		log('add contact:', data.id);
		return new Contact(data);
	},

	async listContacts(owner_id) {
		const { data, error } = await supabase.from('contacts').select('*').eq('owner_id', owner_id);
		if (error) {
			err('list contacts error:', error);
			throw error;
		}
		log('list contacts:', data.length);
		return (data ?? []).map((r) => new Contact(r));
	},
};
