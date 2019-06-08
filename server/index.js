const express = require('express');
const path = require('path');
const Gpio = require('pigpio').Gpio;
const io = require('socket.io')();
const { spawn } = require('child_process');

const camServer = spawn('python3 picam_server.py', {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit',
})

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
