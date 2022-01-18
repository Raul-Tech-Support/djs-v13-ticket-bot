const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const t = require('rauls-discord-tickets');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createpanel')
		.setDescription('Create a new ticket panel!')
		.addChannelOption(option => option.setName('channel').setDescription('The channel in which to send the panel!')
			.setRequired(true)),
	async execute(interaction) {

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', ephemeral: true });

		const permission = 'ADMINISTRATOR';

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		const channel = interaction.options.getChannel('channel');
		if (!channel.isText()) return await interaction.reply({ content: 'This is not a text channel!', ephemeral:true });

		const result = await t.setup(interaction, channel.id);

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
			//All Embeds
		const setupIncorrectly = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('This panel has been setup incorrectly! Please follow the instructions in the above message.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const errorEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('An error occured when creating the panel! Further details have been logged to console. Please report this.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const successEmbed = new MessageEmbed()
			.setTitle('Ticket Opened!')
			.setDescription(`A new ticket has been created: <#${result}>`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('GREEN');

		switch (result) {
		case 'No reasons':
			return await interaction.editReply({ content: 'No reasons to open a ticket! Please add one or more using the `/settings` command!', embeds: [setupIncorrectly] });
		case 'Ticket panel created':
			return await interaction.editReply({ content: 'InvalidTicketID - Please report this using the button below.', embeds: [successEmbed], components: [supportButton] });
		case 'Error creating ticket panel':
			return await interaction.editReply({ embeds: [errorEmbed], components: [supportButton] });
		default:
			return await interaction.editReply({ embeds: [errorEmbed], components: [supportButton] });
		}
	},
};