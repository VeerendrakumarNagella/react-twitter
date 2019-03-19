'use strict';

//

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var passport = require('passport'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  request = require('request'),
  twitterConfig = require('./twitter.config.js');


var passportConfig = require('./passport');

//setup configuration for facebook login
passportConfig();

var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.route('/health-check').get(function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = function(auth) {
  console.log('------------create token ---------');
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  console.log('-------------generateToken------------');
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  console.log('-------------sendToken------------');
  return res.status(200).send(JSON.stringify(req.user));
};

router.route('/auth/twitter/reverse')
  .post(function(req, res) {
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
        consumer_key: twitterConfig.consumerKey,
        consumer_secret: twitterConfig.consumerSecret,
        accessToken_key: twitterConfig.accessTokenKey,
        accessToken_secret:twitterConfig.accessTokenSecret
      }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: e.message });
      }

      var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    });
  });

router.route('/auth/twitter')
  .post((req, res, next) => {
    request.post({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: twitterConfig.consumerKey,
        consumer_secret: twitterConfig.consumerSecret,
        accessToken_key: twitterConfig.accessTokenKey,
        accessToken_secret:twitterConfig.accessTokenSecret,
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    }, function (err, r, body) {
      if (err) {
        console.log('something went wrong');
        //return res.send(500, 'something went wrong');
      }

      const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      const parsedBody = JSON.parse(bodyString);

      req.body['oauth_token'] = parsedBody.oauth_token;
      req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
      req.body['user_id'] = parsedBody.user_id;

      next();
    });
  }, passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }

      // prepare token for API
      req.auth = {
        id: req.user.id
      };

      return next();
    }, generateToken, sendToken);

//token handling middleware
var authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

//var getCurrentUser = function(req, res, next) {
//   User.findById(req.auth.id, function(err, user) {
//     if (err) {
//       next(err);
//     } else {
//       req.user = user;
//       next();
//     }
//   });
// }; //

var getOne = function (req, res) {
  var user = req.user.toObject();

  delete user['twitterProvider'];
  delete user['__v'];

  res.json(user);
};

var tweets = function(text, callback) {
  console.log("Test: " + text);
  var twitterClient = new twitter(config);
  var response = [], dbData = []; // to store the tweets and sentiment

  console.log(1, twitterClient.search);

  twitterClient.search(text, {count: 500}, function(data) {

      console.log("Obiekt: " + data);

      for (var i = 0; i < data.statuses.length; i++) {
          var resp = {};


          resp.tweet = data.statuses[i];
          resp.sentiment = sentimentAnalysis(data.statuses[i].text);
          dbData.push({
              tweet: resp.tweet.text,
              score: resp.sentiment.score
          });
          response.push(resp);
      };
      db.sentiments.save(dbData);
      callback(response);
  });
}
app.use('/api/v1', router);
app.listen(4000);
module.exports = app;

console.log('Server running at http://localhost:4000/');





