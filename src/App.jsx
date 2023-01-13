import { useState } from "react";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Network from "./network";
import "./App.css";

const network = new Network();

export default function App() {
  const [connected, setConnected] = useState(false);

  return (
    <>
      {!connected && <Home network={network} onConnect={() => setConnected(true)} />}
      {connected && <Chat network={network} />}
    </>
  );
}
