/**
 * Created by Sam on 2016/11/30.
 */

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var multer = require('koa-multer');
var send = require('koa-send');
var app = koa();

var config = require('./config');
var logger = require('./logger');

var texConverter = require('./texConverter');
var rawReplacer = require('./rawReplacer');

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

// parse multipart/*
app.use(multer());

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

app.use(rawReplacer);
app.use(texConverter);

app.listen(config.port, function() {
  logger.info(`server listen at ${config.port}`);
});