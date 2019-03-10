var TranslateUserDBAdapter=require("../../dbadapter/TranslateUserDBAdapter.js");
var TranslateUser=require("../../domain/TranslateUser.js");

class TranslateUserService {

    async insert(translateUser) {

        var model=await new TranslateUserDBAdapter().insert(translateUser);

        if (model)
            return new TranslateUser(model);
        else 
            throw("translateUser insert failed!");

    } // insert

    async update(id, translateUser) {

        var model=await new TranslateUserDBAdapter().update(id, translateUser);

        if (model)
            return new TranslateUser(model);
        else 
            throw("translateUser did not updated!");

    } // update

    async getAll() {return await new TranslateUserDBAdapter().getAll();}

    async getById(id) {

        var model = await new TranslateUserDBAdapter().getModelById(id);

        if (model)
            return new TranslateUser(model);
        else 
            throw("translateUser does not exist!");

    } // getById

    async getByName(value) {

        var model = await new TranslateUserDBAdapter().getModelByName(value);

        if (model)
            return new TranslateUser(model);
        else 
            throw("user does not exist by name!");

    } // getByName

    async doesExistById(id) {return await new TranslateUserDBAdapter().getModelById(id)};

    async existsById(id) {return await new TranslateUserDBAdapter().getModelById(id)};

    async existsByName(value) {return await new TranslateUserDBAdapter().getModelByName(value)};    
    
} // TranslateUserService

module.exports=new TranslateUserService()