var translateUserObjectService = require("../object/TranslateUserObjectService.js");
var logger = require("../../element/Ac4yLogger.js").getLogger('rest');

class TranslateUserRestService {

    constructor(service){this.service=service;}

    publication(){

        this.service.get('/user/translateuser/:id', this.getTranslateUserById);
        this.service.get('/user/translateuser/byname/:value', this.getTranslateUserByName);

        this.service.get('/user/translateuser/exists/:id', this.existsTranslateUserById);
        this.service.get('/user/translateuser/exists/byname/:value', this.existsTranslateUserByName);

        this.service.post('/user/translateuser', this.insertTranslateUser);
        this.service.post('/user/translateuser/:id', this.updateTranslateUser);

        this.service.get('/user/translateuser', this.getAllTranslateUsers);

        logger.info("TranslateUserRestService.publication() - endpoints registered");

    } // publication

    async insertTranslateUser(request, response) {
        logger.info("POST /user/translateuser - insertTranslateUser - body:" + JSON.stringify(request.body));
        var result = await translateUserObjectService.insertTranslateUser(request.body);
        logger.debug("POST /user/translateuser - response:" + JSON.stringify(result));
        response.send(result);
    }

    async updateTranslateUser(request, response) {
        logger.info("POST /user/translateuser/" + request.params.id + " - updateTranslateUser - body:" + JSON.stringify(request.body));
        var result = await translateUserObjectService.updateTranslateUser(request);
        logger.debug("POST /user/translateuser/" + request.params.id + " - response:" + JSON.stringify(result));
        response.send(result);
    }

    async getAllTranslateUsers(request, response) {
        logger.info("GET /user/translateuser - getAllTranslateUsers");
        var result = await translateUserObjectService.getAllTranslateUsers();
        logger.debug("GET /user/translateuser - response: list.length=" + (result.list ? result.list.length : 0));
        response.send(result);
    }

    async getTranslateUserById(request, response) {
        logger.info("GET /user/translateuser/" + request.params.id + " - getTranslateUserById");
        var result = await translateUserObjectService.getTranslateUserById(request.params);
        logger.debug("GET /user/translateuser/" + request.params.id + " - response:" + JSON.stringify(result.result));
        response.send(result);
    }

    async getTranslateUserByName(request, response) {
        logger.info("GET /user/translateuser/byname/" + request.params.value + " - getTranslateUserByName");
        var result = await translateUserObjectService.getTranslateUserByName(request.params);
        logger.debug("GET /user/translateuser/byname/" + request.params.value + " - response:" + JSON.stringify(result.result));
        response.send(result);
    }

    async existsTranslateUserById(request, response) {
        logger.info("GET /user/translateuser/exists/" + request.params.id + " - existsTranslateUserById");
        var result = await translateUserObjectService.existsTranslateUserById(request.params);
        logger.debug("GET /user/translateuser/exists/" + request.params.id + " - response:" + JSON.stringify(result.result));
        response.send(result);
    }

    async existsTranslateUserByName(request, response) {
        logger.info("GET /user/translateuser/exists/byname/" + request.params.value + " - existsTranslateUserByName");
        var result = await translateUserObjectService.existsTranslateUserByName(request.params);
        logger.debug("GET /user/translateuser/exists/byname/" + request.params.value + " - response:" + JSON.stringify(result.result));
        response.send(result);
    }

} // TranslateUserRestService

module.exports=TranslateUserRestService
