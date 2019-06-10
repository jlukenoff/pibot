require('dotenv').config();
const express = require('express');
const path = require('path');
const parser = require('body-parser');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
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

app.use(express.static(path.resolve(__dirname, '../public')));

const port = process.env.PORT || 3000;

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

const server = app.listen(port, () => {
  io.listen(port + 1);
  console.log(`Server running on port ${port}`);
});

if (process.env.NODE_ENV === 'test') server.close();

module.exports = { server };
