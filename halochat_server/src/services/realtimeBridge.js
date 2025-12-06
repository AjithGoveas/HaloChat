import { supabase } from '../config/supabase.js';
import { log, err } from '../utils/logger.js';
import { broadcastToAll } from '../state/connections.js';

/**
 * Rebroadcast DB changes to WS clients so all instances stay consistent.
 * This complements the direct broadcasts done in websocket.js.
 */
export function attachRealtimeBridge(wss) {
	const channel = supabase
		.channel('realtime:messages')
		.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				const event =
					payload.eventType === 'INSERT' ? 'message' : payload.eventType === 'UPDATE' ? 'status' : 'message';
				broadcastToAll(wss, { event, payload: row });
			} catch (e) {
				err('Realtime messages bridge error:', e);
			}
		})
		.on('postgres_changes', { event: '*', schema: 'public', table: 'read_receipts' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				broadcastToAll(wss, { event: 'read_receipt', payload: row });
			} catch (e) {
				err('Realtime receipts bridge error:', e);
			}
		})
		.subscribe((status) => {
			log('Realtime bridge status:', status);
		});

	return channel;
}
