const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({
	guildID: { type: String },
	guildBanAnnounceChannel: { type: String },
	guildBanAnnounceMessage: { type: String },
	guildAppealLink: { type: String },
	guildModLogChannel: { type: String },
});

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema);
