const { generateConfig } = require('../assets/generateConfig.js');


module.exports = async (guild) => {

	await generateConfig(guild);

};