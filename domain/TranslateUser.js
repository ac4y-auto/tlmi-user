var TranslateUserAlgebra=require("../algebra/TranslateUserAlgebra.js"); 

class TranslateUser extends TranslateUserAlgebra {

    createSelf(object) {return new TranslateUser(object);}

} // TranslateUser

module.exports=TranslateUser