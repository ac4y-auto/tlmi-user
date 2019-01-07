var Model=require('./DBConnector.js').Model;
var Ac4yGUIDHandler = require("@ac4y/ac4y-utility/domain/Ac4yGUIDHandler.js");

class TranslateUserModel extends Model {static get tableName() {return 'TranslateUser';}}

class TranslateUserDBAdapter {
    async getAll(){return await TranslateUserModel.query();}

    async getModelById(id){return await TranslateUserModel.query().findById(id);}

    getModelByName(value){return TranslateUserModel.query().findOne({name: value});}

    async doesExistById(id){return (await this.getModelById(id)!=null);}

    async doesExistByName(value){return (await this.getModelByName(value)!=null);}

    async insert(object){
        if (!object.GUID) object.GUID=new Ac4yGUIDHandler().getGUID();
        return await TranslateUserModel.query().insertAndFetch(object);
    }

    async update(id, object){
        object.updatedAt = new Date();
        return await TranslateUserModel.query().patchAndFetchById(id, object);
    }

} // TranslateUserDBAdapter

module.exports=TranslateUserDBAdapter