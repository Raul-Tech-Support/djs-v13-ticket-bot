const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const superagent = require('superagent');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Get a random cat image!'),
	async execute(interaction) {

		let breed = '', body;

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		try {
			body = await superagent.get('https://api.thecatapi.com/v1/images/search');
		}
		catch (error) {
			const errorEmbed = new MessageEmbed()
				.setColor('RED')
				.setTitle('Error!')
				.setDescription('**The API used in this command is not responding!**\nPlease try again later.')
				.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
			console.error(`[${botName}] Failed to send log message: ${error}`);
			return await interaction.reply({ embeds: [errorEmbed], components: [supportButton] });
		}
		console.log(body);
		console.log(body.breeds);

		if (body.breeds) {
			console.log('s');
		}

		if (body.breeds) {
			breed = body.breeds.name;
			const embed = new MessageEmbed()
				.setTitle('Random cat:')
				.setFooter({ text: `Breed: ${breed}` })
				.setImage(body.url);
			await interaction.reply({ embeds: [embed] });
		}
		else {
			const embed = new MessageEmbed()
				.setTitle('Random cat:')
				.setImage(body.url);
			await interaction.reply({ embeds: [embed] });
		}
	},
};