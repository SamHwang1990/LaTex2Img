/**
 * Created by Sam on 2016/11/30.
 */

var koa = require('koa');
var multer = require('koa-multer');
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

app.use(multer());

// TODO: xResponseTime 的日志使用logger, 要与下文的请求上下文有对应
app.use(function* xResponseTime(next) {
  var start = new Date();
  yield next;
  var end = new Date();
  var during = end.getTime() - start.getTime();
  logger.info(`Handle request ${this.href} with requestvar ${JSON.stringify(this.req.body)} during ${Math.round(100 * during/1000)/100}s`);
});

app.use(function* covertResult(next) {
  this.body = yield next;
});

// TODO: POST 的请求应该时怎样的情境?
app.use(function* handleGet(next) {
  var mathContent;
  if (this.method === 'POST') {
    mathContent = this.req.body.content;
  }

  if (!mathContent) {
    mathContent = decodeURIComponent(this.query.eq);
  }

  logger.info(`Received math content: ${mathContent}`);

  if (!mathContent) return '';
  return doConvert(mathContent);
});

// TODO: 支持多类型的转换
function doConvert(content) {
  return new Promise((resolve, reject) => {
    mjApi.config({});
    mjApi.start();

    mjApi.typeset({
      math: content,
      format: "TeX",
      svg: true
    }, function (data) {
      if (data.errors) return reject(data.errors);
      resolve(data.svg);
    });
  });
}

app.listen(config.port, function() {
  logger.info(`server listen at ${config.port}`);
});