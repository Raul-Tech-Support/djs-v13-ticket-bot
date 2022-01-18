const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const t = require('rauls-discord-tickets');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: {
		name: 'ticketOpen5',
	},
	async execute(interaction) {


		await interaction.deferReply({ ephemeral: true });

		if (!interaction.inGuild) return await interaction.editReply({ content: 'This button cannot be executed inside DM\'s!' });

		const result = await t.open(interaction.guild, interaction.user, 5);
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
			.setDescription('This panel has been setup incorrectly! Please report this to a staff member.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const failedToFetchOwnershipEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('Could not fetch ticket ownership status! Please try again later or contact the developer!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const alreadyHaveTicketEmbed = new MessageEmbed()
			.setTitle('Error!')
			.setDescription('You already have an open ticket! Please close it before opening a new one!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('RED');
		const successEmbed = new MessageEmbed()
			.setTitle('Ticket Opened!')
			.setDescription(`A new ticket has been created: <#${result}>`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` })
			.setColor('GREEN');


		switch (result) {
		case 'No staff role':
			await interaction.editReply({ content: 'No Staff Role', embeds: [setupIncorrectly] });
			break;
		case 'Invalid ticketReasonID provided':
			await interaction.editReply({ content: 'InvalidTicketID - Please report this using the button below.', embeds: [setupIncorrectly], components: [supportButton] });
			break;
		case 'Parent not found':
			await interaction.editReply({ content: 'Parent Not Found', embeds: [setupIncorrectly] });
			break;
		case 'Already has ticket':
			await interaction.editReply({ embeds: [alreadyHaveTicketEmbed] });
			break;
		case 'Could not fetch ticket ownership status':
			await interaction.editReply({ embeds: [failedToFetchOwnershipEmbed], components: [supportButton] });
			break;
		default:
			await interaction.editReply({ embeds: [successEmbed] });
			break;
		}


	},
};