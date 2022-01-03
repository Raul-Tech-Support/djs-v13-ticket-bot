const mongoose = require('mongoose');

const SentDmLogSchema = new mongoose.Schema({
	guildID: { type: String },
	guildName: { type: String },
	targetID: { type: String },
	targetTag: { type: String },
	senderID: { type: String },
	senderTag: { type: String },
	dmMessage: { type: String },
});

module.exports = mongoose.model('SentDmLog', SentDmLogSchema);
