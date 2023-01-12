import { useState } from "react";
import { Select, Option } from "./Select";
import languages from "./languages";
import "./Home.css";

export default function Home(props) {
  // Network setup
  const network = props.network;
  network.onopen = () => props.onConnect(language);
  network.onerror = () => setConnecting(false);

  // Variables
  const [language, setLanguage] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Functions
  const connect = () => {
    setConnecting(true);
    network.connect("auto-translated-text");
  };

  const deleteMessages = () => {
    localStorage.messages = "[]";
    alert("All the messages were deleted!");
  };

  return (
    <>
      <h1 id="app-title">Auto-translated Chat</h1>
      <h2 id="label-select-lang">Select your language</h2>
      <Select id="lang-selector">
        {languages.map((lang, index) => (
          <Option
            key={index}
            text={lang.name}
            selected={language === lang.id}
            onClick={() => setLanguage(lang.id)}
          />
        ))}
      </Select>
      <button disabled={language === null || connecting} onClick={connect}>
        Join
      </button>
      <button id="delete-messages" onClick={deleteMessages}>
        <img src="trash.png" alt="trash" /> Delete messages
      </button>
    </>
  );
}
