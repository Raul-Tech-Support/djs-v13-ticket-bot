const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('boop')
		.setDescription('Boop someone!')
		.addUserOption(option => option.setName('target').setDescription('The user to boop!')
			.setRequired(true)),
	async execute(interaction) {

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!' });

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getUser('target');

		const embed = new MessageEmbed()
			.setColor(colour)
			.setTitle('BOOP!')
			.setDescription(`You have been booped by ${interaction.member}`)
			.setFooter({ text: 'You are cool have a good day!' });

		await interaction.reply({ content: `<@${target.id}>`, embeds: [embed] });
	},
};