const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../config.json');
const GuildSettings = require('../models/GuildSettings.js');
const modLogCreate = require('../assets/modLogCreate.js');
//const mongo = require('../mongo');
//const sd = require('simple-duration-converter');

module.exports = {
	data:
	new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban someone!')
		.addUserOption(option => option.setName('target').setDescription('The user to ban!')
			.setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for the ban!')
			.setRequired(true))
		.addStringOption(option => option.setName('anonymous').setDescription('Whether this ban should be anonymous!')
			.addChoice('True', 'true'))
		.addStringOption(option => option.setName('silent').setDescription('Whether this ban should be silent!')
			.addChoice('True', 'true'))
		.addStringOption(option => option.setName('days').setDescription('The number of days to delete!')
			.addChoice('True', 'true')),
	async execute(interaction, client) {

		const permission = 'BAN_MEMBERS';

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to ban members.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });


		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!' });

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getMember('target');
		const reason = interaction.options.getString('reason');
		const anonymous = interaction.options.getString('anonymous');
		const silent = interaction.options.getString('silent');
		const days = interaction.options.getString('days');
		const moderator = interaction.member;
		let bannedContent;

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
		//All embeds
		const botLacksPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**The bot does not have permission to moderate this user!**\nPlease ensure the bots role is above the user you wish to moderate!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const genericError = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**An error has occured!**\n')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetInfoEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle(`You were banned from ${interaction.guild.name}`)
			.addField('Reason: ', `${reason}`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const bannedEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Banned!')
			.setDescription(`${target} has been successfully banned!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const notInGuildEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Invaild Channel!')
			.setDescription('The channel you have defined could not be found in this guild! Please ensure you use a channel in the current guild.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//If bot's role is same as or below target
		if (!target.moderatable) return await interaction.reply({ embeds: [botLacksPermsEmbed], ephemeral: true, components: [supportButton] });

		const guildSettings = await GuildSettings.findOne({ guildID: interaction.guild.id });

		//Add ban user, or "Anonymous" if that was selected.
		if (anonymous === 'true') {
			targetInfoEmbed
				.addField('Banned By: ', 'Anonymous')
				.addField('Appeal At: ', guildSettings.guildAppealLink);
		}
		else {
			targetInfoEmbed
				.addField('Banned By: ', `${interaction.user}`)
				.addField('Appeal At: ', guildSettings.guildAppealLink);
		}


		//Send ban message if not silent.
		if (silent !== 'true') {
			try {

				let found = false;

				interaction.guild.channels.cache.forEach(channel => {

					if (channel.id === guildSettings.guildBanAnnounceChannel) {

						found = true;
					}
				});

				if (!found) return await interaction.reply({ embeds: [notInGuildEmbed], ephemeral: true });

				let guildMessage = guildSettings.guildBanAnnounceMessage.replace('%target%', target);

				if (anonymous === 'true') {
					guildMessage = guildMessage.replace('%moderator%', 'Anonymous');
				}
				else {
					guildMessage = guildMessage.replace('%moderator%', moderator);
				}
				guildMessage = guildMessage.replace('%reason%', reason);


				const c = await client.channels.fetch(guildSettings.guildBanAnnounceChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));
				c.send({ content: guildMessage }).catch((error) => {
					console.error(`[${botName}] Failed to send log message: ${error}`);
				});

			}
			catch (error) {
				console.error(`[${botName}] Failed to send log message: ${error}`);
			}
		}

		await target.send({ embeds: [targetInfoEmbed] }).catch(() => {
			bannedContent = 'Failed to send user a ban DM. They likely have server DM\'s disabled.';
		});

		const result = await modLogCreate(interaction.guild, client, target, moderator, reason, 'BANNED');

		switch (result) {
		case 'other guild':
			return await interaction.reply({ embeds: [notInGuildEmbed], ephemeral: true });

		case 'sucess':
			break;

		case 'error':
			console.log(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });

		default:
			console.log(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });
		}

		try {
			await target.ban({ days: days | 7, reason: reason })
				.catch(error => interaction.reply({ content: `I couldn't ban ${target.username} because of \`${error}\``, ephemeral: true }));

			return await interaction.reply({ content: bannedContent, embeds: [bannedEmbed], ephemeral: true }); //If successfully banned target
		}
		catch (e) {
			return await interaction.reply({ content: `Could not ban user: ${e}`, embeds: [genericError], ephemeral: true, components: [supportButton] }); //Sends error message if fails to time out target
		}

	},
};