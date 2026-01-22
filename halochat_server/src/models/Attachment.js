export class Attachment {
	constructor({ id, message_id, storage_url, size_bytes, mime_type, width, height, created_at }) {
		this.id = id;
		this.message_id = message_id;
		this.storage_url = storage_url;
		this.size_bytes = size_bytes;
		this.mime_type = mime_type;
		this.width = width ?? null;
		this.height = height ?? null;
		this.created_at = created_at;
	}
}
