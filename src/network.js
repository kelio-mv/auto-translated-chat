export default class Network {
  constructor() {
    // this.defaultPort = 5000;
    this.active = false;
    this.onopen = () => {};
    this.onerror = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
    setInterval(this.checkState, 3000);
  }

  connect = (address, port) => {
    // this.address = `ws://${address}:${port || this.defaultPort}`;
    // this.socket = new WebSocket(this.address);
    this.address = `wss://${address}.glitch.me/`;
    this.socket = new WebSocket(this.address);
    this.socket.onopen = this._onopen;
    this.socket.onmessage = this._onmessage;
    this.socket.onerror = this._onerror;
  };

  _onopen = () => {
    console.log(`[Network] Connected to ${this.address}`);
    this.active = true;
    this.onopen();
  };

  _onerror = () => {
    console.log("[Network] Connection error!");
    this.onerror();
  };

  _onmessage = (event) => {
    // console.log(`[Received] ${event.data}`)
    this.onmessage(...JSON.parse(event.data));
  };

  checkState = () => {
    if (this.active && this.socket.readyState !== this.socket.OPEN) {
      console.log("[Network] Connection lost.");
      this.active = false;
      this.onclose();
    }
  };

  send = (tag, content) => {
    this.checkState();

    if (!this.active) {
      console.log("[Network] Please connect to a server before sending messages!");
      return;
    }
    if (typeof tag !== "string") {
      console.log("[Network] Cannot send message! Tag parameter must be a string");
      return;
    }
    const message = JSON.stringify([tag, content]);
    this.socket.send(message);
    // console.log(`[Sent] ${message}`)
  };
}
