const log4js = require('log4js');

class Ac4yLogger {

    constructor(){

        log4js.configure({
            appenders: { gate: { type: 'file', filename: 'gate.log' } },
            categories: { default: { appenders: ['gate'], level: 'error' } }
          });

        this.logger = log4js.getLogger('gate');

        this.logger.level = 'trace';

    } // constructor

    getLogger(){return this.logger}

    setLevel(level){this.getLogger().level=level}

    trace(record){this.getLogger().trace(record);}
    debug(record){this.getLogger().debug(record);}
    info(record){this.getLogger().info(record);}
    warn(record){this.getLogger().warn(record);}
    error(record){this.getLogger().error(record);}

} // Ac4yLogger

module.exports=new Ac4yLogger()