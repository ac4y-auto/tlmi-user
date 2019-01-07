service=require("@ac4y/ac4y-service/service/RestService")

var TranslateUserRestService=require("../service/rest/TranslateUserRestService.js")

new TranslateUserRestService(service).publication();

const PORT=3002;

service.listen(PORT, () => console.log('app listening on port '+PORT+'!'))

