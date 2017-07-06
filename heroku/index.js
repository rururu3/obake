const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const Twitter = require('twitter');

const app = express();
app.use(bodyParser.urlencoded({limit:'50mb', extended: false}))
app.use(bodyParser.json({limit:'50mb'}))

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// Cross-Origin Resource Sharing対応
app.use(cors());

// curl -H 'Content-Type:application/json' -H 'User-Agent:iPhone' -H 'Accept-Encoding:gzip,deflate' -d "{}" http://localhost:5000/statuses/update
app.post('/statuses/update', function(request, response, next) {
  let _client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: request.body.token,
    access_token_secret: request.body.secret,
  });

  console.log(request.body.imageData);
  let _wk = request.body.imageData.replace(/^data:image\/\w+;base64,/, "");
  let _buf = new Buffer(_wk, 'base64');

  // 画像をアップ
  _client.post('media/upload', {media: _buf})
  .then((media) => {
    console.log(media);
    _client.post('statuses/update', {
      status: request.body.message,
      media_ids: media.media_id_string,
    })
    .then((tweet) => {
      console.log(tweet);
      response.send(tweet);
    });
  })
  .catch((err) => {
    console.log(err);
    response.send(err);
  });
});

// 開始
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
