/**
 * Created by sam on 16/12/3.
 */

var log4js = require('log4js');
var config = require('./config').logInfo;

var appenderList = {
  'stdout': {
    type: 'stdout'
  },
  'file': {
    type: 'file',
    filename: 'logs/converter.log',
    backups: 10
  }
};

var appender = config.dist.toLowerCase() === 'file' ? appenderList.file : appenderList.stdout;

log4js.configure({
  appenders: [appender]
});

var logger = log4js.getLogger('converter');
logger.setLevel(config.level.toUpperCase());

module.exports = logger;
