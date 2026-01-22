export class RoomMember {
	constructor({ room_id, user_id, role, joined_at, left_at }) {
		this.room_id = room_id;
		this.user_id = user_id;
		this.role = role ?? 'member'; // member | admin | owner
		this.joined_at = joined_at;
		this.left_at = left_at ?? null;
	}
}
