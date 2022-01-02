const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: {
		name: 'timeOptionHelpButton',
	},
	async execute(interaction) {

		const colour = Math.floor(Math.random() * 16777215).toString(16);

		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		const helpEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Valid Time Formats')
			.setDescription('Seconds: `s`, Minutes: `m`, Hours: `h`, Days: `d`, Weeks: `w`\nYou can specify any number of units in any order.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		await interaction.reply({ embeds: [helpEmbed], components: [supportButton], ephemeral: true });
	},
};