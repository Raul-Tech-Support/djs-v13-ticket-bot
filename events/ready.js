const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, logsURL, internalLogChannel, realiveRoleID, realiveGuildID } = require('../config.json');
const mongoose = require('mongoose');
const saveTimeout = require('../models/SaveTimeout.js');

module.exports = async (client) => {
	console.log(`${client.user.username} is up and running!`);

	client.user.setActivity(`${botName} v${version} - /help`);

	const Guilds = client.guilds.cache.map(guild => guild.id);
	console.log(Guilds);

	let guild, role, newDelay, timeoutEndTime;


	//Fetch guild for realive cooldown
	try {
		guild = client.guilds.cache.find(guildID => guildID.id === realiveGuildID);
	}
	catch {
		console.log('Unable to fetch guild! Is the bot in the guild?');
	}

	//Fetch realive role
	try {
		role = guild.roles.cache.find(roleID => roleID.id === realiveRoleID);
	}
	catch {
		console.log('Unable to fetch role! Is the bot in the guild or has the role been deleted?');
	}


	if (guild && role) {
		//Connect to database.
		mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		let endTime = await saveTimeout.findOne();
		try {
			endTime = endTime.timeoutEnd;
			newDelay = endTime - Date.now();

			const date = Date.now();
			timeoutEndTime = date + newDelay;
		}
		catch {
			console.log('No realive timeout found!');
		}

		if (newDelay <= 0) {
			role.setMentionable(true, 'Realive cooldown ended');
			await saveTimeout.deleteMany();
		}

		else {
			await saveTimeout.deleteMany();

			const newTimeout = new saveTimeout({
				timeoutEnd: timeoutEndTime,
			});

			await newTimeout.save().catch(e => console.log(`Failed to save timeout: ${e}`));



			setTimeout(async function() {
				role.setMentionable(true, 'Realive cooldown ended');
				await saveTimeout.deleteMany();
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
		.setFooter(`${botName} | Version: ${version} | Developed by ${author}`)
		.setColor(colour);

	//Send startup message
	client.channels.fetch(internalLogChannel)
		.then(channel => {
			channel.send({ embeds: [bootEmbed], components: [viewLogsButton] }).catch((error) => {
				console.log(`Failed to send a boot message: ${error}`);
			});
		});

};
