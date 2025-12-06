import { supabase } from '../config/supabase.js';
import { err } from '../utils/logger.js';

/**
 * Validate client-provided JWT from Supabase Auth (optional).
 * Clients should send: { type: 'hello', payload: { user_id, token } }
 * If you don't use Supabase Auth yet, you can skip token verification and trust user_id.
 */
export async function verifyUserToken(token) {
	if (!token) return null;
	try {
		const { data, error } = await supabase.auth.getUser(token);
		if (error) return null;
		return data?.user ?? null;
	} catch (e) {
		err('verifyUserToken error:', e);
		return null;
	}
}
