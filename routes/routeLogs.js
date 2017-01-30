var logger = require("../public/logger");
exports.getLogs=function queryLog(req, res, next) {
    
    //var offset = parseInt(req.query.offset) || 0;        

    var options = {
        from: new Date - 24 * 60 * 60 * 1000,
        until: new Date,
        limit: 20,
        start: 0,
        order: 'desc',
        fields: ['level','message','timestamp']
    };
    
    //
    // Find items logged between today and yesterday.
    //
    logger.query(options, function (err, results) {
        if (err) {
            res.status(400).json(util.showMessage('error:' + err.name));
        }
        var logs=results.file;
        for (var log in logs) {
            var logDt = new Date(logs[log].timestamp);
            logDt.getTimezoneOffset
            //logDt.setHours(5.30);
            logs[log].timestamp = logDt.toString();
        }
        
        res.status(200).json(results);
    });
}

//Sample to log info and error
//logger.log('info', 'test info message');
//logger.log('error', err.message);