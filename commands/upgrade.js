/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('upgrade')
		.setDescription('Upgrade your plan!'),
	async execute(interaction) {


		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		return await interaction.reply({ content: 'This command is currently disabled!' });
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\
		//REMOVE THIS AND ESLINT FILE RULES\\



		await interaction.deferReply({ ephemeral: true });

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
					price: 'price_1KKTNvGuo26VuywcwjplfZPl',
					quantity: 1,
				},
			],
			mode: 'subscription',
			allow_promotion_codes: true,
			success_url: 'https://raultechsupport.uk/success.html',
			cancel_url: 'https://raultechsupport.uk/cancel.html',
		});

		const checkoutButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Checkout!')
					.setStyle('LINK')
					.setURL(session.url),
			);

		await interaction.editReply({ content: '', components: [checkoutButton] });

		console.log(session);



	},
};