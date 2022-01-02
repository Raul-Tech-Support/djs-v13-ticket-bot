const { MessageEmbed } = require('discord.js');
const { botName, version, author } = require('../config.json');
const generateConfig = require('../assets/generateConfig.js');

module.exports = {
	data: {
		name: 'generateConfigButton',
	},
	async execute(interaction) {

		const permission = 'ADMINISTRATOR';

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to execute command.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!' });

		await interaction.deferReply({ ephemeral: true });

		const conf = await generateConfig(interaction.guild);

		await interaction.editReply(conf);
	},
};