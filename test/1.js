var GateRestServiceClient=require("@ac4y/ac4y-gate-client/client/GateRestServiceClient.js");

var service=new GateRestServiceClient("http://localhost:3000");

async function run(){
    //console.log(await service.loginNextUser());
    console.log(await service.insertUser({user:"u1", password:"p1"}));
    console.log(await service.insertUser({user:"u2", password:"p2"}));
    a=1;
}
run();