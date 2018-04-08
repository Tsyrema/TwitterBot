/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    request = require('request'),
    fs = require('fs'),
    Twit = require('twit'),
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

var request = require('request');

var tracery = require('tracery-grammar'),
    rawGrammar = require('./grammar.json'), // the grammar for the bot, edit this!
    grammar = tracery.createGrammar(rawGrammar);
    grammar.addModifiers(tracery.baseEngModifiers); 


const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const getArtwork = function() {
  request.get({
   url: 'https://api.artsy.net/api/artworks?sample',
   headers: { 
      'X-Xapp-Token': process.env.ARTSY_TOKEN,
      'Accept': 'application/vnd.artsy-v2+json'
   }
  },
  function (e, r, body) {
    let json = JSON.parse(body);
    const title = json.title; // get title of artwork
    const date = json.date;
    const status = generateStatus(title, date);
    console.log(status);
    const imgUrl = json['_links'].thumbnail.href; // get url of image
    download(imgUrl, 'img.jpg', function(){ // img.jpg is what we want it saved as
        console.log('img saved to img.jpg');
        tweet(status, title);
    });
  });
}

function generateStatus(title, year) {
  // Generate a new tweet using our grammar
  return `${title}, ${year} \nme: ${grammar.flatten("#origin#")}`; // make sure an "origin" entry is in your grammar.json file
}

// function tweet() {
//   var rawGrammar = require('./grammar2.json'); 
//   var grammar = tracery.createGrammar(rawGrammar);

//   grammar.addModifiers(tracery.baseEngModifiers); 
//   const status = grammar.flatten('#origin#');
  
//   T.post('statuses/update', { status }, function (err, data, response) {
//       console.log(data); 
//   });
// }
const tweet = function(status, title) {
 const b64content = fs.readFileSync('./img.jpg', { encoding: 'base64' }); // this is the image we downloaded from ARTSY
  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      // now we can assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      var mediaIdStr = data.media_id_string;
      var altText = `From Artsy: ${title}`; // name of artwork
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

      T.post('media/metadata/create', meta_params, function (err, data, response) {
          if (!err) {
              // now we can reference the media and post a tweet (media will attach to the tweet)
              var params = { status, media_ids: [mediaIdStr] };

              T.post('statuses/update', params, function (err, data, response) {
                  console.log(data);
              });
          }
      })
  });
}

tweet();

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
