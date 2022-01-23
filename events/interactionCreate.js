const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { supportURL, botName, version, author } = require('../config.json');

module.exports = async (client, interaction) => {
	const { commandName } = interaction;

	const reportButton = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setLabel('Report this!')
				.setStyle('LINK')
				.setURL(supportURL),
		);

	const buttonNotFoundEmbed = new MessageEmbed()
		.setColor('RED')
		.setTitle('Error!')
		.setDescription('This button was not found! Please report this using the button below.')
		.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });


	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId);

		if (!button) return await interaction.reply({ embeds: [buttonNotFoundEmbed], components: [reportButton], ephemeral: true });

		try {
			await button.execute(interaction, client);
		}
		catch (error) {
			console.error(`[${botName}] There was an error when trying to execute the button: ${interaction.customId}\n${error}`);
			await interaction.reply({ content: 'There was an error whie executing this button: ' + error, ephemeral: true, components: [reportButton] });
		}
	}

	if (!interaction.isCommand() || !client.commands.has(commandName)) return;

	try {
		await client.commands.get(commandName).execute(interaction, client);
	}
	catch (error) {

		reportButton.addComponents(
			new MessageButton()
				.setCustomId('generateConfigButton')
				.setLabel('Generate config!')
				.setStyle('PRIMARY'),
		);

		console.error(`[${botName}] There was an error when trying to execute the command: ${commandName}\n${error}`);
		try {
			await interaction.reply({ content: `There was an error whie executing this command: ${error}\nDo you need to generate a config via \`/generateconfig\` or the button below?`, ephemeral: true, components: [reportButton] });
		}
		catch {
			await interaction.editReply({ content: `There was an error whie executing this command: ${error}\nDo you need to generate a config via \`/generateconfig\` or the button below?`, ephemeral: true, components: [reportButton] });
		}
	}
};
