// Imports.  See package.json dependencies,
var counter = 0;
var failCount = 0;
var firebase = require('firebase');
var fs = require('fs');
var request = require('request');

// External API URL endpoint
var url = 'https://secure.prontocycleshare.com/data/stations.json';

// Dump the secrets from ENV variable into a file.
// This is because firebase cannot initialize without secrets stored in a file.
var credentialBase64 = process.env['FIREBASE_CREDENTIAL'];
var buffer = new Buffer(credentialBase64, 'base64');
var credentialString = buffer.toString('ascii');

fs.writeFile('super_secret.json', credentialString, function(err) {
  if(err) {
    return console.log(err);
  }

  // Initialize Firebase server auth.
  // See https://firebase.google.com/docs/server/setup
  firebase.initializeApp({
    serviceAccount: 'super_secret.json',
    databaseURL: 'https://bike-map-fd305.firebaseio.com/',
  });

  // Get reference to the part of the DB we want to access
  var db = firebase.database();
  var historicalData = db.ref('data');

  setInterval(function(){
    // Get the API data periodically
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        counter++;
        /*
         *  Turn { "timestamp": 12345, "ba": 1, "bx": 2, ... }
         *  into: { 12345: { "timestamp": 12345, "ba": 1, "bx": 2, ...} }
         var myDate = new Date( your epoch date *1000);
document.write(myDate.toGMTString()+"<br>"+myDate.toLocaleString());
         */
        var doFormat = function(time){
          return new Date(time * 1000).toGMTString();
        };
        var data = JSON.parse(body);
        var record = {};

        var timestamp  = data.timestamp;
        var formatted = doFormat(timestamp);

        record[formatted] = data;
        historicalData.update(record);
        console.log('new array was added');
      }else{
        failCount++;
      }
    });
  }, 1000 * 60 * 5);
});

// for health check.  Otherwise, heroku kills the app.
var requestProxy = require('express-request-proxy'),
  express = require('express'),
  port = process.env.PORT || 3000,
  app = express();

app.get('*', function(request, response) {
  console.log('New request:', request.url);
  response.send('collects=' + counter + '' + 'fails=' + failCount);
});

app.listen(port, function() {
  console.log('Server started on port ' + port + '!');
});
