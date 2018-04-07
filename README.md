Art Connoisseur Twitter Bot
===================================

![Tweetin'](https://cdn.glitch.com/dde5f205-63b1-4a05-ad3c-4d441cc1e7a5%2FScreen%20Shot%202018-03-31%20at%2010.17.10%20AM.png?1522505887837)

This is a bot that generates tweets that interpretes art using [Tracery](tracery.io) and juxtaposes those interpretations with images of art gotten from the [Artsy API](https://developers.artsy.net). It also uses the [Twit](https://github.com/ttezel/twit) node.js library. It's based off a simple [twitter bot template](https://glitch.com/~twitterbot) made by [Botwiki](https://glitch.com/botwiki)

## Pre-workshop instructions

1. [Create a new twitter account](twitter.com/signup)
2. [Artsy developer account](https://developers.artsy.net/start)

## Tutorial

1. Remix the [twitter bot template](https://glitch.com/~twitterbot) to start. 
2. Create a new Twitter account and a new Twitter app. ([See how.](https://botwiki.org/tutorials/how-to-create-a-twitter-app/))
3. Update the `.env` file with your Twitter API key/secrets and change the `BOT_ENDPOINT` (it could just be random letters). What is env? Check Q.A below.
4. If you take a look in `server.js` you'll see there's some code in there already. The example in there tweets hello world. It's using the [twit](https://github.com/ttezel/twit) library which is a way to access the twitter API with node. (More info about API in Q.A). So with tweet, to post a tweet we call `T.post('statuses/update')` with the status and a callback function. Callback function is just a function that's called after an action is completed. 
5. We're going to move that the tweeting functionality to a function and call it. The twitter account you set up should tweet. So create a function tweet and move lines 23-31 in there. (Move from `T.post` and copy until the closing bracket. You should see it light up when you click. Delete the `res.` lines.
```
const tweet = function() {
  T.post('statuses/update', { status: 'hello world 👋' }, function(err, data, response) {
    if (err){
      console.log('error!', err);
    }
    else {
      console.log('it tweeted', err);
    }
  });
}

tweet();
```
6. Check your bot to see if it's tweeting. Is it? Cool. Move the call to inside `app.all`
```
app.all("/" + process.env.BOT_ENDPOINT, function (req, res) {
  tweet();
});
```
7. Ok now we're going to make our tweets more interesting. We're making a bot that generates art intepretations. We're using a tool called Tracery that generates grammar.
8. Let's see how it [works](http://www.brightspiral.com/tracery/). You provide tracery with replacement grammar. A replacement grammar takes a starting symbol, and replaces it with one of several rules. 

![Brightspiral.com](https://cdn.glitch.com/dde5f205-63b1-4a05-ad3c-4d441cc1e7a5%2FScreen%20Shot%202018-04-01%20at%206.24.20%20PM.png?1522621477894)

In this case the replacement grammar is origin. The starting symbols are the words in hashes (#): name and occupation. And those starting symbols have rules. For occupation: baker, wizard, soldier. For name: Bertram, Arabella, Cecil. So wherever you see the starting symbols in the replacement grammar (origin), it'll replace those with one of the rules. 

9. How do we create our own grammar? Click JSON on the website. JSON is a file format like .csv or .txt that's very compatible with JavaScript. For tracery we write our grammar in JSON. So if we want to change the name starting symbol, we would replace the data in quotes ("")

```
	"name": [
		"Rihanna",
		"Beyonce",
		"Yeli"
	],
```

9. So we want to create a bot that inteprets art. First we have to construct what we want it to sound like and then we can create the tracery grammar based on that. I've thought of some examples:
- "wow I really love the way they examine beauty and death in this piece."
- "ah this reminds me of art nouveau from the early 1960s"
- "the use of polymer clay is astounding"
- "oh my, it's post-conceptualism without post-impressionism
- "mmm I really love the juxtaposition between love and beauty, it reminds me of pointlism from the late 1980s"
- "This piece really begs the question: is peace really possible?"
10. When I have an idea what I want my bot to sound like I go looking for data. You can get data from different places -- APIs, you can scrape websites. My go-to for bots is Darius Kazemi's [Corpora](https://github.com/dariusk/corpora/tree/master/data) project which is a collection of random data. It has stuff like lists of colors, lists of religions, list of social networking sites etc.
11. So I looked at the collection for a while and found some collections I could use. There's the [isms](https://github.com/dariusk/corpora/blob/master/data/art/isms.json) section in art, list of [interjections](https://github.com/dariusk/corpora/blob/master/data/words/interjections.json) in words etc. 

12.  If we look at the sentences I came up with, [wow, ah, oh my, mmm]. [love, beauty, death] are nouns. [art nouveau, post-impressionism, post-conceptualism, pointlism] are isms. Sometimes I look for data first before I start writing out what I want my bot to sound like. 

13. `"wow I really love the way they examine beauty and death in this piece."` -> becomes `"#interjection# I really #verbs_spectator# #connector# they #art_verbs# #isms# in this piece"`

`"oh my, it's post-conceptualism without post-impressionism` -> becomes `    "#interjection#, it’s #isms# #prepositions# #isms#"`

`"mmm I really love the juxtaposition between love and beauty, it reminds me of pointlism from the late 1980s"` -> becomes  `"#interjection# I really #verbs_spectator# the #binary_noun# #prepositions# #topics# and #topics#, it reminds me of #isms# of the #years#"`

14. I already added a bunch of grammars into a file called `grammar.json` and we can all look at it. What other descriptions can we add? We can use the [descriptions](https://github.com/dariusk/corpora/blob/master/data/humans/descriptions.json) list in corpora to help. You can copy those and later change them as you like.

15. Now we have to add in tracery to our project so we can use our grammars. Add tracery to your `package.json`:
```
    "tracery-grammar": "^2.7.3",
```
16. Copy into `server.js`: 
```
 var tracery = require('tracery-grammar'),
    rawGrammar = require('./grammar.json'), // the grammar for the bot, edit this!
    grammar = tracery.createGrammar(rawGrammar);
    grammar.addModifiers(tracery.baseEngModifiers); 
```
17. That's how you set up tracery. 
18. Create a function, `generateStatus` to generate the status from our tracery grammar.
```
const generateStatus => () {
  // Generate a new tweet using our grammar
  return ${grammar.flatten("#origin#")}; // make sure an "origin" entry is in your grammar.json file
}
```
19. Then in the `tweet` function, call it and tweet that status instead of Hello world. 
```
 var status = generateStatus();
 console.log(status);
 T.post('statuses/update', { status: status }, function(err, data, response) {
```

20. Set up a free service ([Cron Job](https://cron-job.org/), or [a similar one](https://www.google.com/search?q=free+web+cron)) to wake up your bot [every 25+ minutes](https://support.glitch.com/t/a-simple-twitter-bot-template/747/16) and tweet. Use `https://YOUR_PROJECT_NAME.glitch.me/BOT_ENDPOINT` as a URL to which to send the HTTP request. End-point = URL where someone / something can access your application.

### Part 2: Tweeting Images from ARTSY API!

Our bot is tweeting text but we want an image to accompany it. I'm going to delete the current cron job so it doesn't try to tweet while I'm working. First we have to get an image of an artwork from the Artsy API.

1. API = Application Programming Interface. More info in Q.A. What you need to know to continue is that it receives requests and sends responses. You can get data from it. Like we are getting random images of artwork from the ARTSY api. There are many different ways you can make a request (fetch data from a source, in this case the ARTSY api) in Node. We're going to use a module called request.
2. So we add to our `package.json`
```
    "request": "^2.85.0"
```
3. And to `server.js`
```
    var request = require('request');
```
4. Then we make the request in a function called `getArtwork`. All that's required to make a request is the URL and the callback function but the ARTSY api requires us to send some information to get some back. To get the ARTSY_TOKEN you sign up for an [ARTSY developer account](https://developers.artsy.net) and then follow the steps [here](https://developers.artsy.net/start). Then add it to your `.env` file.
```
const getArtwork = function() {
  request.get({
     url: 'https://api.artsy.net/api/artworks?sample', // url for getting random artwork images, if you put in your browser you'll get json back of a random artwork
     headers: { 
        'X-Xapp-Token': process.env.ARTSY_TOKEN,
        'Accept': 'application/vnd.artsy-v2+json'
     }
    },
    function (e, r, body) {
      let json = JSON.parse(body); // change to javascript object, makes it easier to manipulate and use
    });
}
  ```
5. Then we want to get what we need from the json (title, year) and download the image so we can tweet it. We create a download function.
```
const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

```
6. And then call it.
```
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
```
7. Then we add the title and year to the tweet.
```
function generateStatus(title, year) {
  // Generate a new tweet using our grammar
  return `${title}, ${year} \nme: ${grammar.flatten("#origin#")}`; // make sure an "origin" entry is in your grammar.json file
}
```
8. Now we have to tweet the image along with the text. We refer to the [twit](https://github.com/ttezel/twit) documentation, we scroll down and see how to post a tweet with media. 
```
T.post('media/upload', { media_data: b64content }, function (err, data, response) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string
  var altText = "Small flowers in a planter on a sunny balcony, blossoming."
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

  T.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var params = { status: 'loving life #nofilter', media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        console.log(data)
      })
    }
  })
})
```
9. We change this to match our bot andddddd we're done!
```
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
```
10. We just set up the cron-job again like we did before to have our bot tweeting regularly. 


## Q.A

1. What is env?  An environment variable is a KEY=value pair that contains information about 
the environment the app is being run in. For example, you can store a PORT variable (e.g PORT=3000) in .env which will specify which port the server should listen to properly work. You can also use it to store secret information. Whatever you put in your .env file will not be available to anyone who remixes your project although the rest of the code will. In Node.js, environment variables are made available through the global process.env object. You can read about it [here](https://codeburst.io/process-env-what-it-is-and-why-when-how-to-use-it-effectively-505d0b2831e7) and [here](https://www.twilio.com/blog/2017/08/working-with-environment-variables-in-node-js.html) You can find out what environment variables exist in glitch [here](https://glitch.com/faq#project)
2. [More on JSON](https://stackoverflow.com/questions/383692/what-is-json-and-why-would-i-use-it)
3. [APIs](What is an API? In English, please. – freeCodeCamp) You can find all sorts of APIs on [Programmable Web](https://www.programmableweb.com/)



You can find more tutorials and open source Twitter bots on [Botwiki](https://botwiki.org). Be sure to [join Botmakers](https://botmakers.org/) and [submit your bot to Botwiki](https://botwiki.org/submit-your-bot) :-)

(Make sure your bot follows [Twitter's rules](https://support.twitter.com/articles/18311-the-twitter-rules) and is overall [not a jerk](https://botwiki.org/articles/essays/).)


## More starter projects

For more bot starter projects on Glitch, check out the official [Botwiki page on Glitch](https://glitch.com/botwiki).

## Support Botwiki/Botmakers

- [patreon.com/botwiki](https://patreon.com/botwiki)
- [botwiki.org/about/support-us](https://botwiki.org/about/support-us)

🙇

**Powered by [Glitch](https://glitch.com)**

\ ゜o゜)ノ
