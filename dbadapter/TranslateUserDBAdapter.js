var TranslateUserModel = require('./TranslateUserModel.js');
var Ac4yGUIDHandler = require("@ac4y/ac4y-utility/domain/Ac4yGUIDHandler.js");
var logger = require('../element/Ac4yLogger.js').getLogger('dbadapter');

// Mongoose dokumentum → sima JS objektum, _id → id mappeléssel
function toPlainObject(doc) {
    if (!doc) return null;
    var obj = doc.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
}

class TranslateUserDBAdapter {

    async getAll(){
        logger.trace("getAll - find()");
        var docs = await TranslateUserModel.find();
        logger.trace("getAll - rows:" + (docs ? docs.length : 0));
        return docs.map(toPlainObject);
    }

    async getModelById(id){
        logger.trace("getModelById - findById(" + id + ")");
        try {
            var doc = await TranslateUserModel.findById(id);
            logger.trace("getModelById - found:" + (doc ? 'yes' : 'no'));
            return toPlainObject(doc);
        } catch(e) {
            // Érvénytelen ObjectId formátum
            logger.trace("getModelById - invalid id format: " + id);
            return null;
        }
    }

    async getModelByName(value){
        logger.trace("getModelByName - findOne({name: '" + value + "'})");
        var doc = await TranslateUserModel.findOne({name: value});
        logger.trace("getModelByName - found:" + (doc ? 'yes' : 'no'));
        return toPlainObject(doc);
    }

    async doesExistById(id){
        logger.trace("doesExistById - id:" + id);
        return (await this.getModelById(id) != null);
    }

    async doesExistByName(value){
        logger.trace("doesExistByName - name:" + value);
        return (await this.getModelByName(value) != null);
    }

    async insert(object){
        if (!object.GUID) object.GUID = new Ac4yGUIDHandler().getGUID();
        // MongoDB: NEM kell törölni az ac4yIdentification-t — az objektum megy le ahogy van!
        logger.trace("insert - save():" + JSON.stringify(object));
        var doc = new TranslateUserModel(object);
        var result = await doc.save();
        logger.trace("insert - inserted _id:" + (result ? result._id : 'n/a'));
        return toPlainObject(result);
    }

    async update(id, object){
        // MongoDB: NEM kell törölni az ac4yIdentification-t!
        logger.trace("update - findByIdAndUpdate(" + id + "):" + JSON.stringify(object));
        var result = await TranslateUserModel.findByIdAndUpdate(id, object, { new: true });
        logger.trace("update - updated _id:" + (result ? result._id : 'n/a'));
        return toPlainObject(result);
    }

} // TranslateUserDBAdapter

module.exports = TranslateUserDBAdapter
