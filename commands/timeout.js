const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../config.json');
const sd = require('simple-duration-converter');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Time someone out!')
		.addUserOption(option => option.setName('target').setDescription('The user to timeout!')
			.setRequired(true))
		.addStringOption(option => option.setName('time').setDescription('Time in seconds to timeout!')
			.setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for the timeout!')
			.setRequired(true)),
	async execute(interaction) {

		const permission = 'MODERATE_MEMBERS';

		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to execute the command.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!' });

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getMember('target');
		const timeStr = interaction.options.getString('time');
		const reason = interaction.options.getString('reason');
		let time;

		//Support button
		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);
		//All embeds
		const botLacksPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**The bot does not have permission to moderate this user!**\nPlease ensure the bots role is above the user you wish to moderate!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const invalidTimeFormatEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**This is not a valid time format!**\nTo see valid time formats click the button below.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const genericError = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**An error has occured!**\n')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const timedOutEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Timed Out!')
			.setDescription(`${target} has been successfully timed out!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Converts entered time to miliseconds
		try {
			time = sd.parse(timeStr);
			time = time * 1000;
		}
		catch {
			//Adds timeOptionHelpButton to supportButton row
			supportButton.addComponents(
				new MessageButton()
					.setCustomId('timeOptionHelpButton')
					.setLabel('View more information!')
					.setStyle('PRIMARY'));
			return await interaction.reply({ embeds: [invalidTimeFormatEmbed], ephemeral: true, components: [supportButton] });
		}

		if (!target.moderatable) return await interaction.reply({ embeds: [botLacksPermsEmbed], ephemeral: true, components: [supportButton] }); //If bot's role is same as or below target

		try {
			await target.timeout(time, reason);
			return await interaction.reply({ embeds: [timedOutEmbed], ephemeral: true }); //If successfully timed out target
		}
		catch (e) {
			return await interaction.reply({ content: `Could not time out user: ${e}`, embeds: [genericError], ephemeral: true, components: [supportButton] }); //Sends error message if fails to time out target
		}



	},
};