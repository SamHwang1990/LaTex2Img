/**
 * Created by Administrator on 2016/12/6.
 */

var mjApi = require('MathJax-node/lib/mj-single');
var co = require('co');

var logger = require('./logger');

// TODO: 支持多类型的转换
function doConvert(content, type) {
  function initMjData(content, type) {
    type = type ? type.toLowerCase() : '';

    let mjData = {
      math: content,
      format: 'TeX'
    };

    if (type === 'svg') {
      mjData.svg = true;
      return mjData;
    }

    if (type === 'png') {
      mjData.png = true;
      mjData.width = 100;
      mjData.ex = 6;
      mjData.dpi = mjData.ex * 16;
      mjData.linebreaks = true;
      return mjData;
    }
  }

  function outputResult(type, data) {
    type = type ? type.toLowerCase() : '';

    if (type === 'svg') {
      return {
        type: 'image/svg+xml',
        result: data.svg
      }
    }

    if (type === 'png') {
      return {
        type: 'image/png',
        result: new Buffer(data.png.slice(22),'base64')
      }
    }
  }

  return co(function* () {
    return new Promise((resolve, reject) => {
      mjApi.config({});
      // mjApi.start();

      mjApi.typeset(initMjData(content, type), function (data) {
        if (data.errors) return reject(data.errors);
        resolve(outputResult(type, data));
      });
    });
  });
}

module.exports = function* TeXConverterMiddleware(next) {
  var mathContent;
  var convertType;
  if (this.method === 'POST') {
    ({content: mathContent, type: convertType} = this.request.body);
  }

  if (!mathContent) {
    mathContent = this.query.eq ? decodeURIComponent(this.query.eq) : '';
  }
  if (!convertType) {
    convertType = this.query.type ? decodeURIComponent(this.query.type) : '';
  }

  logger.info(`Received math content: ${mathContent} and convert type: ${convertType}`);

  if (!mathContent) return '';
  if (!convertType) convertType = 'png';

  ({type: this.response.type, result: this.body} = yield doConvert(mathContent, convertType));
  yield next;
};