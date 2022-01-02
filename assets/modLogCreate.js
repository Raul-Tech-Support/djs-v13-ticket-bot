const GuildSettings = require('../models/GuildSettings.js');
const { botName, version, author } = require('../config.json');
const { MessageEmbed } = require('discord.js');

module.exports = async (guild, client, target, moderator, reason, action) => {

	const guildSettings = await GuildSettings.findOne({ guildID: guild.id });
	const ModLogChannel = guildSettings.guildModLogChannel;
	const colour = Math.floor(Math.random() * 16777215).toString(16);

	const logEmbed = new MessageEmbed()
		.setColor(colour)
		.setTitle(`User ${action}`)
		.setDescription(`${target} was ${action} by ${moderator} for ${reason}.`)
		.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

	try {

		let found = false;

		guild.channels.cache.forEach(channel => {

			if (channel.id === ModLogChannel) {

				found = true;
			}
		});

		if (!found) return 'other guild';

		const c = await client.channels.fetch(ModLogChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));
		c.send({ embeds: [logEmbed] }).catch((error) => {
			console.error(`[${botName}] Failed to send log message: ${error}`);
		});
		return 'sucess';

	}
	catch (error) {
		console.error(`[${botName}] Failed to send log message: ${error}`);
		return 'error';
	}

};