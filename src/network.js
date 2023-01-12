export default class Network {
  constructor() {
    // this.defaultPort = 5000;
    this.connected = false;
    this.connecting = false;
    this.onopen = () => {};
    this.onerror = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
    setInterval(this.checkState, 3000);
  }

  connect = (address, port) => {
    if (this.connecting) {
      console.log("[Network] Please wait! You are already connecting.");
      return;
    }
    this.connecting = true;
    this.address = `wss://${address}.glitch.me/`;
    this.socket = new WebSocket(this.address);
    this.socket.onopen = this._onopen;
    this.socket.onmessage = this._onmessage;
    this.socket.onerror = this._onerror;
    // this.address = `ws://${address}:${port || this.defaultPort}`;
    // this.socket = new WebSocket(this.address);
  };

  _onopen = () => {
    console.log(`[Network] Connected to ${this.address}`);
    this.connected = true;
    this.connecting = false;
    this.onopen();
  };

  _onerror = () => {
    console.log("[Network] Connection error!");
    this.connecting = false;
    this.onerror();
  };

  _onmessage = (event) => {
    // console.log(`[Received] ${event.data}`)
    this.onmessage(...JSON.parse(event.data));
  };

  checkState = () => {
    if (this.connected && this.socket.readyState !== this.socket.OPEN) {
      console.log("[Network] Connection lost.");
      this.connected = false;
      this.onclose();
    }
  };

  send = (tag, content) => {
    this.checkState();

    if (!this.connected) {
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
