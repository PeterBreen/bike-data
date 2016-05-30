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
        var data = JSON.parse(body);
        var record = {};
        record[data.timestamp] = data;
        historicalData.update(record);
      }
    });
  }, 1000 * 60 * 30);
});
