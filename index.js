/**
 * Created by Sam on 2016/11/30.
 */

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var send = require('koa-send');
var app = koa();

var mjApi = require('MathJax-node/lib/mj-single');

var config = require('./config');
var logger = require('./logger');

app.use(function* errorCollector(next) {
  try {
    yield next;
  } catch(err) {
    logger.error(`Error occur.`);
    logger.trace(err);
  }
});

// parse application/x-www-form-urlencoded
app.use(bodyParser());

// parse multipart/*, but no need now
// app.use(multer());

app.use(function* xResponseTime(next) {
  var start = new Date();
  yield next;
  var end = new Date();
  var during = end.getTime() - start.getTime();
  logger.info(`Handle request ${this.href} with requestvar ${JSON.stringify(this.request.body)} during ${Math.round(100 * during/1000)/100}s`);
});

// simple static server
// /vendor => /node_modules
app.use(function* staticServer(next) {
  var method = this.method;

  if (method !== 'HEAD' && method !== 'GET') return yield next;

  if (/^\/vendor\//.test(this.path)) {
    let vendorPath = this.path.replace('/vendor/', '');
    if (yield send(this, vendorPath, { root: 'node_modules' })) return;
  }
  yield next;
});

// simple router, only handle: /converter
app.use(function* visitConverterPage(next) {
  var path = this.request.path;
  if (this.method === 'GET' && /^\/converter/.test(path)) {
    if (yield send(this, 'public/converter.html')) return;
  }
  yield next;
});

app.use(function* covertResult(next) {
  ({type: this.response.type, result: this.body} = yield next);
});

// TODO: POST 的请求应该时怎样的情境?
app.use(function* handleGet(next) {
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
  return doConvert(mathContent, convertType);
});

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

  return new Promise((resolve, reject) => {
    mjApi.config({});
    mjApi.start();

    mjApi.typeset(initMjData(content, type), function (data) {
      if (data.errors) return reject(data.errors);
      resolve(outputResult(type, data));
    });
  });
}

app.listen(config.port, function() {
  logger.info(`server listen at ${config.port}`);
});