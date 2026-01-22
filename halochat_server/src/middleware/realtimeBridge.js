// middlewares/realtimeBridge.js
import { supabase } from '../config/supabase.js';
import { broadcastToAll } from '../state/connections.js';
import { isLocalEvent } from '../utils/localEvents.js';
import { err, log } from '../utils/logger.js';

export function attachRealtimeBridge(wss) {
	const channel = supabase
		.channel('realtime:messages')
		// messages
		.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				// dedupe if this server created it recently
				if (row && isLocalEvent(row.id)) return;
				const event =
					payload.eventType === 'INSERT'
						? 'message:create'
						: payload.eventType === 'UPDATE'
							? 'message:update'
							: 'message';
				broadcastToAll(wss, { type: event, payload: row });
			} catch (e) {
				err('Realtime messages bridge error:', e);
			}
		})
		// receipts
		.on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				if (row && isLocalEvent(row.id)) return;
				broadcastToAll(wss, { type: 'receipt:create', payload: row });
			} catch (e) {
				err('Realtime receipts bridge error:', e);
			}
		})
		// room_members
		.on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				if (!row) return;
				if (payload.eventType === 'INSERT') {
					if (isLocalEvent(row.id)) return;
					broadcastToAll(wss, { type: 'room:join', payload: row });
				} else if (payload.eventType === 'UPDATE') {
					broadcastToAll(wss, { type: 'room:member:update', payload: row });
				} else if (payload.eventType === 'DELETE') {
					broadcastToAll(wss, { type: 'room:member:remove', payload: row });
				}
			} catch (e) {
				err('Realtime room_members bridge error:', e);
			}
		})
		// rooms
		.on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				if (!row) return;
				const event =
					payload.eventType === 'INSERT'
						? 'room:create'
						: payload.eventType === 'UPDATE'
							? 'room:update'
							: 'room:delete';
				broadcastToAll(wss, { type: event, payload: row });
			} catch (e) {
				err('Realtime rooms bridge error:', e);
			}
		})
		// sessions (presence)
		.on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
			try {
				const row = payload.new ?? payload.old;
				if (!row) return;
				broadcastToAll(wss, { type: 'presence:update', payload: row });
			} catch (e) {
				err('Realtime sessions bridge error:', e);
			}
		})
		.subscribe((status) => {
			log('Realtime bridge status:', status);
		});

	return channel;
}
