const log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'gate.log', maxLogSize: 10485760, backups: 3 }
    },
    categories: {
        default:    { appenders: ['console', 'file'], level: 'trace' },
        rest:       { appenders: ['console', 'file'], level: 'trace' },
        object:     { appenders: ['console', 'file'], level: 'trace' },
        service:    { appenders: ['console', 'file'], level: 'trace' },
        dbadapter:  { appenders: ['console', 'file'], level: 'trace' },
        startup:    { appenders: ['console', 'file'], level: 'trace' }
    }
});

function getLogger(category) {
    return log4js.getLogger(category || 'default');
}

module.exports = { getLogger: getLogger };
