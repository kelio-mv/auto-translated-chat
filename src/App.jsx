import { useState, useEffect } from "react";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Network from "./network";
import "./App.css";

const network = new Network();

export default function App() {
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  const [connected, setConnected] = useState(false);
  let language;

  return (
    <>
      {!connected && (
        <Home
          network={network}
          onConnect={(lang) => {
            language = lang;
            network.send("lang", language);
            setConnected(true);
          }}
        />
      )}
      {connected && <Chat network={network} language={language} />}
    </>
  );
}
