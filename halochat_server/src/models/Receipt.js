export class Receipt {
	constructor({ message_id, user_id, status, at }) {
		this.message_id = message_id;
		this.user_id = user_id;
		this.status = status; // delivered | read
		this.at = at;
	}
}
