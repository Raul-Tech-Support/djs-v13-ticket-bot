const { botName, version, author, authorID, internalLogChannel, logsURL } = require('./config.json');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

async function sendError(client, error) {

	if (!client) return console.error('[ANTICRASH] An error occured and no client was provided. This error likely occured before the client was defined.');

	//Construct error embed
	const ts = Math.round((new Date()).getTime() / 1000);
	const uncaughtErrorEmbed = new MessageEmbed()
		.setTitle('UNCAUGHT ERROR!')
		.setDescription(`${botName} has encountered an unhandled error at: <t:${ts}>!\n\`\`\`${error}\`\`\``)
		.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
		.setColor('RED');
	//Construct button
	const viewLogsButton = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setLabel('View logs!')
				.setStyle('LINK')
				.setURL(logsURL),
		);
	//Send error message
	try {
		const c = await client.channels.fetch(internalLogChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));
		c.send({ content: `<@${authorID}> URGENT ERROR NOTIFICATION`, embeds: [uncaughtErrorEmbed], components: [viewLogsButton] }).catch((e) => {
			console.error(`[ANTICRASH] Failed to send an error message: ${e}`);
		});
	}
	catch (e) {
		console.error(`[ANTICRASH] Failed to send an error message: ${e}`);
	}
}

module.exports.sendError = sendError;