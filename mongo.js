const { botName, debug } = require('./config.json');
const mongoose = require('mongoose');

module.exports = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		if (debug) console.info(`[${botName}] Succesfully connected to the database`);

		return mongoose;

	}
	catch {
		console.error(`[${botName}] Failed to connect to the database`);
	}
};