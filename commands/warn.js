/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const modLogCreate = require('../assets/modLogCreate.js');
const { botName, version, author, supportURL } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn someone!')
		.addUserOption(option => option.setName('target').setDescription('The user to warn!')
			.setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for the warn!')
			.setRequired(true)),
	async execute(interaction, client) {

		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		return await interaction.reply({ content: 'This command is currently disabled!' });
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\

		const permission = 'MODERATE_MEMBERS';

		const supportButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Join our support server!')
					.setStyle('LINK')
					.setURL(supportURL),
			);

		const botLacksPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Error!')
			.setDescription('**The bot does not have permission to moderate this user!**\nPlease ensure the bots role is above the user you wish to moderate!')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const insufficientPermsEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Insufficient Permissions!')
			.setDescription(`You do not have permission to execute this command!\nIt requires the \`${permission}\` permission.`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const targetInfoEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle(`You were warned in ${interaction.guild.name}`)
			.addField('Reason: ', `${reason}`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const warnedEmbed = new MessageEmbed()
			.setColor(colour)
			.setTitle('Warned!')
			.setDescription(`${target} has been successfully warned!`)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });
		const notInGuildEmbed = new MessageEmbed()
			.setColor('RED')
			.setTitle('Invaild Channel!')
			.setDescription('The channel you have defined could not be found in this guild! Please ensure you use a channel in the current guild.')
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		//Ensure interaction member has permission to ban members.
		if (!interaction.member.permissions.has(permission)) return await interaction.reply({ embeds: [insufficientPermsEmbed], ephemeral: true });

		if (!interaction.inGuild) return await interaction.reply({ content: 'This command cannot be executed inside DM\'s!', components: [supportButton] });

		if (!target.moderatable) return await interaction.reply({ embeds: [botLacksPermsEmbed], ephemeral: true, components: [supportButton] });

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason');

		await target.send({ embeds: [targetInfoEmbed] }).catch(() => {
			const replyContent = 'Failed to send user a ban DM. They likely have server DM\'s disabled.';
		});

		const result = await modLogCreate(interaction.guild, client, target, interaction.member, reason, 'warned');

		switch (result) {
		case 'other guild':
			return await interaction.reply({ embeds: [notInGuildEmbed], ephemeral: true });

		case 'sucess':
			break;

		case 'error':
			console.log(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });

		default:
			console.log(`[${botName}] An error has occured in modLogCreate result switch statement.`);
			return await interaction.reply({ content: 'An unknown error has occured' });
		}
	},
};