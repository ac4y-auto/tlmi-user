var Ac4yObjectService = require("@ac4y/ac4y-service/domain/Ac4yObjectService.js");
var translateUserService = require("../service/base/TranslateUserService.js");


var GateRestServiceClient=require("@ac4y/ac4y-gate-client/client/GateRestServiceClient.js");

var service=new GateRestServiceClient("http://localhost:3000");

var logger=require('./Ac4yLogger.js');

async function load(){

    logger.trace("load.begin");
    var response=await new Ac4yObjectService().getList(await translateUserService.getAll());
    logger.trace("load.response:"+JSON.stringify(response));
    console.log(response.list);
    for (var index in response.list) {
        var item=response.list[index];
        console.log(item.name, item.password);
        logger.trace("load.insertUser.request:"+JSON.stringify({user:item.name, password:item.password}));
        var insertResponse=await service.insertUser({user:item.name, password:item.password})
        logger.trace("load.insertUser.response:"+JSON.stringify(insertResponse));
        console.log(insertResponse);
      }
    logger.trace("load.end");
} // load

load();
