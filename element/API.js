service=require("@ac4y/ac4y-service/service/RestService")

var TranslateUserRestService=require("../service/rest/TranslateUserRestService.js")
var DBConnector = require("../dbadapter/DBConnector.js");
var logger = require("./Ac4yLogger.js").getLogger('startup');

DBConnector.connect().then(function() {
    new TranslateUserRestService(service).publication();

    const PORT=3002;
    service.listen(PORT, () => logger.info('tlmi-user server started on port ' + PORT));
}).catch(function(err) {
    logger.fatal('Failed to start server: ' + err.message);
    process.exit(1);
});
