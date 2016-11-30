/**
 * Created by Sam on 2016/11/30.
 */

var koa = require('koa');
var app = new koa();

app.use(function* errorCollector(next) {
  try {
    yield next;
  } catch(err) {
    console.log(err.toString());
  }
});

app.use(function* xResponseTime(next) {
  var start = new Date();
  yield next;
  var end = new Date();
  console.log(`xResponseTime:\nstart: ${start}\nend: ${end}`);
});

app.use(function* responsesomething(next) {
  console.log('djhdh');
  this.body = 'djj';
});

app.listen(4000, function() {
  console.log('listen at 4000');
});