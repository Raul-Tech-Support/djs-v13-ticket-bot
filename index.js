const { options } = require('./assets/colours.json');
const { Client, Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { readdirSync, readdir } = require('fs');
const { REST } = require('@discordjs/rest');
require('dotenv').config();

const client = new Client({
	intents: [
		'GUILDS',
		'GUILD_MESSAGES',
	],
});

client.commands = new Collection();
client.colours = options;
client.token = process.env.TOKEN;
const cmds = [];

const commandFiles = readdirSync('./commands/').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Setting slash commands..');

		for (let i = 0; i < client.commands.toJSON().length; i++) {
			cmds.push(client.commands.toJSON()[i].data.toJSON());
		}

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{
				body: cmds,
			},
		);

		console.log('Success!');
	}
	catch (err) {
		console.error(err);
	}
})();

readdir('./events/', (err, files) => {
	if (err) return console.error();

	files.forEach(file => {
		if (!file.endsWith('.js')) return;

		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];

		if (file.toLowerCase() == 'ready.js') {
			client.once(eventName, event.bind(null, client));
			return;
		}

		client.on(eventName, event.bind(null, client));
	});
});

client.login(process.env.TOKEN);
