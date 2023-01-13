import React from "react";
import { Select, Option } from "./Select";
import "./Home.css";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: localStorage.language || null,
      room: localStorage.room || "",
      connecting: false,
    };
    // Define languages
    this.languages = [
      { name: "Arabic", id: "ar" },
      { name: "English", id: "en" },
      { name: "Portuguese", id: "pt" },
      { name: "Spanish", id: "es" },
    ];
    // Setup network
    this.network = props.network;
    this.network.onopen = () => {
      const { language, room } = this.state;
      localStorage.language = language;
      localStorage.room = room;
      this.network.send("join", { language, room });
      props.onConnect();
    };
    this.network.onerror = () => this.setState({ connecting: false });
  }

  connect = () => {
    this.setState({ connecting: true });
    this.network.connect("auto-translated-text");
  };

  render() {
    return (
      <>
        <h1 id="app-title">Auto-translated Chat</h1>
        <h2 id="label-select-lang">Select your language</h2>
        <Select id="lang-selector">
          {this.languages.map((lang, index) => (
            <Option
              key={index}
              text={lang.name}
              selected={this.state.language === lang.id}
              onClick={() => this.setState({ language: lang.id })}
            />
          ))}
        </Select>
        <div>
          <input
            id="room-input"
            className="input"
            type="text"
            placeholder="Room name"
            value={this.state.room}
            onInput={(e) => this.setState({ room: e.target.value.replace(" ", "") })}
          />
          <button
            id="join-btn"
            className="input button"
            disabled={!this.state.language || !this.state.room || this.state.connecting}
            onClick={this.connect}
          >
            Join
          </button>
        </div>
      </>
    );
  }
}
