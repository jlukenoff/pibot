import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import { Container, InputField } from '../Styles/Styles';

const socket = openSocket('http://10.0.0.180:3001');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      direction: 'NO DIRECTION YET',
    };

    socket.on('keySuccess', direction => {
      console.log('direction at keySuccess:', direction);
      this.setState({ direction });
    });

    // this.handleKeyDown = this.handleKeyDown.bind(this);
    // this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(e) {
    let direction = '';
    if (e.which === 37) {
      direction = 'LEFT';
    } else if (e.which === 38) {
      direction = 'UP';
    } else if (e.which === 39) {
      direction = 'RIGHT';
    } else if (e.which === 40) {
      direction = 'DOWN';
    } else {
      return;
    }
    return socket.emit('keyDown', direction);
  }

  handleKeyUp(e) {
    let direction = '';
    if (e.which === 37) {
      direction = 'LEFT';
    } else if (e.which === 38) {
      direction = 'UP';
    } else if (e.which === 39) {
      direction = 'RIGHT';
    } else if (e.which === 40) {
      direction = 'DOWN';
    }
    return socket.emit('keyUp', direction);
  }

  render() {
    const {
      state: { direction },
    } = this;
    return (
      <Container onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp}>
        <img src="http://10.0.0.180:8000/stream.mjpg" width="640" height="480" />
        <InputField type="text" autoFocus/>

      </Container>
    );
  }
}

// App.propTypes = {
// };

export default App;
