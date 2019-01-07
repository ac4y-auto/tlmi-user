var Ac4yObjectService = require("@ac4y/ac4y-service/domain/Ac4yObjectService.js");
/*var Ac4yServiceResponse=require("@ac4y/ac4y-common/service/Ac4yServiceResponse.js");
var Ac4yProcessResult=require("@ac4y/ac4y-common/service/Ac4yProcessResult.js"); 

var GetObjectResponse = require("@ac4y/ac4y-common/service/document/GetObjectResponse.js");
var GetListResponse = require("@ac4y/ac4y-common/service/document/GetListResponse.js");
*/
var translateUserService = require("../base/TranslateUserService.js");

var logger=require('../../element/Ac4yLogger.js');

class TranslateUserObjectService extends Ac4yObjectService {

    async insertTranslateUser(request) {return await this.getObjectResponse(translateUserService.insert(request));}
    async updateTranslateUser(request) {return await this.getObjectResponse(translateUserService.update(request.params.id, request.body));}
    
    async getAllTranslateUsers(request) {
        logger.trace("getAllTranslateUsers.request:"+JSON.stringify(request));
        var response = await this.getList(await translateUserService.getAll())
        logger.trace("getAllTranslateUsers.response:"+JSON.stringify(response));
        return  response;
    }

    async getTranslateUserById(request) {return await this.getObjectResponse(translateUserService.getById(request.id));}
    async getTranslateUserByName(request) {return await this.getObjectResponse(translateUserService.getByName(request.value));}

    async doesExistTranslateUserById(request) {return await this.doesExistObjectById(translateUserService.doesExistById(request.id));}
	
} // TranslateUserObjectService

module.exports=new TranslateUserObjectService()