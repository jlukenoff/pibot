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

app.get('/', (req, res) => {
  res.end('request received');
});

const port = process.env.PORT || 3000;

io.on('connection', client => {
  client.on('key', direction => {
    console.log('direction received', direction);
    client.emit('keySuccess', direction);
    if (direction === 'UP') {
      setTimeout(() => {
        motorRight.servoWrite(2000);
        motorLeft.servoWrite(600);
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
