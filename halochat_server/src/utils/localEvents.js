// utils/localEvents.js
// Small in-memory store to mark recently-created DB entity IDs that originated from this server.
// Used to deduplicate Supabase realtime events that mirror local writes.

const recent = new Set();
const TTL_MS = 5000;

export function markLocalEvent(id) {
	if (!id) return;
	recent.add(id);
	setTimeout(() => recent.delete(id), TTL_MS);
}

export function isLocalEvent(id) {
	return !!id && recent.has(id);
}

export function clearLocalEvents() {
	recent.clear();
}

export default { markLocalEvent, isLocalEvent, clearLocalEvents };
