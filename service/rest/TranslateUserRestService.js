var translateUserObjectService = require("../object/TranslateUserObjectService.js");

class TranslateUserRestService {

    constructor(service){this.service=service;}

    publication(){

        this.service.get('/user/translateuser/:id', this.getTranslateUserById);
        this.service.get('/user/translateuser/byname/:value', this.getTranslateUserByName);

        this.service.get('/user/translateuser/exists/:id', this.doesExistTranslateUserById);

        this.service.post('/user/translateuser', this.insertTranslateUser);
        this.service.post('/user/translateuser/:id', this.updateTranslateUser);

        this.service.get('/user/translateuser', this.getAllTranslateUsers);

    } // publication

    async insertTranslateUser(request, response) {response.send(await translateUserObjectService.insertTranslateUser(request.body));}
    async updateTranslateUser(request, response) {response.send(await translateUserObjectService.updateTranslateUser(request));}

    async getAllTranslateUsers(request, response) {response.send(await translateUserObjectService.getAllTranslateUsers());}

    async getTranslateUserById(request, response) {response.send(await translateUserObjectService.getTranslateUserById(request.params));}
    async getTranslateUserByName(request, response) {response.send(await translateUserObjectService.getTranslateUserByName(request.params));}

    async doesExistTranslateUserById(request, response) {response.send(await translateUserObjectService.doesExistTranslateUserById(request.params));}

} // TranslateUserRestService

module.exports=TranslateUserRestService