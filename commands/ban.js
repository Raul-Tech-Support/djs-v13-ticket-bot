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
			.addChoice('0', '0')
			.addChoice('1', '1')
			.addChoice('2', '2')
			.addChoice('3', '3')
			.addChoice('4', '4')
			.addChoice('5', '5')
			.addChoice('6', '6')
			.addChoice('7', '7')
			.addChoice('8', '8')
			.addChoice('9', '9')
			.addChoice('10', '10')
			.addChoice('11', '11')
			.addChoice('12', '12')
			.addChoice('13', '13')
			.addChoice('14', '14')),
	async execute(interaction, client) {

		const permission = 'BAN_MEMBERS';

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
		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetedBotEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Woah There!')
			.setDescription(':cry: I can\'t ban myself! Even if Discord allowed me to that wouldn\'t be very nice.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetedSelfEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Woah There!')
			.setDescription('You can\'t ban yourself!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to ban members.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', components: [supportButton] });

		if (target.id === client.user.id) return await interaction.reply({ embeds: [targetedBotEmbed], ephemeral: true, components: [supportButton] }); //If bot is targeted

		if (target.id === interaction.user.id) return await interaction.reply({ embeds: [targetedSelfEmbed], ephemeral: true, components: [supportButton] }); //If user targets self

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
			console.error(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });

		default:
			console.error(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });
		}

		try {
			await target.ban({ days: days | 7, reason: reason })
				.catch(error => interaction.reply({ content: `I couldn't ban ${target.username} because of \`${error}\``, ephemeral: true }));

			return await interaction.reply({ content: bannedContent, embeds: [bannedEmbed], ephemeral: true }); //If successfully banned target
		}
		catch (e) {
			return await interaction.reply({ content: `Could not ban user: ${e}`, embeds: [genericError], ephemeral: true, components: [supportButton] }); //Sends error message if fails to ban target
		}

	},
};