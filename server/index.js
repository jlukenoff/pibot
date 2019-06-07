const express = require('express');
const path = require('path');
const Gpio = require('pigpio').Gpio;
const io = require('socket.io')();

let motorRight = null;
let motorLeft = null;
try {
  motorRight = new Gpio(17, { mode: Gpio.OUTPUT });
  motorLeft = new Gpio(22, { mode: Gpio.OUTPUT });
} catch (err) {
  console.log('error:', err);
}

const app = express();

app.use(express.static(path.resolve(__dirname, '../public')));

const port = process.env.PORT || 3000;

io.on('connection', client => {
  client.on('key', direction => {
    console.log('direction received', direction);
    client.emit('keySuccess', direction);
    if (direction === 'DOWN') {
      motorRight.servoWrite(2000);
      motorLeft.servoWrite(600);
      return setTimeout(() => {
        motorRight.servoWrite(0);
        motorLeft.servoWrite(0);
      }, 500);
    }
    if (direction === 'UP') {
      motorRight.servoWrite(600);
      motorLeft.servoWrite(2000);
      return setTimeout(() => {
        motorRight.servoWrite(0);
        motorLeft.servoWrite(0);
      }, 500);
    }
    if (direction === 'LEFT') {
      motorRight.servoWrite(2000);
      return setTimeout(() => {
        motorRight.servoWrite(0);
      }, 500);
    }
    if (direction === 'RIGHT') {
      motorLeft.servoWrite(2000);
      return setTimeout(() => {
        motorLeft.servoWrite(0);
      }, 500);
    }
  });
});

const server = app.listen(port, () => {
  io.listen(port + 1);
  console.log(`Server running on port ${port}`);
});

if (process.env.NODE_ENV === 'test') server.close();

module.exports = { server };
