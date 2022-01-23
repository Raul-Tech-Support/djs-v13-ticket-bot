const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('untimeout')
		.setDescription('Time someone out!')
		.addUserOption(option => option.setName('target').setDescription('The user whos timeout to remove!')
			.setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for removing the timeout!')
			.setRequired(true)),
	async execute(interaction, client) {

		const permission = 'MODERATE_MEMBERS';

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getMember('target');
		const reason = interaction.options.getString('reason');

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', components: [supportButton] });

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
		//All embeds
		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const botLacksPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**The bot does not have permission to moderate this user!**\nPlease ensure the bots role is above the user you wish to moderate!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetedBotEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Woah There!')
			.setDescription('I can\'t moderate myself!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetedSelfEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Woah There!')
			.setDescription('You can\'t remove your own timeout!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const genericError = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**An error has occured!**\n')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const timedOutEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Timeout Removed!')
			.setDescription(`${target}'s timeout has been removed!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });


		//Ensure interaction member has permission to execute the command.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (target.id === client.user.id) return await interaction.reply({ embeds: [targetedBotEmbed], ephemeral: true, components: [supportButton] }); //If bot is targeted
		if (target.id === interaction.user.id) return await interaction.reply({ embeds: [targetedSelfEmbed], ephemeral: true, components: [supportButton] }); //If user targets self
		if (!target.moderatable) return await interaction.reply({ embeds: [botLacksPermsEmbed], ephemeral: true, components: [supportButton] }); //If bot's role is same as or below target

		try {
			await target.timeout(null, reason);
			return await interaction.reply({ embeds: [timedOutEmbed], ephemeral: true }); //If successfully timed out target
		}
		catch (e) {
			return await interaction.reply({ content: `Could not remove timeout from user: ${e}`, embeds: [genericError], ephemeral: true, components: [supportButton] }); //Sends error message if fails to time out target
		}

	},
};