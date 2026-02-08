var mongoose = require('mongoose');

// Schema-less: bármit elfogad — az objektum megy le ahogy van
var TranslateUserSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model('TranslateUser', TranslateUserSchema);
