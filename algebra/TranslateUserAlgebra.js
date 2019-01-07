var Ac4yPersistent=require("@ac4y/ac4y-object/domain/Ac4yPersistent.js"); 

class TranslateUserAlgebra extends Ac4yPersistent {

    constructor(object) {

        super(object);
        if (object != undefined && object === 0) return;
    } // constructor


    createSelf(object) {
        return new TranslateUserAlgebra(object);

    } // createSelf


    setLanguage(aLanguage) {
        this.language = aLanguage;
    }
    getLanguage() {
        return this.language;
    }
    hasLanguage() {
        return this.language != undefined;
    }

    setHumanName(aHumanName) {
        this.humanName = aHumanName;
    }
    getHumanName() {
        return this.humanName;
    }
    hasHumanName() {
        return this.humanName != undefined;
    }

    setAvatar(aAvatar) {
        this.avatar = aAvatar;
    }
    getAvatar() {
        return this.avatar;
    }
    hasAvatar() {
        return this.avatar != undefined;
    }


    rebuild(object, target) {

        target = target || this;
        super.rebuild(object, target);
        if (object) {

            if (object.language != undefined) target.setLanguage(object.language);
            if (object.humanName != undefined) target.setHumanName(object.humanName);
            if (object.avatar != undefined) target.setAvatar(object.avatar);

        } // if object does not empty

        return target;

    } // rebuild

    rebuilded(object, target) {
        return super.rebuilded(object, target);
    }

    copy(object, target) {

        target = target || this;
        super.copy(object, target);
        if (object) {

            if (object.language != undefined) target.setLanguage(object.language);
            if (object.humanName != undefined) target.setHumanName(object.humanName);
            if (object.avatar != undefined) target.setAvatar(object.avatar);

        } // if object does not empty

        return target;

    } // copy

} // TranslateUserAlgebra

module.exports=TranslateUserAlgebra