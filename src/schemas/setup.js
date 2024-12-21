const mongoose = require('mongoose');

const setupSchema = new mongoose.Schema({
  channel: String,
  staffrole: String,
  category: String,
  transcriptchannel: String,
  guild: String
  // Add more fields as needed
});

const setup = mongoose.model('setup', setupSchema);

module.exports = setup;