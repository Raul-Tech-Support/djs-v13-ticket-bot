const { dmSave } = require('./event_functions/dmSave');
const { realive } = require('./event_functions/realive');


module.exports = async (client, message) => {

	//Realive mention check - If realive role is mentioned make role unmentionable.
	if (message.mentions.roles.first() !== undefined) await realive(message);

	if (message.guild === null && message.author.bot === false) await dmSave(message);

};