const btoa = require('btoa');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const path = require('path');
const express = require('express');
const router = express.Router();
const parser = require('body-parser');
const { User } = require('./database');


// Configure Passport
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'incorrect username' });
      return user.comparePassword(password, (e, isMatch) => {
        if (e) return done(e);
        if (!isMatch) {
          return done(null, false, { message: 'incorrect password' });
        }
        return done(null, user);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Users.findOne({ _id: id }, (err, user) => done(err, user));
});

const validateAuth = (req, res, next) => {
  // api routes - check basic auth
  if (req.url.match(/add-user/)) {
    const { AUTH_STRING } = process.env;
    const { authorization: authString } = req.headers;

    if (authString === `Basic ${btoa(AUTH_STRING)}`) {
      return next();
    }
    return res.status(401).send('Unauthorized');
  }

  // validate sessions
  if (req.user) {
    if (req.url.match(/\/auth/)) {
      return res.redirect('/');
    }

    return next();
  }

  // allow non-session traffic to access login
  if (req.url.match(/\/auth/)) {
    console.log('directing to login page');
    return next();
  }

  // otherwise redirect user to login page
  return res.redirect('/auth');
};

router.put('/', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

router.get('/login', validateAuth, (req, res) => {
  const loginHtmlPath = path.resolve(__dirname, '../public/login.html');
  return res.sendFile(loginHtmlPath);
});

router.post('/', parser.json(), validateAuth, (req, res) => {
  const { username, password } = req.body;
  const newUser = new Users({ username, password });

  newUser.save();

  res.send('success');
});

module.exports = router;