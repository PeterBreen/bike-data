var firebase = require('firebase');
var http = require('http');
var fs = require('fs');

var url = 'https://secure.prontocycleshare.com/data/stations.json';

var credentialBase64 = process.env['FIREBASE_CREDENTIAL'];
var credentialString = Buffer.from(credentialBase64, 'base64');

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
    http.get(url, function(res){
      var body = '';

      res.on('data', function(chunk){
        body += chunk;
      });

      res.on('end', function(){
        var record = {};
        var recordBody = JSON.parse(body);
        record[recordBody.timestamp] = recordBody;
        historicalData.update(record);
      });
    });
  }, 1000 * 5);
});
