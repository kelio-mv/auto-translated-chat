import React from "react";
import "./Chat.css";

export default class Chat extends React.Component {
  constructor(props) {
    super();
    this.network = props.network;
    this.state = {
      messages: [],
      chatEnabled: false,
      input: "",
      retranslation: null,
    };
    this.lastInputTime = null;
  }

  componentDidMount() {
    this.network.onmessage = (tag, content) => {
      switch (tag) {
        case "someone-is-online":
          this.setState({ chatEnabled: true });
          break;

        case "input-retranslated":
          if (this.state.input.trim()) {
            this.setState({ retranslation: content });
          }
          break;

        case "message":
          this.setState({ messages: [...this.state.messages, content] });
      }
    };
    this.network.send("is-someone-online");
  }

  handleInput = (e) => {
    this.setState({ input: e.target.value });
    const value = e.target.value.trim();
    this.lastInputTime = new Date().getTime();

    if (!value) {
      this.setState({ retranslation: null });
      return;
    }

    setTimeout(() => {
      if (new Date().getTime() - this.lastInputTime > 1000) {
        this.network.send("input", value);
        this.setState({ retranslation: "Loading ..." });
      }
    }, 1000);
  };

  sendMessage = () => {
    const message = this.state.input.trim();
    if (message) {
      this.network.send("message", message);
      this.setState({ input: "", retranslation: null });
    }
  };

  render() {
    return (
      <>
        <div id="messages">
          {this.state.messages.map((message, index) => (
            <div className={"message " + (message.fromMe ? "from-me" : "")} key={index}>
              {message.text}
            </div>
          ))}
        </div>
        {this.state.retranslation && <div id="retranslation">{this.state.retranslation}</div>}
        <div id="input-area">
          <input
            id="message-input"
            type="text"
            placeholder={
              this.state.chatEnabled ? "Message..." : "Waiting for someone to join the chat..."
            }
            value={this.state.input}
            onInput={this.handleInput}
            disabled={!this.state.chatEnabled}
          ></input>
          <div id="send-message-btn" onClick={this.sendMessage}>
            <img src="send.png" alt="send message" />
          </div>
        </div>
      </>
    );
  }
}
