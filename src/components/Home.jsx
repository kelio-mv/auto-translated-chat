import { useState } from "react";
import { Select, Option } from "./Select";
import "./Home.css";

export default function Home(props) {
  // Network setup
  const network = props.network;
  network.onopen = () => props.onConnect(language);
  network.onerror = () => setConnecting(false);

  // Variables
  const [language, setLanguage] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const languages = [
    { name: "English", id: "en" },
    { name: "Portuguese", id: "pt" },
    { name: "Arabic", id: "ar" },
  ];

  // Functions
  const connect = () => {
    setConnecting(true);
    network.connect("35.203.125.207");
  };

  return (
    <>
      <h1 id="app-title">Auto-translated Chat</h1>
      <h2 id="label-select-lang">Select your language</h2>
      <Select>
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
    </>
  );
}
