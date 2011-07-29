var app = require('express').createServer(),
    Mongolian = require('mongolian');

app.get(/.*/, function(req, res) {
    var lat = req.query.lat;
    var lon = req.query.lon;
    if (!lat || !lon) {
        var html = '';
        html += '<p>';
        html += 'usage: GET /<br/>';
        html += '<li>lat=LATITUDE</li>';
        html += '<li>lon=LONGITUDE</li>';
        html += '<li><i>optional: </i>limit=LIMIT (default is 5)</li>';
        html += '<li><i>optional: </i>callback=JSONP_CALLBACK</li>';
        html += '<li><i>optional: </i>distance=DISTANCE_IN_DEGREES (default is 0.01)</li>';
        html += '</p>';
        html += '<p>eg: <a href="/?lat=47.5492515563965&lon=-122.251714706421&limit=200&callback=callme">/?lat=47.5492515563965&lon=-122.251714706421&limit=200&callback=callme</a></p>';
        res.send(html);
        return;
    }
    
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    
    if (lat == NaN || lon == NaN) {
        res.send('unable to parse lat and/or lon', 400);
        return;
    }
    
    var limitQ = req.query.limit;
    var limit = 5;
    if (limitQ) limit = parseInt(limitQ);
    
    var maxDist = 0.01;
    var maxDistQ = req.query.distance;
    if (maxDistQ) maxDist = parseFloat(maxDistQ);
    
    var where = { "transform.worldPos": { $near: [lon, lat], $maxDistance: maxDist } };
    var select = { "transform.worldPos": true, sources: true };
    var callback = function(err, docs) {
        var result = [];
        
        if (err) {
            res.send(err);
            return;
        }
        
        docs.forEach(function(doc) {
            if (!doc || !doc.sources || doc.sources.length < 1) {
                console.log('warning: unable to find sources in doc:', doc);
                return;
            }
            
            if (!doc.transform || !doc.transform.worldPos || doc.transform.worldPos.length != 2) {
                console.log('warning: unable to find world coorindates in doc: ', doc);
                return;
            }
            
            result.push({
                  lat: doc.transform.worldPos[1],
                  lon: doc.transform.worldPos[0],
                  image: doc.sources[0].url
            });
        });
        
        var jsonp = req.query.callback;
        if (jsonp) {
          result = jsonp + ' (' + JSON.stringify(result) + ')';
        }
        
        res.send(result);
    }; 
    
    //mongo://rmlstore.cloudapp.net:10000/rml
    var rmldb = new Mongolian('mongo://157.55.174.56:10000/rml');
    var entities = rmldb.collection('entities');
    entities.find(where, select).limit(limit).toArray(callback);
});

app.listen(process.argv[3]);

