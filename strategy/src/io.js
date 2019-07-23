const net = require('net');

class IO {
  constructor(port) {
    this.port = port;

    this.onRead = this.onRead.bind(this);
  }

  async init(mainLoopFunction) {
    this.mainLoopFunction = mainLoopFunction;
    this.client = new net.Socket();
    this.client.setEncoding('utf8');
    this.client.connect(this.port, '127.0.0.1', () =>
      console.log('Socket is connected')
    );
    this.client.on('data', data =>
      data
        .split('\n')
        .filter(j => j)
        .forEach(this.onRead)
    );
    this.client.on('close', () => console.log('Connection close'));
    this.client.on('error', error => console.log('Connection error', error));
  }

  async onRead(data) {
    try {
      const input = JSON.parse(data);
      const output = await this.mainLoopFunction(input);
      this.client.write(JSON.stringify(output) + '\n');
    } catch (ex) {
      console.log(ex);
      process.exit(-1);
    }
  }
}

module.exports = new IO(1234);
