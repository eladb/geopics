var app = require('express').createServer();

app.get(/.*/, function(req, res) {
  res.send('<p>hello world</p>');
});

app.listen(process.argv[3]);
