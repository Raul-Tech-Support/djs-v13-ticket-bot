const { Client, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { botName, debug } = require('./config.json');
const { sendError } = require ('./sendError');
const { readdirSync, readdir } = require('fs');
require('dotenv').config();

const client = new Client({
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_MESSAGES',
		'DIRECT_MESSAGES',
	],
	partials: [
		'CHANNEL',
	],
});

client.commands = new Collection();
client.buttons = new Collection();
client.token = process.env.TOKEN;
const cmds = [];

const getDirectories = readdirSync('./commands/', { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name);

for (const directory of getDirectories) {
	const commandFiles = readdirSync(`./commands/${directory}/`).filter(f => f.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${directory}/${file}`);

		client.commands.set(command.data.name, command);
	}
}



const commandFiles = readdirSync('./commands/').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

const buttonFiles = readdirSync('./buttons/').filter(f => f.endsWith('.js'));

for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);

	client.buttons.set(button.data.name, button);
}


const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		if (debug) console.log(`[${botName}] Registering slash commands...`);

		for (let i = 0; i < client.commands.toJSON().length; i++) {
			cmds.push(client.commands.toJSON()[i].data.toJSON());
		}

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{
				body: cmds,
			},
		);

		if (debug) console.log(`[${botName}] Success! Slash commands have been successfully registered.`);
	}
	catch (err) {
		console.error(`[${botName}] Error! Could not register slash commands: ${err}`);
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


//ANIT CRASH MEASURES
process.on('unhandledRejection', (reason, p) => {
	console.error('[ANTICRASH] Unhandled Rejection/Catch - WARNING THIS IS NOT A SUITABLE ALTERNATIVE TO PROPER ERROR HANDLING. PLEASE RESTART THE BOT AS SOON AS POSSIBLE AND FIX THE ERROR.');
	console.error(reason, p);

	sendError(client, reason.toString());
});
process.on('uncaughtException', (err, origin) => {
	console.error('[ANTICRASH] Uncaught Exception/Catch - WARNING THIS IS NOT A SUITABLE ALTERNATIVE TO PROPER ERROR HANDLING. PLEASE RESTART THE BOT AS SOON AS POSSIBLE AND FIX THE ERROR.');
	console.error(err, origin);

	sendError(client, err.toString());
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.error('[ANTICRASH] Uncaught Exception/Catch (MONITOR) - WARNING THIS IS NOT A SUITABLE ALTERNATIVE TO PROPER ERROR HANDLING. PLEASE RESTART THE BOT AS SOON AS POSSIBLE AND FIX THE ERROR.');
	console.error(err, origin);

	sendError(client, err.toString());
});
process.on('multipleResolves', (type, promise, reason) => {
	console.error('[ANTICRASH] Multiple Resolves - WARNING THIS IS NOT A SUITABLE ALTERNATIVE TO PROPER ERROR HANDLING. PLEASE RESTART THE BOT AS SOON AS POSSIBLE AND FIX THE ERROR.');
	console.error(type, promise, reason);

	sendError(client, reason.toString());
});
//END ANTI CRASH

client.login(process.env.TOKEN);
