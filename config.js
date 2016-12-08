/**
 * Created by sam on 16/12/2.
 */
var port = process.env.PORT || 4000;

exports.port = port;

exports.logInfo = {
  level: 'trace',     // trace, debug, info, warn, error, fatal
  dist: 'stdout'        // stdout, file
};

exports.heroku = {
  host: process.env.NODE_ENV === 'heroku' ? 'https://tex2img.herokuapp.com/' : `http://localhost:${port}/`
};