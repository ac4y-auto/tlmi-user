var TranslateUserDBAdapter=require("../../dbadapter/TranslateUserDBAdapter.js");
var TranslateUser=require("../../domain/TranslateUser.js");

var logger = require('../../element/Ac4yLogger.js').getLogger('service');

class TranslateUserService {

    async insert(translateUser) {

        logger.debug("insert - request:" + JSON.stringify(translateUser));

        var model=await new TranslateUserDBAdapter().insert(translateUser);

        if (model) {
            logger.debug("insert - success, id:" + model.id);
            return new TranslateUser(model);
        }
        else {
            logger.error("insert - failed!");
            throw("translateUser insert failed!");
        }

    } // insert

    async update(id, translateUser) {

        logger.debug("update - id:" + id + " request:" + JSON.stringify(translateUser));

        var model=await new TranslateUserDBAdapter().update(id, translateUser);

        if (model) {
            logger.debug("update - success, id:" + model.id);
            return new TranslateUser(model);
        }
        else {
            logger.error("update - failed for id:" + id);
            throw("translateUser did not updated!");
        }

    } // update

    async getAll() {
        logger.debug("getAll");
        var result = await new TranslateUserDBAdapter().getAll();
        logger.debug("getAll - count:" + (result ? result.length : 0));
        return result;
    }

    async getById(id) {

        logger.debug("getById - id:" + id);

        var model = await new TranslateUserDBAdapter().getModelById(id);

        if (model) {
            logger.debug("getById - found, id:" + model.id);
            return new TranslateUser(model);
        }
        else {
            logger.warn("getById - not found, id:" + id);
            throw("translateUser does not exist!");
        }

    } // getById

    async getByName(value) {

        logger.debug("getByName - value:" + value);

        var model = await new TranslateUserDBAdapter().getModelByName(value);

        if (model) {
            logger.debug("getByName - found, name:" + model.name);
            return new TranslateUser(model);
        }
        else {
            logger.warn("getByName - not found, name:" + value);
            throw("user does not exist by name!");
        }

    } // getByName

    async doesExistById(id) {
        logger.debug("doesExistById - id:" + id);
        return await new TranslateUserDBAdapter().getModelById(id);
    }

    async existsById(id) {
        logger.debug("existsById - id:" + id);
        return await new TranslateUserDBAdapter().getModelById(id);
    }

    async existsByName(value) {
        logger.debug("existsByName - value:" + value);
        return await new TranslateUserDBAdapter().getModelByName(value);
    }

} // TranslateUserService

module.exports=new TranslateUserService()
