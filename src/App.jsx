import { useState } from "react";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Network from "./network";
import "./App.css";

const network = new Network();

export default function App() {
  const [connected, setConnected] = useState(false);
  const [language, setLanguage] = useState(null);

  return (
    <>
      {!connected && (
        <Home
          network={network}
          onConnect={(lang) => {
            network.send("lang", lang);
            setLanguage(lang);
            setConnected(true);
          }}
        />
      )}
      {connected && <Chat network={network} language={language} />}
    </>
  );
}
