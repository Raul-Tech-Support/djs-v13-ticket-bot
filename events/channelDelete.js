const t = require('rauls-discord-tickets');

module.exports = async (client, channel) => {

	await t.removeDBTicket(channel);
};
