import { WebSocketServer } from "ws";

export default class Network {
  constructor(maxConnectedClients) {
    this.maxConnectedClients = maxConnectedClients || Infinity;
    this.defaultPort = 5000;
    this.clients = [];
    this.onconnection = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};
  }

  listen() {
    this.socket = new WebSocketServer({ port: this.defaultPort });
    console.log(`The WebSocket Server is running on port ${this.defaultPort}`);

    this.socket.on("connection", (socket) => {
      if (this.clients.length === this.maxConnectedClients) {
        console.log(
          `Connection rejected! Maximum connected clients is ${this.maxConnectedClients}.`
        );
        return;
      }

      console.log("A client has connected!");

      const client = {
        socket: socket,
        send: (tag, content) => {
          if (typeof tag !== "string") {
            console.log("[Network] Cannot send message! Tag parameter must be a string");
            return;
          }
          const message = JSON.stringify([tag, content]);
          socket.send(message);
          console.log(`\x1b[36m[Sent] ${message}\x1b[0m`);
        },
      };

      socket.on("message", (data) => {
        console.log(`\x1b[32m[Received] ${data.toString()}\x1b[0m`);
        const message = JSON.parse(data.toString());
        this.onmessage(client, { tag: message[0], content: message[1] });
      });

      socket.on("close", () => {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.onclose(client);
        console.log("A client has disconnected!");
      });
      // socket.on("error", () => {})
      this.clients.push(client);
      this.onconnection(client);
    });
  }

  broadcast(tag, content, exception) {
    this.clients.forEach((client) => {
      if (client !== exception) {
        client.send(tag, content);
      }
    });
  }
}
