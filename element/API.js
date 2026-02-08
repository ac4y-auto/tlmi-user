service=require("@ac4y/ac4y-service/service/RestService")

var TranslateUserRestService=require("../service/rest/TranslateUserRestService.js")
var logger = require("./Ac4yLogger.js").getLogger('startup');

new TranslateUserRestService(service).publication();

const PORT=3002;

service.listen(PORT, () => logger.info('tlmi-user server started on port ' + PORT))
