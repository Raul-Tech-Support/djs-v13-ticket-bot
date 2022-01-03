const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../config.json');
const GuildSettings = require('../models/GuildSettings.js');

module.exports = {
	data:
	new SlashCommandBuilder()
		.setName('away')
		.setDescription('Notifty the admin team you will be away!')
		.addStringOption(option => option.setName('reason').setDescription('The reason you will be away!')
			.setRequired(true)),
	async execute(interaction, client) {

		const permission = 'MANAGE_MESSAGES';

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const reason = interaction.options.getString('reason');

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
		//All embeds
		const genericError = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**An error has occured!**\n')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const notInGuildEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Invaild Channel!')
			.setDescription('The channel you have defined could not be found in this guild! Please ensure you use a channel in the current guild.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const reportSendEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Success!')
			.setDescription('Your away report has been sent! Thank you for informing us of your absence.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to ban members.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', components: [supportButton] });

		const guildSettings = await GuildSettings.findOne({ guildID: interaction.guild.id });

		const awayEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle(`New away report from ${interaction.user.tag}`)
			.setDescription(`Message: \`${reason}\``)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		try {
			let found = false;

			interaction.guild.channels.cache.forEach(channel => {

				if (channel.id === guildSettings.guildAdminLogChannel) {

					found = true;
				}
			});

			if (!found) return await interaction.reply({ embeds: [notInGuildEmbed], ephemeral: true });

			const c = await client.channels.fetch(guildSettings.guildAdminLogChannel).catch(e => console.error(`[${botName}] Failed to fetch channel: ${e}`));
			c.send({ embeds: [awayEmbed] }).catch((error) => {
				console.error(`[${botName}] Failed to send away message: ${error}`);
			});

			return await interaction.reply({ embeds: [reportSendEmbed], ephemeral: true });
		}
		catch (e) {
			return await interaction.reply({ content: `Could not send away report: ${e}`, embeds: [genericError], ephemeral: true, components: [supportButton] });
		}


	},
};