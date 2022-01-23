const mongoose = require('mongoose');

const DMSaveSchema = new mongoose.Schema({
	userID: { type: String },
	userTag: { type: String },
	content: { type: [Object] },
});

module.exports = mongoose.model('DMSave', DMSaveSchema);
