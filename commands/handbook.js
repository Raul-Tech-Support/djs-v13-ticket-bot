const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { botName, version, author, debug } = require('../config.json');
const GuildSettings = require('../models/GuildSettings.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('handbook')
		.setDescription('Confirm you have read the handbook.')
		.addStringOption(option => option.setName('word').setDescription('The word from the handbook!')
			.setRequired(true)),
	async execute(interaction, client) {

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!' });

		//const colour = Math.floor(Math.random() * 16777215).toString(16);
		const word = interaction.options.getString('word');
		const guildSettings = await GuildSettings.findOne({ guildID: interaction.guild.id });
		const c = await client.channels.fetch(guildSettings.guildAdminLogChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));

		//All Embeds
		const suspendedEmbed = new MessageEmbed()
			.setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#FF8C00')
			.setDescription(`${interaction.user.tag} is currently suspended!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const helperGrantedEmbed = new MessageEmbed()
			.setAuthor({ name: `${interaction.user.tag} has read the handbook!`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#009900')
			.setDescription(`${interaction.user.tag} has been granted helper!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const unauthorizedVerifyEmbed = new MessageEmbed()
			.setAuthor({ name:`${interaction.user.tag} Tried to verify!`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#b90404')
			.setDescription(`${interaction.user.tag} tried to complete handbook verification however they do not have Discord/Trial Staff. They entered: "${word}"`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const helpNeededEmbed = new MessageEmbed()
			.setAuthor({ name: `New handbook help from: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#FFA500')
			.setDescription(`${interaction.user.tag} requires help with the handbook!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const failedVerificationEmbed = new MessageEmbed()
			.setAuthor({ name:`${interaction.user.tag} Failed the handbook verification!`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#b90404')
			.setDescription(`${interaction.user.tag} has failed the handbook verification: "${word}"`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const reVerificationEmbed = new MessageEmbed()
			.setAuthor({ name: `New handbook confirmation from: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true, size: 128 }) })
			.setColor('#660066')
			.setDescription(`${interaction.user.tag} has validated they have read the handbook!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//If the user is currently suspended send suspended embed to guildAdminLogChannel and notify user
		if (interaction.member.roles.cache.some(r => r.name === guildSettings.guildHandbookSuspendedRoleName)) {
			try {
				c.send({ embeds: [suspendedEmbed] });
				return await interaction.reply({ content: 'You cannot currently do this! Please open a staff suport ticket!', ephemeral: true });
			}
			catch (e) {
				return await interaction.reply({ content: `Could not send verification message: ${e}`, ephemeral: true });
			}
		}
		//If user does not yet have Discord Staff...
		else if (!interaction.member.roles.cache.some(r => r.name === guildSettings.guildHandbookAllStaffRoleName)) {
			//...but does have Trial Staff...
			if (interaction.member.roles.cache.some(r => r.name === guildSettings.guildHandbookTrialRoleName)) {
				//...& enters correct word (stored in guildSettings)
				if (word.toLowerCase() === guildSettings.guildHandbookVerificationWord) {
					try {
						let errorMessage = ' error(s) occured while executing this command: ', errorCount = 0;
						const awardRole1 = await interaction.guild.roles.cache.find(r => r.name === guildSettings.guildHandbookAllStaffRoleName);
						const awardRole2 = await interaction.guild.roles.cache.find(r => r.name === guildSettings.guildHandbookAwardRoleName);
						const member = interaction.member;
						if (awardRole1 && awardRole1.editable) {
							member.roles.add(awardRole1);
							if (debug) console.error(`[${botName}] Awarded ${guildSettings.guildHandbookAllStaffRoleName} in ${interaction.guild.name}`);
						}
						else {
							errorCount++;
							errorMessage = errorMessage + `The role ${guildSettings.guildHandbookAllStaffRoleName} could not be found or is above the bots role, please contact your Administration Team. `;
							if (debug) console.error(`[${botName}] Failed to award ${guildSettings.guildHandbookAllStaffRoleName} in ${interaction.guild.name}`);
						}
						if (awardRole2 && awardRole2.editable) {
							member.roles.add(awardRole2);
							if (debug) console.error(`[${botName}] Awarded ${guildSettings.guildHandbookAwardRoleName} in ${interaction.guild.name}`);
						}
						else {
							errorCount++;
							errorMessage = errorMessage + `The role ${guildSettings.guildHandbookAwardRoleName} could not be found or is above the bots role, please contact your Administration Team.`;
							if (debug) console.error(`[${botName}] Failed to award ${guildSettings.guildHandbookAwardRoleName} in ${interaction.guild.name}`);
						}

						if (errorCount !== 0) {
							c.send({ content: errorCount + errorMessage, embeds: [helperGrantedEmbed] });
							return await interaction.reply({ content: 'Thank you for reading the handbook, welcome to the staff team!\n\n' + errorCount + errorMessage, ephemeral: true });
						}
						else {
							c.send({ embeds: [helperGrantedEmbed] });
							return await interaction.reply({ content: 'Thank you for reading the handbook, welcome to the staff team!', ephemeral: true });
						}
					}
					catch (e) {
						console.error(`[${botName}] Could not add roles/send verification message: ${e}`);
						return await interaction.reply({ content: `Could not add roles/send verification message: ${e}`, ephemeral: true });
					}
				}
				//...& enters help
				else if (word.toLowerCase() === 'help') {
					try {
						c.send({ embeds: [helpNeededEmbed] });
						if (debug) console.error(`[${botName}] ${interaction.user.tag} requested help in ${guildSettings.guildHandbookAwardRoleName}`);
						return await interaction.reply({ content: 'Your request for help has been recieved!', ephemeral: true });
					}
					catch (e) {
						console.error(`[${botName}] Could not add help request message: ${e}`);
						return await interaction.reply({ content: `Could not send help request message: ${e}`, ephemeral: true });
					}
				}
				else {
					try {
						c.send({ embeds: [failedVerificationEmbed] });
						if (debug) console.error(`[${botName}] ${interaction.user.tag} failed verification in ${interaction.guild.name} with word ${word}`);
						return await interaction.reply({ content: `${word} is not the correct secret word!`, ephemeral: true });
					}
					catch (e) {
						return await interaction.reply({ content: `Could not send verification message: ${e}`, ephemeral: true });
					}
				}
			}
			else {
				try {
					c.send({ embeds: [unauthorizedVerifyEmbed] });
					if (debug) console.error(`[${botName}] ${interaction.user.tag} tried to verify in ${interaction.guild.name} with word ${word} however they do not have the required roles.`);
					return await interaction.reply({ content: 'You cannot run this command as you are not a current or trial member of staff!', ephemeral: true });
				}
				catch (e) {
					return await interaction.reply({ content: `Could not send message: ${e}\n`, ephemeral: true });
				}
			}
		}

		//If user has Discord Staff
		if (word.toLowerCase() === guildSettings.guildHandbookVerificationWord) {
			try {
				c.send({ embeds: [reVerificationEmbed] });
				if (debug) console.error(`[${botName}] ${interaction.user.tag} passed re-verification in ${interaction.guild.name}`);
				return await interaction.reply({ content: 'Thank you for reading the handbook!', ephemeral: true });
			}
			catch (e) {
				return await interaction.reply({ content: `Could not send verification message: ${e}`, ephemeral: true });
			}
		}
		else if (word.toLowerCase() === 'help') {
			try {
				c.send({ embeds: [helpNeededEmbed] });
				if (debug) console.error(`[${botName}] ${interaction.user.tag} requested help in ${interaction.guild.name}`);
				return await interaction.reply({ content: 'Your request for help has been recieved!', ephemeral: true });
			}
			catch (e) {
				return await interaction.reply({ content: `Could not send help request message: ${e}`, ephemeral: true });
			}
		}
		else {
			try {
				c.send({ embeds: [failedVerificationEmbed] });
				if (debug) console.error(`[${botName}] ${interaction.user.tag} failed verification in ${interaction.guild.name} with word ${word}`);
				return await interaction.reply({ content: `${word} is not the correct secret word!`, ephemeral: true });
			}
			catch (e) {
				console.error(`[${botName}] Failed to send verification message in ${interaction.guild.name}`);
				return await interaction.reply({ content: `Could not send verification message: ${e}`, ephemeral: true });
			}
		}

	},
};