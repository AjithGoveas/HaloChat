export class Contact {
	constructor({ id, owner_id, contact_user_id, alias, is_blocked, is_muted, created_at }) {
		this.id = id;
		this.owner_id = owner_id; // current user
		this.contact_user_id = contact_user_id; // other user
		this.alias = alias ?? null;
		this.is_blocked = is_blocked ?? false;
		this.is_muted = is_muted ?? false;
		this.created_at = created_at;
	}
}
