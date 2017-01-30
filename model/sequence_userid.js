var mongoose = require('./db.js');

var userid_sequence = new mongoose.Schema({

    sequence_id : Number
    
});

var userid = mongoose.model('userid_sequence',userid_sequence);

module.exports = userid;