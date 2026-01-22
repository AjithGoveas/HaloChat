export class Room {
	constructor({ id, name, avatar_url, is_private, created_by, created_at, updated_at }) {
		this.id = id;
		this.name = name;
		this.avatar_url = avatar_url ?? null;
		this.is_private = is_private ?? false;
		this.created_by = created_by;
		this.created_at = created_at;
		this.updated_at = updated_at ?? null;
	}
}
