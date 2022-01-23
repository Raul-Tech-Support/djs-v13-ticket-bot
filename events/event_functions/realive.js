const saveTimeout = require('../../models/SaveTimeout.js');
const { realiveCooldown, realiveRoleID, botName } = require('../../config.json');

async function realive(message) {
	if (!(message.mentions.roles.first().id === realiveRoleID && message.author.bot === false)) return;

	let role;

	try {
		role = message.guild.roles.cache.find(roleID => roleID.id === realiveRoleID);
	}
	catch {
		console.error(`[${botName}] Unable to fetch role! Is the bot in the guild or has the role been deleted?`);
	}

	role.setMentionable(false, 'Realive cooldown').catch(e => {console.error(`[${botName}] Could not edit role: ${e}`);});

	const date = Date.now();
	const timeoutEndTime = date + realiveCooldown;

	await saveTimeout.deleteMany();

	const newTimeout = new saveTimeout({
		timeoutEnd: timeoutEndTime,
	});

	await newTimeout.save().catch(e => console.error(`[${botName}] Failed to save timeout: ${e}`));

	setTimeout(function() {
		role.setMentionable(true, 'Realive cooldown ended').catch(e => {console.log(`Could not edit role: ${e}`);});
	}, realiveCooldown);
}

module.exports.realive = realive;