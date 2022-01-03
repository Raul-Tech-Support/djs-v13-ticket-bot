const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const generateConfig = require('../assets/generateConfig.js');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generateconfig')
		.setDescription('Generate a config for the current guild!'),
	async execute(interaction) {

		const permission = 'ADMINISTRATOR';

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to execute command.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', components: [supportButton] });

		await interaction.deferReply({ ephemeral: true });

		const conf = await generateConfig(interaction.guild);

		await interaction.editReply(conf);
	},
};