export class Room {
	constructor({ id, name, created_at }) {
		this.id = id ?? null;
		this.name = name;
		this.created_at = created_at ?? new Date().toISOString();
	}
}
