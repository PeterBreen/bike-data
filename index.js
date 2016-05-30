var firebase = require('firebase');
var fs = require('fs');
var request = require('request');

var url = 'https://secure.prontocycleshare.com/data/stations.json';

var credentialBase64 = process.env['FIREBASE_CREDENTIAL'];
var buffer = new Buffer(credentialBase64, 'base64');
var credentialString = buffer.toString('ascii');

fs.writeFile('super_secret.json', credentialString, function(err) {
  if(err) {
    return console.log(err);
  }

  firebase.initializeApp({
    serviceAccount: 'super_secret.json',
    databaseURL: 'https://bike-map-fd305.firebaseio.com/',
  });

  var db = firebase.database();
  var historicalData = db.ref('data');

  setInterval(function(){
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("Got API DATA!!!!")
        var data = JSON.parse(body);
        var record = {};
        record[data.timestamp] = data;
        historicalData.update(record);
        console.log('sent to db')
      }
    });
  }, 1000 * 5);
});


// for health check
var requestProxy = require('express-request-proxy'),
  express = require('express'),
  port = process.env.PORT || 3000,
  app = express();

app.get('*', function(request, response) {
  console.log('New request:', request.url);
  response.send('HELLO WORLD');
});

app.listen(port, function() {
  console.log('Server started on port ' + port + '!');
});
