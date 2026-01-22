export class User {
	constructor({ id, username, display_name, avatar_url, created_at }) {
		this.id = id; // UUID
		this.username = username; // unique handle
		this.display_name = display_name; // friendly name
		this.avatar_url = avatar_url; // optional profile picture
		this.created_at = created_at;
	}
}
