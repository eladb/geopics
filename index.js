var app = require('express').createServer();

app.get(/.*/, function(req, res) {
  res.send('<p>hello</p>');
});

app.listen(process.argv[3]);
