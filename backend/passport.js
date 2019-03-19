'use strict';

var passport = require('passport'),
  TwitterTokenStrategy = require('passport-twitter-token'),
  //User = require('mongoose').model('User'),
  twitterConfig = require('./twitter.config.js');

module.exports = function () {

  passport.use(new TwitterTokenStrategy({
      consumerKey: twitterConfig.consumerKey,
      consumerSecret: twitterConfig.consumerSecret,
      accessTokenKey: twitterConfig.accessTokenKey,
      accessTokenSecret:twitterConfig.accessTokenSecret,
      includeEmail: true
    },
    function (token, tokenSecret, profile, done) {
      //console.log(profile)
      done(null, profile);
    }));
};
