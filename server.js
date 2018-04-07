/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    request = require('request'),
    Twit = require('twit'),
    tracery = require('tracery-grammar'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.use(express.static('public'));

app.all("/" + process.env.BOT_ENDPOINT, function (req, res) {

});


function tweet() {
  var rawGrammar = require('./grammar2.json'); 
  var grammar = tracery.createGrammar(rawGrammar);

  grammar.addModifiers(tracery.baseEngModifiers); 
  const status = grammar.flatten('#origin#');
  
  T.post('statuses/update', { status }, function (err, data, response) {
      console.log(data); 
  });
}

tweet();

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
