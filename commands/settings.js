const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const t = require('rauls-discord-tickets');
const { botName, version, author, supportURL } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Edit the guild\'s settings!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('help')
				.setDescription('The title of the panel embed.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('paneltitle')
				.setDescription('The title of the panel embed.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('paneldescription')
				.setDescription('The description of the panel embed.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('embedfooter')
				.setDescription('The footer text of the panel.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('embedcolour')
				.setDescription('The colour of the panel embed.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reason1')
				.setDescription('The first reason for opening a ticket.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reason2')
				.setDescription('The second reason for opening a ticket.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reason3')
				.setDescription('The third reason for opening a ticket.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reason4')
				.setDescription('The fourth reason for opening a ticket.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reason5')
				.setDescription('The fith reason for opening a ticket.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('staffrole')
				.setDescription('The name of the staff role.')
				.addRoleOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ticketopenmessage')
				.setDescription('The message to send in a ticket when it is opened.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ticketopenembed')
				.setDescription('The description of the ticket open embed.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ticketopenembedfooter')
				.setDescription('The foooter of the ticket open embed.')
				.addStringOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('opencategory')
				.setDescription('The category in which the ticket will open.')
				.addChannelOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('transcript')
				.setDescription('Whether to generate and send transcripts.')
				.addBooleanOption(option => option.setName('value').setDescription('The value to update with.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('transcriptlogchannel')
				.setDescription('The channel in which to log transcripts.')
				.addChannelOption(option => option.setName('value').setDescription('The value to update with.'))),
	async execute(interaction) {

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', ephemeral: true });

		const permission = 'ADMINISTRATOR';

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		await interaction.deferReply({ ephemeral: true });

		const option = interaction.options.getSubcommand();
		let value;

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		if (option == 'help') {

			const settingsHelp = new MessageEmbed()
				.setTitle('Settings')
				.setDescription('Settings help menu will be added soon! Join our support server for help!')
				.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
				.setColor('RANDOM');

			return await interaction.editReply({ embeds: [settingsHelp], components: [supportButton] });
		}
		else if ((option === 'transcriptlogchannel') || (option === 'opencategory')) {
			value = interaction.options.getRole('value');
		}

		else if (option === 'transcript') {
			value = interaction.options.getBoolean('value');
		}

		else if (option === 'staffrole') {
			value = interaction.options.getRole('value');
		}
		else {
			value = interaction.options.getString('value');
		}

		const result = await t.editSettings(interaction, option, value);

		const unableToUpdateEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('Could not update database! Join our support server for help!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const errorEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('An unknown error has occured! Join our support server for help!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const successEmbed = new MessageEmbed()
			.setTitle('Success!')
			.setDescription(`Successfully updated ${option}!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('GREEN');

		switch (result) {
		case 'Could not update database':
			return await interaction.editReply({ embeds: [unableToUpdateEmbed], components: [supportButton] });
		case 'Settings updated sucessfully':
			return await interaction.editReply({ embeds: [successEmbed] });
		default:
			return await interaction.editReply({ embeds: [errorEmbed], components: [supportButton] });
		}

	},
};