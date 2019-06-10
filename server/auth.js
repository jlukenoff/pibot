const btoa = require('btoa');
const passport = require('passport');
const { Users } = require('./database');

// Configure Passport
passport.use(
  new LocalStrategy((username, password, done) => {
    Users.findOne({ username }, (err, user) => {
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

export const validateAuth = (req, res, next) => {
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
    if (req.url.match(/\/login/)) {
      return res.redirect('/');
    }

    return next();
  }

  // allow non-session traffic to access login
  if (req.url.match(/\/login/)) {
    return next();
  }

  // otherwise redirect user to login page
  return res.redirect('/login');
};