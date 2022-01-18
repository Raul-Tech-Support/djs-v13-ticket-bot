const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const t = require('rauls-discord-tickets');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: {
		name: 'closeTicket',
	},
	async execute(interaction, client) {

		await interaction.deferReply({ ephemeral: true });

		if (!interaction.inGuild) return await interaction.editReply({ content: 'This button cannot be executed inside DM\'s!' });

		const result = await t.close(interaction.channel, interaction.guild, interaction.member, client);

		//Create and send closed Embed & buttons.
		const closedTicketEmbed = new MessageEmbed()
			.setTitle('Ticket Closed')
			.setDescription(`Ticket closed by ${interaction.user.tag}`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RANDOM');

		const closedTicketOptionsButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('deleteTicket')
					.setLabel('Delete')
					.setEmoji('⛔')
					.setStyle('DANGER'),
			);


		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
		//All Embeds
		const notOpenEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('This is not an open ticket!\nHas it already been closed?')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const failedToEditDBEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('Failed to update the database! Please try again later or contact the developer!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const successEmbed = new MessageEmbed()
			.setTitle('Ticket Closed!')
			.setDescription('Ticket closed successfully!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('GREEN');


		switch (result) {
		case 'Not an open ticket':
			return await interaction.editReply({ embeds: [notOpenEmbed] });
		case 'Failed to edit DB':
			return await interaction.editReply({ content: 'Please report this using the button below.', embeds: [failedToEditDBEmbed], components: [supportButton] });
		case 'Success':
			await interaction.editReply({ embeds: [successEmbed] });
			break;
		default:
			return await interaction.editReply({ content: 'An unknown error has occured!, please report this using the button below!', components: [supportButton] });
		}



		await interaction.channel.send({ embeds: [closedTicketEmbed], components: [closedTicketOptionsButton] });


	},
};