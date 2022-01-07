const guildSettings = require('../models/GuildSettings.js');
const { botName, debug } = require('../config.json');

module.exports = async (guild) => {

	const guildid = guild.id;

	const hasConfig = await guildSettings.findOne({ guildID: guildid });

	if (hasConfig) {

		if (debug) console.warn(`[${botName}] ${guild.name} already has a config! Skipping creating a new one...`);

		return 'Config already exisits!';

	}
	else {
		try {
			const guildSetup = new guildSettings({
				guildID: guildid,
				guildBanAnnounceChannel: '',
				guildBanAnnounceMessage: '%target% was banned by %moderator%',
				guildAppealLink: 'No Appeal Link Set',
				guildModLogChannel: '',
				guildAdminLogChannel: '',
				guildHandbookVerificationWord: 'word',
				guildHandbookTrialRoleName: 'Trial Staff',
				guildHandbookAllStaffRoleName: 'Discord Staff',
				guildHandbookAwardRoleName: 'Helper',
				guildHandbookSuspendedRoleName: 'Suspended',
			});

			await guildSetup.save();

			if (debug) console.log(`[${botName}] Generated config for ${guild.name}!`);

			return 'Config generated successfully!';
		}
		catch (e) {
			console.error(`[${botName}] Failed to save config: ${e}`);
			return 'An error occured while generating a config!';
		}
	}
};