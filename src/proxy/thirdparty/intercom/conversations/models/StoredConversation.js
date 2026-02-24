const { isEmptyString } = require("../../../../../utils/stringUtils");

class StoredConversation {
	constructor ({ conversationId, contactId, adminId, businessPhoneNumberId, userPhoneNumberId }) {
		this.conversationId			= conversationId || "";
		this.contactId				= contactId || "";
		this.adminId				= adminId || "";
		this.businessPhoneNumberId	= businessPhoneNumberId || "";
		this.userPhoneNumberId		= userPhoneNumberId || "";
		this.open					= !isEmptyString (this.conversationId);
		this.assigned				= !isEmptyString (this.adminId);
	}

	toJson () {
		return {
			conversationId: this.conversationId,
			contactId: this.contactId,
			adminId: this.adminId,
			businessPhoneNumberId: this.businessPhoneNumberId,
			userPhoneNumberId: this.userPhoneNumberId,
			open: this.open,
			assigned: this.assigned
		};
	}

	toJsonString () {
		return JSON.stringify (this.toJson ());
	}

	toFieldArray () {
		const fields = [];

		Object.entries (this.toJson ()).forEach (([ key, value ]) => {
			fields.push (key);
			fields.push (typeof value === "string" ? value : (value !== null || value !== undefined) ? value.toString () : null);
		});

		return fields;
	}
};

module.exports = StoredConversation;