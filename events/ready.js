const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, logsURL, internalLogChannel, realiveRoleID, realiveGuildID } = require('../config.json');
const saveTimeout = require('../models/SaveTimeout.js');
const mongo = require('../mongo');

module.exports = async (client) => {
	console.log(`[${botName}] ${client.user.username} is up and running!`);

	client.user.setActivity(`${botName} v${version} - /help`);

	let guild, role, newDelay, timeoutEndTime;

	//Initialise mongo connection
	await mongo();

	//Fetch guild for realive cooldown
	try {
		guild = client.guilds.cache.find(guildID => guildID.id === realiveGuildID);
	}
	catch {
		console.error(`[${botName}] Unable to fetch guild! Is the bot in the guild?`);
	}

	//Fetch realive role
	try {
		role = guild.roles.cache.find(roleID => roleID.id === realiveRoleID);
	}
	catch {
		console.error(`[${botName}] Unable to fetch role! Is the bot in the guild or has the role been deleted?`);
	}


	if (guild && role) {

		let endTime = await saveTimeout.findOne();
		try {
			endTime = endTime.timeoutEnd;
			newDelay = endTime - Date.now();

			const date = Date.now();
			timeoutEndTime = date + newDelay;
		}
		catch {
			console.log(`[${botName}] No realive timeout found!`);
		}

		if (newDelay <= 0) {
			role.setMentionable(true, 'Realive cooldown ended').catch(e => console.error(`[${botName}] Failed to make role mentionable: ${e}`));
			await saveTimeout.deleteMany();
		}

		else {
			await saveTimeout.deleteMany().catch(e => console.error(`[${botName}] Failed to clear timeouts: ${e}`));

			const newTimeout = new saveTimeout({
				timeoutEnd: timeoutEndTime,
			});

			await newTimeout.save().catch(e => console.error(`[${botName}] Failed to save timeout: ${e}`));



			setTimeout(async function() {
				role.setMentionable(true, 'Realive cooldown ended').catch(e => console.error(`[${botName}] Failed to make role mentionable: ${e}`));
				await saveTimeout.deleteMany().catch(e => console.error(`[${botName}] Failed to clear timeouts: ${e}`));
			}, newDelay);
		}
	}

	//Begin construction of start message - Construct button
	const viewLogsButton = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setLabel('View logs!')
				.setStyle('LINK')
				.setURL(logsURL),
		);

	//Construct startup message embed
	const ts = Math.round((new Date()).getTime() / 1000);
	const colour = Math.floor(Math.random() * 16777215).toString(16);
	const bootEmbed = new MessageEmbed()
		.setTitle('Booted!')
		.setDescription(`${botName} has booted at: <t:${ts}>!`)
		.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
		.setColor(colour);

	//Send startup message
	try {
		const c = await client.channels.fetch(internalLogChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));
		c.send({ embeds: [bootEmbed], components: [viewLogsButton] }).catch((error) => {
			console.error(`[${botName}] Failed to send a boot message: ${error}`);
		});
	}
	catch (error) {
		console.error(`[${botName}] Failed to send a boot message: ${error}`);
	}


};
