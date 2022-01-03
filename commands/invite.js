const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL, inviteBotLink } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get a link to invite the bot to your own server!'),
	async execute(interaction) {

		const colour = Math.floor(Math.random() * 16777215).toString(16);

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		const inviteEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Invite me!')
			.setDescription(`You can invite the bot to your own server by clicking [HERE](${inviteBotLink})`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		await interaction.reply({ embeds: [inviteEmbed], components: [supportButton] });
	},
};
