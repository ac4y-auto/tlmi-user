var Model=require('./DBConnector.js').Model;
var Ac4yGUIDHandler = require("@ac4y/ac4y-utility/domain/Ac4yGUIDHandler.js");

var logger = require('../element/Ac4yLogger.js').getLogger('dbadapter');

class TranslateUserModel extends Model {static get tableName() {return 'TranslateUser';}}

class TranslateUserDBAdapter {

    async getAll(){
        logger.trace("getAll - SELECT * FROM TranslateUser");
        var result = await TranslateUserModel.query();
        logger.trace("getAll - rows:" + (result ? result.length : 0));
        return result;
    }

    async getModelById(id){
        logger.trace("getModelById - SELECT * FROM TranslateUser WHERE id=" + id);
        var result = await TranslateUserModel.query().findById(id);
        logger.trace("getModelById - found:" + (result ? 'yes' : 'no'));
        return result;
    }

    getModelByName(value){
        logger.trace("getModelByName - SELECT * FROM TranslateUser WHERE name='" + value + "'");
        return TranslateUserModel.query().findOne({name: value});
    }

    async doesExistById(id){
        logger.trace("doesExistById - id:" + id);
        return (await this.getModelById(id)!=null);
    }

    async doesExistByName(value){
        logger.trace("doesExistByName - name:" + value);
        return (await this.getModelByName(value)!=null);
    }

    async insert(object){
        if (!object.GUID) object.GUID=new Ac4yGUIDHandler().getGUID();
        logger.trace("insert - INSERT INTO TranslateUser:" + JSON.stringify(object));
        var result = await TranslateUserModel.query().insertAndFetch(object);
        logger.trace("insert - inserted id:" + (result ? result.id : 'n/a'));
        return result;
    }

    async update(id, object){
        object.updatedAt = new Date();
        logger.trace("update - UPDATE TranslateUser SET ... WHERE id=" + id + " data:" + JSON.stringify(object));
        var result = await TranslateUserModel.query().patchAndFetchById(id, object);
        logger.trace("update - updated id:" + (result ? result.id : 'n/a'));
        return result;
    }

} // TranslateUserDBAdapter

module.exports=TranslateUserDBAdapter
