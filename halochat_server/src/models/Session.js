export class Session {
	constructor({ id, user_id, device_id, connected_at, disconnected_at, last_seen_at }) {
		this.id = id;
		this.user_id = user_id;
		this.device_id = device_id ?? null;
		this.connected_at = connected_at;
		this.disconnected_at = disconnected_at ?? null;
		this.last_seen_at = last_seen_at ?? null;
	}
}
