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
          this.setState({ retranslation: content });
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

    setTimeout(() => {
      if (new Date().getTime() - this.lastInputTime > 1000) {
        if (value) {
          this.network.send("input", value);
          this.setState({ retranslation: "Loading ..." });
        } else {
          this.setState({ retranslation: null });
        }
      }
    }, 1000);
  };

  sendMessage = () => {
    const message = this.state.input.trim();
    if (message) {
      this.network.send("message", message);
      this.setState({ input: "" });
    }
  };

  render() {
    return (
      <>
        <div id="messages">
          {this.state.messages.map((message, index) => (
            <p key={index}>{message.text}</p>
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
