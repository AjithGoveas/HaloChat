export class RoomMember {
	constructor({ id, room_id, user_id, joined_at }) {
		this.id = id ?? null;
		this.room_id = room_id;
		this.user_id = user_id;
		this.joined_at = joined_at ?? new Date().toISOString();
	}
}
