const mongoose = require('mongoose');

const GuildSettingsSchema = new mongoose.Schema({
	guildID: { type: String },
	guildBanAnnounceChannel: { type: String },
	guildBanAnnounceMessage: { type: String },
	guildAppealLink: { type: String },
	guildModLogChannel: { type: String },
	guildAdminLogChannel: { type: String },
	guildHandbookVerificationWord: { type: String },
	guildHandbookTrialRoleName: { type: String },
	guildHandbookAllStaffRoleName: { type: String },
	guildHandbookAwardRoleName: { type: String },
	guildHandbookSuspendedRoleName: { typr: String },
});

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema);
