const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { botName, version, author } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get someone\'s avatar!')
		.addUserOption(option => option.setName('target').setDescription('The user\'s avatar to grab!')
			.setRequired(true))
		.addStringOption(option => option.setName('format').setDescription('The format of the user\'s avatar!')
			.addChoice('WEBP', 'webp')
			.addChoice('PNG', 'png')
			.addChoice('JPG', 'jpg')
			.addChoice('JPEG', 'jpeg'))
		.addIntegerOption(option => option.setName('size').setDescription('The size of the user\'s avatar!')
			.addChoice('16', 16)
			.addChoice('32', 32)
			.addChoice('56', 56)
			.addChoice('64', 64)
			.addChoice('96', 96)
			.addChoice('128', 128)
			.addChoice('256', 256)
			.addChoice('300', 300)
			.addChoice('512', 512)
			.addChoice('600', 600)
			.addChoice('1024', 1024)
			.addChoice('2048', 2048)
			.addChoice('4096', 4096)),
	async execute(interaction) {

		const colour = Math.floor(Math.random() * 16777215).toString(16);
		const target = interaction.options.getUser('target');
		let format = interaction.options.getString('format');
		let size = interaction.options.getInteger('size');

		if (!format) format = 'png';
		if (!size) size = 128;

		const imgLink = target.displayAvatarURL({
			format: format,
			dynamic: true,
			size: size,
		});

		const embed = new MessageEmbed()
			.setColor(colour)
			.setTitle(`Avatar for ${target.tag}`)
			.setImage(imgLink)
			.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });

		await interaction.reply({ embeds: [embed] });
	},
};