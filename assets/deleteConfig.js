const guildSettings = require('../models/GuildSettings.js');
const { botName, debug } = require('../config.json');

module.exports = async (guild) => {

	const guildid = guild.id;

	const hasConfig = await guildSettings.findOne({ guildID: guildid });

	if (hasConfig) {
		try {

			await guildSettings.deleteOne({ guildID: guildid });

			if (debug) console.log(`[${botName}] Deleted config for ${guild.name}!`);

			return 'Config deleted successfully!';
		}
		catch (e) {
			console.error(`[${botName}] Failed to delete config: ${e}`);
			return 'An error occured while deleting the config!';
		}
	}
	else {
		if (debug) console.warn(`[${botName}] ${guild.name} Does not have a config! Cannot delete...`);

		return 'Config does not exisit!';
	}
};