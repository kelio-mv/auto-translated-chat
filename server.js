import Network from "./network.js";
import { translateText, retranslateText } from "./translate.js";

const getMate = (client) => network.clients.filter((c) => c !== client)[0];

const network = new Network();
network.onmessage = (client, message) => {
  switch (message.tag) {
    case "lang":
      client.lang = message.content;
      break;

    case "is-someone-online":
      if (network.clients.length === 2) {
        network.broadcast("someone-is-online");
      }
      break;

    case "input":
      retranslateText(message.content, client.lang, getMate(client).lang).then((res) =>
        client.send("input-retranslated", res)
      );
      break;

    case "message":
      client.send("message", { fromMe: true, text: message.content });
      translateText(message.content, client.lang, getMate(client).lang).then((res) =>
        getMate(client).send("message", { fromMe: false, text: res })
      );
      break;
  }
};
network.listen();
