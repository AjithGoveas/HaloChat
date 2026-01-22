// middlewares/auth.js
import { supabase } from '../config/supabase.js';
import { err } from '../utils/logger.js';

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

// Attach user to socket after hello
export async function authMiddleware(ws, payload) {
	const { user_id, token } = payload || {};
	if (token) {
		const user = await verifyUserToken(token);
		if (!user || user.id !== user_id) {
			ws.send(JSON.stringify({ event: 'error', payload: 'Auth failed' }));
			return null;
		}
	}
	ws.userId = user_id;
	return user_id;
}
