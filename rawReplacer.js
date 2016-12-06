/**
 * Created by Administrator on 2016/12/6.
 */

var fs = require('fs');
var send = require('koa-send');
var co = require('co');

module.exports = function* RawContentReplacerMiddleware(next) {
  var path = this.request.path;
  if (this.method === 'GET' && /^\/raw-replacer/.test(path)) {
    if (yield send(this, 'public/raw-replace.html')) return;
  }

  if (this.method === 'POST' && /^\/raw-replacer/.test(path)) {
    let rawFile = this.req.files.rawFile;
    let fileContent = yield co(function*() {
      return new Promise((resolve, reject) => {
        fs.readFile(rawFile.path, 'utf-8', (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      })
    });
    fileContent.replace(/$$(.*?)$$/g, function(match, content) {
      console.log(content);
    });
    return;
  }
  yield next;
};