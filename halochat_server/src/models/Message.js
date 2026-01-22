export class Message {
	constructor({
		id,
		kind, // 'dm' | 'room'
		sender,
		recipient = null, // for DM
		room_id = null, // for room
		body,
		text, // accept DB column 'text' as well
		type = 'text', // text | image | file | system
		metadata = {},
		created_at,
		edited_at,
		deleted_at,
	}) {
		this.id = id;
		this.kind = kind;
		this.sender = sender;
		this.recipient = recipient;
		this.room_id = room_id;
		// normalize DB 'text' -> body used by app
		this.body = body ?? text ?? null;
		this.type = type;
		this.metadata = metadata;
		this.created_at = created_at;
		this.edited_at = edited_at ?? null;
		this.deleted_at = deleted_at ?? null;
	}
}
