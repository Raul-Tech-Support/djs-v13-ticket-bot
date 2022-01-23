const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { botName, version, author, supportURL } = require('../../config.json');
const mongo = require('../../mongo.js');
const dmSchema = require('../../models/DMSave.js');


async function dmSave(message) {
	const userID = message.author.id;
	const userTag = message.author.tag;

	const msgAttachments = [];

	message.attachments.forEach(function(attachment) {
		msgAttachments.push(attachment.url);
	});

	const msg = {
		auth: message.author,
		messageID: message.id,
		content: message.cleanContent,
		attachments: msgAttachments,
	};

	try {
		await mongo().then(async (mongoose) => {
			try {
				await dmSchema.findOneAndUpdate(
					{
						userID,
						userTag,
					},
					{
						userID,
						userTag,
						$push: {
							content: msg,
						},
					},
					{
						upsert: true,
					},
				).then(async () => {
					await mongoose.connection.close();
				});
			}
			catch (error) {
				console.error(error);
			}
			//Support button
			const supportButton = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setLabel('Join our support server!')
						.setStyle('LINK')
						.setURL(supportURL),
				);
			const dmBotEmbed = new MessageEmbed()
				.setColor('RED')
				.setTitle('You\'ve DM\'d the bot!')
				.setDescription('It looks like you have DM\'ed the bot! Please do not reply to any messages you recieve in your DM\'s, these are not read. If you require assistance with a message you have recieved please contact the administrators of that guild for assistance!\n(Please note messages sent to the bot are logged for Trust and Saftey purposes.)')
				.setFooter({ text:`${botName} | Version ${version} | Developed by ${author}` });


			message.reply({ embeds: [dmBotEmbed], components: [supportButton] })
				.then(m => {

					setTimeout(function() {
						m.delete().catch(e => {console.log(`Could not delete message: ${e}`);});
					}, 30000);
				});
		});
	}
	catch (error) {
		console.error('Error saving recieved DM to the database!', error);
	}
}

module.exports.dmSave = dmSave;

