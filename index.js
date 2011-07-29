var app = require('express').createServer();

app.get(/.*/, function(req, res) {
  var lat = req.query.lat;
  var lon = req.query.lon;
  if (!lat || !lon) {
    res.send('please specify lat & lon in the query parameters', 400);
    return;
  }
  
  console.log('lat', lat, 'lon', lon);
  res.send('<p>response with lat: '+lat+','+lon+'</p>');
});

app.listen(process.argv[3]);
