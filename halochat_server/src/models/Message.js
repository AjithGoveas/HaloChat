export class Message {
	constructor({ id, sender, recipient = null, room_id = null, text, status = 'sent', created_at }) {
		this.id = id ?? null;
		this.sender = sender;
		this.recipient = recipient;
		this.room_id = room_id;
		this.text = text;
		this.status = status; // sent | delivered | read
		this.created_at = created_at ?? new Date().toISOString();
	}
}
