require('dotenv').config();
const express = require('express');
const path = require('path');
const parser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const btoa = require('btoa');
const { Users } = require('./database');
const Gpio = require('pigpio').Gpio;
const io = require('socket.io')();
const { spawn } = require('child_process');

const STATIC_DIR = path.resolve(__dirname, '../public');

const { env: { SESSION_SECRET }} = process;

// start picam server
const camServer = spawn('python3 picam_server.py', {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit',
})

// gpio setup
let motorRight = null;
let motorLeft = null;

try {
  motorRight = new Gpio(17, { mode: Gpio.OUTPUT });
  motorLeft = new Gpio(22, { mode: Gpio.OUTPUT });
} catch (err) {
  console.log('error initializing gpio:', err);
}

// set up express server
const app = express();

app.use(session({ secret: SESSION_SECRET || 'bellatheball', resave: false, saveUnitialized: true}));

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(passport.initialize());
app.use(passport.session());

// app.use('/auth', require('./auth'));
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


app.use(express.static(path.resolve(__dirname, '../public')));

io.on('connection', client => {
  client.on('keyDown', direction => {
    if (direction === 'UP') {
      motorLeft.servoWrite(2500);
      motorRight.servoWrite(500);
    }
    if (direction === 'DOWN') {
      motorLeft.servoWrite(1000);
      motorRight.servoWrite(2000);
    }
    if (direction === 'LEFT') {
      motorRight.servoWrite(1000);
      motorLeft.servoWrite(1000);
    }
    if (direction === 'RIGHT') {
      motorLeft.servoWrite(2000);
      motorRight.servoWrite(2000);
    }
  });

  client.on('keyUp', (direction) => {
    motorLeft.servoWrite(0);
    motorRight.servoWrite(0);
  })
});

const port = process.env.PORT || 3000;
const ioPort = process.env.IO_PORT || port + 1;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    io.listen(port + 1);
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { server: app };
