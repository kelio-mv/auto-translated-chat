import Network from "./network.js";
import { translate, retranslate } from "./translate.js";

const getClients = (room) => network.clients.filter((c) => c.room === room);
const getMate = (client) => getClients(client.room).filter((c) => c !== client)[0];

const network = new Network();
network.onmessage = (client, message) => {
  const clientsInRoom = getClients(client.room);
  const mateClient = getMate(client);

  switch (message.tag) {
    case "join":
      client.language = message.content.language;
      client.room = message.content.room;
      break;

    case "is-mate-online":
      clientsInRoom.forEach((c) => c.send("mate-online", clientsInRoom.length === 2));
      break;

    case "input":
      if (clientsInRoom.length === 1) return;

      retranslate(message.content, client.language, mateClient.language).then((res) =>
        client.send("input-retranslated", res)
      );
      break;

    case "message":
      if (clientsInRoom.length === 1) return;

      translate(message.content, client.language, mateClient.language).then((res) => {
        const content = { original: message.content, translated: res };
        client.send("message", { fromMe: true, ...content });
        mateClient.send("message", { fromMe: false, ...content });
      });
      break;
  }
};

network.onclose = (client) => {
  getClients(client.room).forEach((c) => c.send("mate-online", false));
};

network.listen();
