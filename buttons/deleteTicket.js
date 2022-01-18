const t = require('rauls-discord-tickets');

module.exports = {
	data: {
		name: 'deleteTicket',
	},
	async execute(interaction) {
		let result;

		await interaction.deferReply();

		if (!interaction.inGuild) return await interaction.editReply({ content: 'This button cannot be executed inside DM\'s!' });

		await interaction.editReply({ content: 'Deleting ticket in 5 seconds!' }).then(() => {
			setTimeout(async () => {
				result = await t.deleteTicket(interaction.channel).then(async () => {
					switch (result) {
					case 'Success':
						return;
					case 'Not a closed ticket':
						await interaction.editReply();
						break;
					case 'Failed to delete':
						console.error(`Could not delete channel ${interaction.channel.name} in guild ${interaction.guild.name}`);
						break;
					case 'Probably deleted':
						console.error(`Could not delete channel ${interaction.channel.name} in guild ${interaction.guild.name}. It was likely already deleted.`);
						break;
					default:
						console.error('An unknown error occured in delete ticket: ' + result);
					}
				});
			}, 5000);
		});

		if (result) {
			await interaction.editReply({ content: result });
		}
	},
};