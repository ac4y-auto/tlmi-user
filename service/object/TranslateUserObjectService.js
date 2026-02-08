var Ac4yObjectService = require("@ac4y/ac4y-service/domain/Ac4yObjectService.js");
var Ac4yProcessResult = require("@ac4y/ac4y-service/domain/Ac4yProcessResult.js");
var GetObjectResponse = require("@ac4y/ac4y-service/document/GetObjectResponse.js");
var translateUserService = require("../base/TranslateUserService.js");

var logger = require('../../element/Ac4yLogger.js').getLogger('object');

class TranslateUserObjectService extends Ac4yObjectService {

    async insertTranslateUser(request) {
        logger.trace("insertTranslateUser - request:" + JSON.stringify(request));
        var result = await this.getObjectResponse(translateUserService.insert(request));
        logger.trace("insertTranslateUser - result.code:" + (result.result ? result.result.code : 'n/a'));
        return result;
    }

    async updateTranslateUser(request) {
        logger.trace("updateTranslateUser - id:" + request.params.id + " body:" + JSON.stringify(request.body));
        var result = await this.getObjectResponse(translateUserService.update(request.params.id, request.body));
        logger.trace("updateTranslateUser - result.code:" + (result.result ? result.result.code : 'n/a'));
        return result;
    }

    async getAllTranslateUsers(request) {
        logger.trace("getAllTranslateUsers");
        var response = await this.getList(await translateUserService.getAll());
        logger.trace("getAllTranslateUsers - list.length:" + (response.list ? response.list.length : 0));
        return response;
    }

    async getTranslateUserById(request) {
        logger.trace("getTranslateUserById - id:" + request.id);
        var result = await this.getObjectResponse(translateUserService.getById(request.id));
        logger.trace("getTranslateUserById - result.code:" + (result.result ? result.result.code : 'n/a'));
        return result;
    }

    async getTranslateUserByName(request) {
        logger.trace("getTranslateUserByName - value:" + request.value);
        var result = await this.getObjectResponse(translateUserService.getByName(request.value));
        logger.trace("getTranslateUserByName - result.code:" + (result.result ? result.result.code : 'n/a'));
        return result;
    }

    async doesExistTranslateUserById(request) {return await this.doesExistObjectById(translateUserService.doesExistById(request.id));}

    async existsTranslateUserById(request) {
        logger.trace("existsTranslateUserById - id:" + request.id);
        var result = await this.doesExistObjectById(translateUserService.doesExistById(request.id));
        logger.trace("existsTranslateUserById - result.code:" + (result.result ? result.result.code : 'n/a'));
        return result;
    }

    async existsTranslateUserByName(request) {

        logger.trace("existsTranslateUserByName - value:" + request.value);

        var response = new GetObjectResponse();

        try {

            var exists = await translateUserService.existsByName(request.value).catch( (error) => {throw error});

            if (exists)
                response.setResult(
                    new Ac4yProcessResult({
                        code: 1
                        ,message: "exist!"
                    })
                );
            else
                response.setResult(
                    new Ac4yProcessResult({
                        code: 0
                        ,message: "does not exist!"
                    })
                );

        } catch (error) {response.setResult(new Ac4yProcessResult().error(error.message || error))};

        logger.trace("existsTranslateUserByName - result.code:" + (response.result ? response.result.code : 'n/a'));

        return response;

    } // existsTranslateUserByName

} // TranslateUserObjectService

module.exports=new TranslateUserObjectService()
