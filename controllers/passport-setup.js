const passport = require('passport');
const UserModel = require('../models/userModel.js');
const jwt = require('jsonwebtoken');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // replace with your client id
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // replace with your client secret
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true //password required for callback
},
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      let existingUser = await UserModel.findOne({ 'google.id': profile.id });
      // if user exists return the user
      if (existingUser) {
        console.log(`Found user. Google ID: ${existingUser.google.id}`);
        return done(null, existingUser);
      }
      // if user does not exist create a new user
      console.log('Creating new user...');
      const newUser = new UserModel({
        username: profile.displayName,
        'google.id': profile.id
      });
      await newUser.save();

      //pass user/id to callback function

      return done(null, newUser);
    } catch (error) {
      return done(error, false)
    }
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});